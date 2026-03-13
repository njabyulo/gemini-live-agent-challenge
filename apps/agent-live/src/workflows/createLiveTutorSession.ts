import { GoogleGenAI, Modality } from "@google/genai";
import {
  DEFAULT_LIVE_MODEL,
  OUTPUT_AUDIO_MIME_TYPE,
} from "@agent-tutor/shared/consts";
import type {
  IFunctionCallResult,
  IRuntimeSnapshot,
  TBrowserStartEvent,
  TServerAudioOutEvent,
  TServerErrorEvent,
  TServerInputTranscriptEvent,
  TServerOutputTranscriptEvent,
  TServerStatusEvent,
  TServerSummaryEvent,
} from "@agent-tutor/shared/types";
import type { WebSocket } from "ws";

import { LIVE_TUTOR_SYSTEM_INSTRUCTION } from "../lib/tutor-instructions.js";
import { getLessonContext } from "../tools/getLessonContext.js";
import { getRuntimeSnapshot } from "../tools/getRuntimeSnapshot.js";

type TLiveSession = Awaited<ReturnType<GoogleGenAI["live"]["connect"]>>;

interface ILiveFunctionCall {
  id?: string;
  name: string;
  args?: {
    command?: string;
    courseId?: string;
    lessonId?: string;
    sourceCode?: string;
    stderr?: string;
    stdout?: string;
  };
}

interface ILiveServerMessage {
  serverContent?: {
    inputTranscription?: { text?: string };
    interrupted?: boolean;
    modelTurn?: {
      parts?: Array<{
        inlineData?: {
          data?: string;
          mimeType?: string;
        };
        text?: string;
      }>;
    };
    outputTranscription?: { text?: string };
  };
  toolCall?: {
    functionCalls?: ILiveFunctionCall[];
  };
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "v1alpha",
  },
});

const sendJson = (socket: WebSocket, payload: object): void => {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

export const createLiveTutorSession = async ({
  getCurrentContext,
  socket,
  startEvent,
}: {
  getCurrentContext: () => IRuntimeSnapshot;
  socket: WebSocket;
  startEvent: TBrowserStartEvent;
}): Promise<TLiveSession> => {
  sendJson(socket, {
    type: "status",
    phase: "connecting",
  } satisfies TServerStatusEvent);

  const session = await ai.live.connect({
    model: process.env.GEMINI_LIVE_MODEL ?? DEFAULT_LIVE_MODEL,
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: LIVE_TUTOR_SYSTEM_INSTRUCTION,
      tools: [
        {
          functionDeclarations: [
            {
              name: "get_lesson_context",
              description: "Return the current Python lesson context.",
              parametersJsonSchema: {
                type: "object",
                properties: {
                  courseId: { type: "string" },
                  lessonId: { type: "string" },
                },
                required: ["courseId", "lessonId"],
              },
            },
            {
              name: "get_runtime_snapshot",
              description:
                "Return the latest source code and runtime output from the workspace.",
              parametersJsonSchema: {
                type: "object",
                properties: {
                  command: { type: "string" },
                  sourceCode: { type: "string" },
                  stderr: { type: "string" },
                  stdout: { type: "string" },
                },
              },
            },
          ],
        },
      ],
    },
    callbacks: {
      onmessage: async (message) => {
        const liveMessage = message as ILiveServerMessage;

        if (liveMessage.serverContent?.inputTranscription?.text) {
          sendJson(socket, {
            type: "input_transcript",
            text: liveMessage.serverContent.inputTranscription.text,
          } satisfies TServerInputTranscriptEvent);
        }

        if (liveMessage.serverContent?.outputTranscription?.text) {
          const transcript = liveMessage.serverContent.outputTranscription.text;

          sendJson(socket, {
            type: "output_transcript",
            text: transcript,
          } satisfies TServerOutputTranscriptEvent);

          if (/ready|submit|works now|looks good/iu.test(transcript)) {
            sendJson(socket, {
              type: "summary",
              text: transcript,
            } satisfies TServerSummaryEvent);
          }
        }

        if (liveMessage.serverContent?.interrupted) {
          sendJson(socket, { type: "interrupted" });
        }

        const parts = liveMessage.serverContent?.modelTurn?.parts ?? [];
        for (const part of parts) {
          if (!part.inlineData?.data) {
            continue;
          }

          sendJson(socket, {
            type: "audio_out",
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType ?? OUTPUT_AUDIO_MIME_TYPE,
          } satisfies TServerAudioOutEvent);
        }

        if (!liveMessage.toolCall?.functionCalls?.length) {
          return;
        }

        const functionResponses = liveMessage.toolCall.functionCalls.map(
          (
            functionCall,
          ): {
            id: string;
            name: string;
            response: { result: IFunctionCallResult };
          } => {
            const args = functionCall.args ?? {};
            let result: IFunctionCallResult = {};

            if (functionCall.name === "get_lesson_context") {
              result = {
                lesson: getLessonContext({
                  courseId: args.courseId ?? startEvent.courseId,
                  lessonId: args.lessonId ?? startEvent.lessonId,
                }),
              };
            }

            if (functionCall.name === "get_runtime_snapshot") {
              const currentRuntime = getCurrentContext();
              result = {
                runtime: getRuntimeSnapshot({
                  command: args.command ?? currentRuntime.command,
                  sourceCode: args.sourceCode ?? currentRuntime.sourceCode,
                  stderr: args.stderr ?? currentRuntime.stderr,
                  stdout: args.stdout ?? currentRuntime.stdout,
                }),
              };
            }

            return {
              id: functionCall.id ?? functionCall.name,
              name: functionCall.name,
              response: { result },
            };
          },
        );

        session.sendToolResponse({ functionResponses });
      },
      onerror: (error: unknown) => {
        sendJson(socket, {
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Gemini Live session failed.",
        } satisfies TServerErrorEvent);
      },
    },
  });

  sendJson(socket, { type: "ready" });
  sendJson(socket, {
    type: "status",
    phase: "ready",
  } satisfies TServerStatusEvent);

  return session;
};
