"use client";

import { create } from "zustand";

import type { ILiveMentorStoreState } from "../types";
import {
  INITIAL_MESSAGES,
  INITIAL_WORKSPACE_FILES,
  SOURCE_FILE_PATH,
} from "../utils/demo-data";

export const useLiveMentorStore = create<ILiveMentorStoreState>((set) => ({
  activeFilePath: SOURCE_FILE_PATH,
  files: INITIAL_WORKSPACE_FILES,
  isCapturingAudio: false,
  isSessionLive: false,
  messages: INITIAL_MESSAGES,
  sessionPhase: "idle",
  terminalTab: "tests",
  testIndex: 0,
  typedPrompt: "",
  appendMessage: (role, text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: `${role}-${Date.now()}-${state.messages.length}`, role, text },
      ],
    })),
  reset: () =>
    set({
      activeFilePath: SOURCE_FILE_PATH,
      files: INITIAL_WORKSPACE_FILES,
      isCapturingAudio: false,
      isSessionLive: false,
      messages: INITIAL_MESSAGES,
      sessionPhase: "idle",
      terminalTab: "tests",
      testIndex: 0,
      typedPrompt: "",
    }),
  setActiveFilePath: (path) => set({ activeFilePath: path }),
  setFileContent: (path, content) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.path === path ? { ...file, content, status: "modified" } : file,
      ),
    })),
  setFiles: (files) => set({ files }),
  setIsCapturingAudio: (value) => set({ isCapturingAudio: value }),
  setIsSessionLive: (value) => set({ isSessionLive: value }),
  setSessionPhase: (phase) => set({ sessionPhase: phase }),
  setTerminalTab: (tab) => set({ terminalTab: tab }),
  setTestIndex: (index) => set({ testIndex: index }),
  setTypedPrompt: (value) => set({ typedPrompt: value }),
}));
