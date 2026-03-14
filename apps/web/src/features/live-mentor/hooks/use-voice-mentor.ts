"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AgentLiveClient } from "../services/agent-live-client";
import { getAgentLiveWebSocketUrl } from "../services/api-client";
import { useLiveMentorStore } from "../states/use-live-mentor-store";
import type { ILiveMentorAudioRefs } from "../types";
import {
  bytesToBase64,
  downsampleBuffer,
  float32To16BitPCM,
  playAudioChunk,
  stopAudioPlayback,
} from "../utils/audio";

export function useVoiceMentor({
  captureWorkspaceImage,
}: {
  captureWorkspaceImage?: () => Promise<string | null>;
} = {}) {
  const clientRef = useRef<AgentLiveClient | null>(null);
  const isConnectingRef = useRef(false);
  const audioRefs = useRef<ILiveMentorAudioRefs>({
    audioContext: null,
    outputSource: null,
    processor: null,
    sourceNode: null,
    stream: null,
  });
  const lastSyncedContextRef = useRef("");
  const pendingImageRef = useRef<string | null>(null);
  const pendingPromptRef = useRef<string | null>(null);
  const suppressAssistantUntilNextTurnRef = useRef(false);
  const isStreamingTurnRef = useRef(false);
  const silenceTimeoutRef = useRef<number | null>(null);
  const canStreamAudioRef = useRef(false);
  const [inputLevel, setInputLevel] = useState(0);

  const contextVersion = useLiveMentorStore((state) => state.contextVersion);
  const isCapturingAudio = useLiveMentorStore(
    (state) => state.isCapturingAudio,
  );
  const isSessionLive = useLiveMentorStore((state) => state.isSessionLive);
  const lesson = useLiveMentorStore((state) => state.lesson);
  const runtime = useLiveMentorStore((state) => state.runtime);
  const sessionPhase = useLiveMentorStore((state) => state.sessionPhase);
  const transcripts = useLiveMentorStore((state) => state.transcripts);
  const typedPrompt = useLiveMentorStore((state) => state.typedPrompt);
  const appendTranscript = useLiveMentorStore(
    (state) => state.appendTranscript,
  );
  const setIsCapturingAudio = useLiveMentorStore(
    (state) => state.setIsCapturingAudio,
  );
  const setIsSessionLive = useLiveMentorStore(
    (state) => state.setIsSessionLive,
  );
  const setSessionPhase = useLiveMentorStore((state) => state.setSessionPhase);
  const setTypedPrompt = useLiveMentorStore((state) => state.setTypedPrompt);
  const syncCurrentContext = useLiveMentorStore(
    (state) => state.syncCurrentContext,
  );

  const stopAudioCapture = useCallback(() => {
    if (silenceTimeoutRef.current) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    canStreamAudioRef.current = false;
    isStreamingTurnRef.current = false;
    setInputLevel(0);
    audioRefs.current.processor?.disconnect();
    audioRefs.current.sourceNode?.disconnect();
    audioRefs.current.stream?.getTracks().forEach((track) => track.stop());
    audioRefs.current.processor = null;
    audioRefs.current.sourceNode = null;
    audioRefs.current.stream = null;
    setIsCapturingAudio(false);
  }, [setIsCapturingAudio]);

  const shareWorkspaceImage = useCallback(
    async (imageData?: string | null) => {
      const data = imageData ?? (await captureWorkspaceImage?.()) ?? null;
      if (!data) {
        return false;
      }

      if (!clientRef.current?.isOpen()) {
        pendingImageRef.current = data;
        return true;
      }

      clientRef.current.send({
        type: "image",
        data,
      });
      return true;
    },
    [captureWorkspaceImage],
  );

  const finishActiveAudioTurn = useCallback(async () => {
    if (!clientRef.current?.isOpen() || !isStreamingTurnRef.current) {
      return;
    }

    isStreamingTurnRef.current = false;
    await shareWorkspaceImage();
    clientRef.current.send({ type: "audio_end" });
    setSessionPhase("thinking");
  }, [setSessionPhase, shareWorkspaceImage]);

  const sendContextUpdate = useCallback(() => {
    if (!clientRef.current?.isOpen() || !lesson) {
      return;
    }

    const fingerprint = JSON.stringify({
      contextVersion,
      lessonId: lesson.lessonId,
      ...runtime,
    });

    if (fingerprint === lastSyncedContextRef.current) {
      return;
    }

    lastSyncedContextRef.current = fingerprint;
    clientRef.current.send({
      type: "context",
      lessonId: lesson.lessonId,
      ...runtime,
    });
  }, [contextVersion, lesson, runtime]);

  useEffect(
    () => () => {
      stopAudioCapture();
      clientRef.current?.close();
      void stopAudioPlayback();
    },
    [stopAudioCapture],
  );

  useEffect(() => {
    if (isSessionLive) {
      sendContextUpdate();
    }
  }, [isSessionLive, sendContextUpdate]);

  const handleServerEvent = async (
    event: import("@agent-tutor/shared/types").TServerEvent,
  ) => {
    if (event.type === "ready") {
      isConnectingRef.current = false;
      canStreamAudioRef.current = true;
      suppressAssistantUntilNextTurnRef.current = false;
      lastSyncedContextRef.current = JSON.stringify({
        contextVersion,
        lessonId: lesson?.lessonId,
        ...runtime,
      });
      setIsSessionLive(true);
      setSessionPhase(audioRefs.current.stream ? "listening" : "ready");
      appendTranscript(
        "system",
        "Tutor connected. Ask for a hint whenever the runtime output gets confusing.",
      );

      if (pendingImageRef.current && clientRef.current?.isOpen()) {
        clientRef.current.send({
          type: "image",
          data: pendingImageRef.current,
        });
        pendingImageRef.current = null;
      }

      if (pendingPromptRef.current && clientRef.current?.isOpen()) {
        const prompt = pendingPromptRef.current;
        pendingPromptRef.current = null;
        clientRef.current.send({ type: "text", text: prompt });
        appendTranscript("user", prompt);
        setSessionPhase("thinking");
      }
      return;
    }

    if (event.type === "status") {
      setSessionPhase(event.phase);
      return;
    }

    if (event.type === "input_transcript") {
      suppressAssistantUntilNextTurnRef.current = false;
      appendTranscript("user", event.text);
      return;
    }

    if (event.type === "output_transcript") {
      if (suppressAssistantUntilNextTurnRef.current) {
        return;
      }
      appendTranscript("assistant", event.text);
      setSessionPhase("speaking");
      return;
    }

    if (event.type === "audio_out") {
      if (suppressAssistantUntilNextTurnRef.current) {
        return;
      }
      await playAudioChunk(event.data);
      return;
    }

    if (event.type === "interrupted") {
      suppressAssistantUntilNextTurnRef.current = true;
      await stopAudioPlayback();
      appendTranscript("system", "Tutor interrupted. Listening again.");
      setSessionPhase("listening");
      return;
    }

    if (event.type === "summary") {
      appendTranscript("system", event.text);
      return;
    }

    if (event.type === "error") {
      appendTranscript("system", `Error: ${event.message}`);
      setSessionPhase("error");
    }
  };

  const connectSession = async () => {
    if (!lesson) {
      return false;
    }

    if (isConnectingRef.current) {
      return true;
    }

    if (clientRef.current?.isOpen()) {
      return true;
    }

    if (!clientRef.current) {
      clientRef.current = new AgentLiveClient();
    }

    setSessionPhase("connecting");
    isConnectingRef.current = true;
    clientRef.current.connect({
      callbacks: {
        onClose: () => {
          canStreamAudioRef.current = false;
          isConnectingRef.current = false;
          setIsSessionLive(false);
          setSessionPhase("idle");
          setIsCapturingAudio(false);
        },
        onError: () => {
          isConnectingRef.current = false;
          setSessionPhase("error");
          appendTranscript(
            "system",
            "The live tutor did not connect. Check apps/agent-live and try again.",
          );
        },
        onEvent: (event) => {
          void handleServerEvent(event);
        },
        onOpen: () => {
          setSessionPhase("connecting");
        },
      },
      startPayload: {
        type: "start",
        courseId: lesson.courseId,
        lessonId: lesson.lessonId,
        ...runtime,
      },
      url: getAgentLiveWebSocketUrl(),
    });

    return true;
  };

  const connectVoiceSession = async () => {
    if (!lesson) {
      return;
    }

    if (!clientRef.current) {
      clientRef.current = new AgentLiveClient();
    }

    const micReady = await startAudioCapture();
    if (!micReady) {
      return;
    }

    await connectSession();
  };

  const disconnectSession = () => {
    clientRef.current?.send({ type: "stop" });
    clientRef.current?.close();
    stopAudioCapture();
    void stopAudioPlayback();
    isConnectingRef.current = false;
    lastSyncedContextRef.current = "";
    pendingImageRef.current = null;
    pendingPromptRef.current = null;
    setIsSessionLive(false);
    setSessionPhase("idle");
  };

  const sendTextPrompt = async () => {
    const trimmed = typedPrompt.trim();
    if (!trimmed) {
      return;
    }

    if (!clientRef.current?.isOpen()) {
      pendingPromptRef.current = trimmed;
      await shareWorkspaceImage();
      setTypedPrompt("");
      await connectSession();
      return;
    }

    suppressAssistantUntilNextTurnRef.current = false;
    await shareWorkspaceImage();
    clientRef.current.send({ type: "text", text: trimmed });
    appendTranscript("user", trimmed);
    setTypedPrompt("");
    setSessionPhase("thinking");
  };

  const sendSuggestedPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return;
    }

    if (clientRef.current?.isOpen()) {
      await shareWorkspaceImage();
      clientRef.current.send({ type: "text", text: trimmed });
      appendTranscript("user", trimmed);
      setSessionPhase("thinking");
      return;
    }

    pendingPromptRef.current = trimmed;
    await shareWorkspaceImage();
    await connectSession();
  };

  const interruptMentor = () => {
    suppressAssistantUntilNextTurnRef.current = true;
    clientRef.current?.send({ type: "interrupt" });
    void stopAudioPlayback();
    setSessionPhase("listening");
  };

  const startAudioCapture = async () => {
    if (isCapturingAudio) {
      return true;
    }

    suppressAssistantUntilNextTurnRef.current = false;
    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      appendTranscript(
        "system",
        error instanceof Error
          ? `Microphone access failed: ${error.message}`
          : "Microphone access failed.",
      );
      setSessionPhase("error");
      return false;
    }

    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) {
      appendTranscript("system", "Web Audio is not available in this browser.");
      return false;
    }

    const audioContext = new AudioContextCtor();
    const sourceNode = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const sumSquares = inputData.reduce((sum, sample) => {
        return sum + sample * sample;
      }, 0);
      const rms = Math.sqrt(sumSquares / inputData.length);
      const level = Math.min(1, rms * 12);
      const speakingThreshold = 0.035;

      setInputLevel(level);

      const downsampled = downsampleBuffer(
        inputData,
        audioContext.sampleRate,
        16_000,
      );
      const pcm16 = float32To16BitPCM(downsampled);
      const data = bytesToBase64(new Uint8Array(pcm16.buffer));

      if (!clientRef.current?.isOpen()) {
        return;
      }

      if (!canStreamAudioRef.current) {
        return;
      }

      if (level >= speakingThreshold) {
        if (silenceTimeoutRef.current) {
          window.clearTimeout(silenceTimeoutRef.current);
        }
        if (!isStreamingTurnRef.current) {
          isStreamingTurnRef.current = true;
          setSessionPhase("listening");
        }
        clientRef.current.send({
          type: "audio",
          data,
        });

        silenceTimeoutRef.current = window.setTimeout(() => {
          void finishActiveAudioTurn();
        }, 850);
        return;
      }

      if (isStreamingTurnRef.current) {
        clientRef.current.send({
          type: "audio",
          data,
        });
      }
    };

    sourceNode.connect(processor);
    processor.connect(audioContext.destination);

    audioRefs.current.audioContext = audioContext;
    audioRefs.current.processor = processor;
    audioRefs.current.sourceNode = sourceNode;
    audioRefs.current.stream = stream;

    setIsCapturingAudio(true);
    setSessionPhase("listening");
    return true;
  };

  const finishAudioCapture = () => {
    if (!clientRef.current?.isOpen()) {
      return;
    }

    stopAudioCapture();
    clientRef.current.send({ type: "audio_end" });
    setSessionPhase("thinking");
  };

  return {
    connectSession,
    connectVoiceSession,
    disconnectSession,
    finishAudioCapture,
    interruptMentor,
    isCapturingAudio,
    isSessionLive,
    inputLevel,
    sendTextPrompt,
    sendSuggestedPrompt,
    sessionPhase,
    shareCurrentContext: syncCurrentContext,
    startAudioCapture,
    transcripts,
    typedPrompt,
    updateTypedPrompt: setTypedPrompt,
  };
}
