import { GoogleGenAI, Modality } from "@google/genai";
import {
  DEFAULT_LIVE_MODEL,
  OUTPUT_AUDIO_MIME_TYPE,
} from "@agent-tutor/shared/consts";
import type {
  IFunctionCallResult,
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
import { getLatestTestOutput } from "../tools/getLatestTestOutput.js";

type LiveSession = Awaited<ReturnType<GoogleGenAI["live"]["connect"]>>;

interface ILiveFunctionCall {
  id?: string;
  name: string;
  args?: {
    courseId?: string;
    lessonId?: string;
    testStateId?: "state-1" | "state-2" | "state-3";
    terminalOutput?: string;
  };
}

interface ILiveServerMessage {
  serverContent?: {
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    interrupted?: boolean;
    modelTurn?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          data?: string;
          mimeType?: string;
        };
      }>;
    };
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
  socket,
  startEvent,
}: {
  socket: WebSocket;
  startEvent: TBrowserStartEvent;
}): Promise<LiveSession> => {
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
              description: "Return the current lesson context.",
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
              name: "get_latest_test_output",
              description: "Return the current failing or passing test state.",
              parametersJsonSchema: {
                type: "object",
                properties: {
                  testStateId: { type: "string" },
                  terminalOutput: { type: "string" },
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
          sendJson(socket, {
            type: "output_transcript",
            text: liveMessage.serverContent.outputTranscription.text,
          } satisfies TServerOutputTranscriptEvent);
        }

        if (liveMessage.serverContent?.interrupted) {
          sendJson(socket, { type: "interrupted" });
        }

        const parts = liveMessage.serverContent?.modelTurn?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            sendJson(socket, {
              type: "audio_out",
              data: part.inlineData.data,
              mimeType: part.inlineData.mimeType ?? OUTPUT_AUDIO_MIME_TYPE,
            } satisfies TServerAudioOutEvent);
          }

          if (part.text?.toLowerCase().includes("ready")) {
            sendJson(socket, {
              type: "summary",
              text: part.text,
            } satisfies TServerSummaryEvent);
          }
        }

        if (liveMessage.toolCall?.functionCalls?.length) {
          const functionResponses = liveMessage.toolCall.functionCalls.map(
            (functionCall: ILiveFunctionCall) => {
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

              if (functionCall.name === "get_latest_test_output") {
                result = {
                  testState: getLatestTestOutput({
                    testStateId: args.testStateId ?? startEvent.testStateId,
                    terminalOutput:
                      args.terminalOutput ?? startEvent.terminalOutput,
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
        }
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

  session.sendClientContent({
    turns: [
      {
        role: "user",
        parts: [
          {
            text: [
              "This learner is in a guided coding lesson.",
              `Course: ${startEvent.courseId}`,
              `Lesson: ${startEvent.lessonId}`,
              startEvent.terminalOutput
                ? `Current test output:\n${startEvent.terminalOutput}`
                : "No terminal output provided yet.",
            ].join("\n\n"),
          },
        ],
      },
    ],
    turnComplete: false,
  });

  sendJson(socket, { type: "ready" });
  sendJson(socket, {
    type: "status",
    phase: "ready",
  } satisfies TServerStatusEvent);

  return session;
};
