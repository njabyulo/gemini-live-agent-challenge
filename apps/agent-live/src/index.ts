import { createServer } from "node:http";

import { INPUT_AUDIO_MIME_TYPE } from "@agent-tutor/shared/consts";
import {
  SBrowserEvent,
  type ILiveLessonGrounding,
  type IRuntimeSnapshot,
  type TServerErrorEvent,
  type TServerStatusEvent,
} from "@agent-tutor/shared/types";
import { WebSocketServer } from "ws";

import { createLiveTutorSession } from "./workflows/createLiveTutorSession.js";

const port = Number(process.env.PORT ?? 8080);

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

const wss = new WebSocketServer({ path: "/live", server });

wss.on("connection", (socket) => {
  let session: Awaited<ReturnType<typeof createLiveTutorSession>> | null = null;
  let startEvent:
    | import("@agent-tutor/shared/types").TBrowserStartEvent
    | null = null;
  let currentContext: IRuntimeSnapshot = {
    command: "",
    sourceCode: "",
    stderr: "",
    stdout: "",
  };
  let currentLesson: ILiveLessonGrounding | null = null;

  const sendJson = (payload: object): void => {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  };

  socket.on("message", async (raw) => {
    try {
      const parsed = SBrowserEvent.parse(JSON.parse(raw.toString()));

      if (parsed.type === "start") {
        startEvent = parsed;
        currentLesson = parsed.lesson;
        currentContext = {
          command: parsed.command,
          sourceCode: parsed.sourceCode,
          stderr: parsed.stderr,
          stdout: parsed.stdout,
        };
        session = await createLiveTutorSession({
          getCurrentContext: () => currentContext,
          socket,
          startEvent: parsed,
        });
        return;
      }

      if (!session || !startEvent) {
        sendJson({
          type: "error",
          message: "Live session has not started yet.",
        } satisfies TServerErrorEvent);
        return;
      }

      if (parsed.type === "audio") {
        session.sendRealtimeInput({
          audio: {
            data: parsed.data,
            mimeType: INPUT_AUDIO_MIME_TYPE,
          },
        });
        sendJson({
          type: "status",
          phase: "listening",
        } satisfies TServerStatusEvent);
        return;
      }

      if (parsed.type === "audio_end") {
        session.sendRealtimeInput({ audioStreamEnd: true });
        sendJson({
          type: "status",
          phase: "thinking",
        } satisfies TServerStatusEvent);
        return;
      }

      if (parsed.type === "text") {
        const lessonContext = currentLesson
          ? [
              "Current lesson context:",
              `Course: ${currentLesson.courseTitle}`,
              `Section: ${currentLesson.sectionTitle}`,
              `Lesson: ${currentLesson.lessonTitle}`,
              `Summary: ${currentLesson.summary}`,
              `Concept: ${currentLesson.concept}`,
              `Why it matters: ${currentLesson.whyItMatters}`,
              `Objective: ${currentLesson.objective}`,
              `Task: ${currentLesson.task}`,
              `Checker expects: ${currentLesson.checkerExpects}`,
              `Common failure: ${currentLesson.commonFailure}`,
              currentLesson.constraints.length
                ? `Constraints: ${currentLesson.constraints.join(" | ")}`
                : "Constraints: none",
              currentLesson.hints.length
                ? `Hints: ${currentLesson.hints.join(" | ")}`
                : "Hints: none",
              currentLesson.references.length
                ? `Refreshers: ${currentLesson.references.join(" | ")}`
                : "Refreshers: none",
            ].join("\n")
          : [
              "Current lesson context:",
              `Lesson: ${startEvent.lessonId}`,
              `Course: ${startEvent.courseId}`,
            ].join("\n");

        const contextualPrompt = [
          "Learner question:",
          parsed.text,
          "",
          lessonContext,
          "",
          "Current runtime context:",
          `Latest command: ${currentContext.command || "No command run yet."}`,
          "Current /workspace/main.py:",
          currentContext.sourceCode || "Source code is empty.",
          currentContext.stdout
            ? `Latest stdout:\n${currentContext.stdout}`
            : "Latest stdout is empty.",
          currentContext.stderr
            ? `Latest stderr:\n${currentContext.stderr}`
            : "Latest stderr is empty.",
          "",
          "Answer the learner's question using the lesson teaching context, the screenshot if available, and the current runtime context.",
          "If helpful, explain the concept in plain language before giving the next concrete debugging step.",
        ].join("\n");

        session.sendRealtimeInput({ text: contextualPrompt });
        sendJson({
          type: "status",
          phase: "thinking",
        } satisfies TServerStatusEvent);
        return;
      }

      if (parsed.type === "image") {
        session.sendRealtimeInput({
          video: {
            data: parsed.data,
            mimeType: "image/jpeg",
          },
        });
        sendJson({
          type: "status",
          phase: "thinking",
        } satisfies TServerStatusEvent);
        return;
      }

      if (parsed.type === "context") {
        currentLesson = parsed.lesson;
        currentContext = {
          command: parsed.command,
          sourceCode: parsed.sourceCode,
          stderr: parsed.stderr,
          stdout: parsed.stdout,
        };
        sendJson({
          type: "status",
          phase: "ready",
        } satisfies TServerStatusEvent);
        return;
      }

      if (parsed.type === "interrupt") {
        try {
          session.sendRealtimeInput({ activityEnd: true });
        } catch {
          // noop
        }
        sendJson({ type: "interrupted" });
        sendJson({
          type: "status",
          phase: "listening",
        } satisfies TServerStatusEvent);
        return;
      }

      if (parsed.type === "stop") {
        session.close();
        session = null;
        startEvent = null;
        currentLesson = null;
        currentContext = {
          command: "",
          sourceCode: "",
          stderr: "",
          stdout: "",
        };
        sendJson({
          type: "status",
          phase: "ready",
        } satisfies TServerStatusEvent);
      }
    } catch (error) {
      sendJson({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Invalid browser event payload.",
      } satisfies TServerErrorEvent);
    }
  });

  socket.on("close", () => {
    session?.close();
  });
});

server.listen(port, () => {
  console.log(`[agent-live] listening on http://127.0.0.1:${port}`);
});
