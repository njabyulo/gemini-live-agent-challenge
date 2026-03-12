import { createServer } from "node:http";

import { INPUT_AUDIO_MIME_TYPE } from "@agent-tutor/shared/consts";
import {
  SBrowserEvent,
  type TBrowserStartEvent,
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

const wss = new WebSocketServer({ server, path: "/live" });

wss.on("connection", (socket) => {
  let session: Awaited<ReturnType<typeof createLiveTutorSession>> | null = null;
  let startEvent: TBrowserStartEvent | null = null;

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
        session = await createLiveTutorSession({ socket, startEvent: parsed });
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
        session.sendRealtimeInput({ text: parsed.text });
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
