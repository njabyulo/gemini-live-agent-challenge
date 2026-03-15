"use client";

import {
  COURSE_TOPIC_ORDER,
  DEFAULT_LESSON_ID,
} from "@gemini-live-agent/shared/consts";
import type { IRuntimeSnapshot } from "@gemini-live-agent/shared/types";
import { create } from "zustand";

import type {
  ILiveMentorStoreState,
  TCourseTopicStatus,
} from "../types";
import { DEFAULT_PROGRAM_INPUT } from "../utils/terminal";

const INITIAL_RUNTIME: IRuntimeSnapshot = {
  command: "",
  sourceCode: "",
  stderr: "",
  stdout: "",
};

const buildTopicStatusById = (
  loadedTopicId: string | null,
  completedTopicIds: string[],
): Record<string, TCourseTopicStatus> => {
  const completedSet = new Set(completedTopicIds);

  return Object.fromEntries(
    COURSE_TOPIC_ORDER.map((topicId) => {
      if (completedSet.has(topicId)) {
        return [topicId, "completed"];
      }

      if (loadedTopicId === topicId) {
        return [topicId, "active"];
      }

      return [topicId, "available"];
    }),
  );
};

export const useLiveMentorStore = create<ILiveMentorStoreState>((set) => ({
  activeFilePath: "/workspace/main.py",
  activeRailTab: "lesson",
  completedTopicIds: [],
  contextVersion: 0,
  files: [],
  isCapturingAudio: false,
  isSessionLive: false,
  lesson: null,
  lessonView: "detail",
  loadedTopicId: DEFAULT_LESSON_ID,
  programInput: DEFAULT_PROGRAM_INPUT,
  runtime: INITIAL_RUNTIME,
  sandboxId: null,
  selectedTopicId: DEFAULT_LESSON_ID,
  session: null,
  sessionPhase: "idle",
  terminalBuffer: "",
  topicStatusById: buildTopicStatusById(DEFAULT_LESSON_ID, []),
  transcripts: [],
  typedPrompt: "",
  appendTerminalBuffer: (value) =>
    set((state) => ({
      terminalBuffer: `${state.terminalBuffer}${value}`,
    })),
  appendTranscript: (role, text) =>
    set((state) => ({
      transcripts:
        state.transcripts.length > 0 &&
        state.transcripts.at(-1)?.role === role
          ? state.transcripts.map((message, index, messages) =>
              index === messages.length - 1
                ? {
                    ...message,
                    text: [message.text, text].filter(Boolean).join(" ").trim(),
                  }
                : message,
            )
          : [
              ...state.transcripts,
              {
                id: `${role}-${Date.now()}-${state.transcripts.length}`,
                role,
                text,
              },
            ],
    })),
  hydrateWorkspace: (payload) =>
    set((state) => ({
      activeFilePath: payload.lesson.focusFilePath,
      activeRailTab: "lesson",
      contextVersion: 0,
      files: payload.files,
      isCapturingAudio: false,
      isSessionLive: false,
      lesson: payload.lesson,
      lessonView: "detail",
      loadedTopicId: payload.lesson.lessonId,
      programInput: payload.lesson.sampleInput || DEFAULT_PROGRAM_INPUT,
      runtime: payload.snapshot,
      sandboxId: payload.sandboxId,
      selectedTopicId: payload.lesson.lessonId,
      sessionPhase: "idle",
      terminalBuffer: "",
      topicStatusById: buildTopicStatusById(
        payload.lesson.lessonId,
        state.completedTopicIds,
      ),
      transcripts: [
        {
          id: `system-ready-${payload.lesson.lessonId}`,
          role: "system",
          text: `Lesson loaded: ${payload.lesson.lessonTitle}. Run the program, then ask the tutor for one precise next step.`,
        },
      ],
      typedPrompt: "",
    })),
  markTopicCompleted: (topicId) =>
    set((state) => {
      const completedTopicIds = state.completedTopicIds.includes(topicId)
        ? state.completedTopicIds
        : [...state.completedTopicIds, topicId];

      return {
        completedTopicIds,
        topicStatusById: buildTopicStatusById(
          state.loadedTopicId,
          completedTopicIds,
        ),
      };
    }),
  publishRuntime: (runtime) =>
    set((state) => ({
      contextVersion: state.contextVersion + 1,
      runtime,
    })),
  resetWorkspace: () =>
    set({
      activeFilePath: "/workspace/main.py",
      activeRailTab: "lesson",
      completedTopicIds: [],
      contextVersion: 0,
      files: [],
      isCapturingAudio: false,
      isSessionLive: false,
      lesson: null,
      lessonView: "detail",
      loadedTopicId: DEFAULT_LESSON_ID,
      programInput: DEFAULT_PROGRAM_INPUT,
      runtime: INITIAL_RUNTIME,
      sandboxId: null,
      selectedTopicId: DEFAULT_LESSON_ID,
      sessionPhase: "idle",
      terminalBuffer: "",
      topicStatusById: buildTopicStatusById(DEFAULT_LESSON_ID, []),
      transcripts: [],
      typedPrompt: "",
    }),
  setActiveFilePath: (path) => set({ activeFilePath: path }),
  setActiveRailTab: (activeRailTab) => set({ activeRailTab }),
  setFileContent: (path, content) =>
    set((state) => ({
      contextVersion: state.contextVersion + 1,
      files: state.files.map((file) =>
        file.path === path ? { ...file, content } : file,
      ),
      runtime:
        path === "/workspace/main.py"
          ? { ...state.runtime, sourceCode: content }
          : state.runtime,
    })),
  setIsCapturingAudio: (value) => set({ isCapturingAudio: value }),
  setIsSessionLive: (value) => set({ isSessionLive: value }),
  setLessonSelection: (selectedTopicId, lessonView = "detail") =>
    set({ lessonView, selectedTopicId }),
  setLessonView: (lessonView) => set({ lessonView }),
  setProgramInput: (value) => set({ programInput: value }),
  setSession: (session) => set({ session }),
  setSessionPhase: (phase) => set({ sessionPhase: phase }),
  setTerminalBuffer: (value) => set({ terminalBuffer: value }),
  setTypedPrompt: (value) => set({ typedPrompt: value }),
  syncCurrentContext: () =>
    set((state) => ({
      contextVersion: state.contextVersion + 1,
    })),
}));
