import type {
  ITestState,
  TBrowserEvent,
  TServerEvent,
  TSessionPhase,
} from "@agent-tutor/shared/types";

export type TTranscriptRole = "assistant" | "user" | "system";

export type TWorkspaceFileKind = "tsx" | "ts" | "json" | "md";

export type TTerminalTab = "tests" | "notes" | "activity";

export interface ITranscriptMessage {
  id: string;
  role: TTranscriptRole;
  text: string;
}

export interface IWorkspaceFile {
  path: string;
  label: string;
  kind: TWorkspaceFileKind;
  content: string;
  isEditable: boolean;
  status?: "modified" | "attention";
}

export interface ILessonCard {
  course: string;
  title: string;
  objective: string;
  task: string;
  expectedOutcome: string;
}

export interface ITerminalNote {
  title: string;
  body: string;
}

export interface ILiveMentorStoreState {
  activeFilePath: string;
  files: IWorkspaceFile[];
  isCapturingAudio: boolean;
  isSessionLive: boolean;
  messages: ITranscriptMessage[];
  sessionPhase: TSessionPhase | "idle";
  terminalTab: TTerminalTab;
  testIndex: number;
  typedPrompt: string;
  appendMessage: (role: TTranscriptRole, text: string) => void;
  reset: () => void;
  setActiveFilePath: (path: string) => void;
  setFileContent: (path: string, content: string) => void;
  setFiles: (files: IWorkspaceFile[]) => void;
  setIsCapturingAudio: (value: boolean) => void;
  setIsSessionLive: (value: boolean) => void;
  setSessionPhase: (phase: TSessionPhase | "idle") => void;
  setTerminalTab: (tab: TTerminalTab) => void;
  setTestIndex: (index: number) => void;
  setTypedPrompt: (value: string) => void;
}

export interface ILiveMentorAudioRefs {
  audioContext: AudioContext | null;
  outputSource: AudioBufferSourceNode | null;
  processor: ScriptProcessorNode | null;
  sourceNode: MediaStreamAudioSourceNode | null;
  stream: MediaStream | null;
}

export interface IAgentLiveClientCallbacks {
  onClose: () => void;
  onError: () => void;
  onEvent: (event: TServerEvent) => void;
  onOpen: () => void;
}

export interface IAgentLiveClientConnectInput {
  callbacks: IAgentLiveClientCallbacks;
  startPayload: Extract<TBrowserEvent, { type: "start" }>;
  url: string;
}

export interface ILiveMentorViewModel {
  activeFile: IWorkspaceFile;
  files: IWorkspaceFile[];
  isCapturingAudio: boolean;
  isSessionLive: boolean;
  lesson: ILessonCard;
  messages: ITranscriptMessage[];
  sessionPhase: TSessionPhase | "idle";
  statusLabel: string;
  terminalNote: ITerminalNote;
  terminalTab: TTerminalTab;
  testState: ITestState;
  typedPrompt: string;
  connectSession: () => void;
  finishAudioCapture: () => void;
  interruptMentor: () => void;
  resetDemo: () => void;
  runTests: () => void;
  selectFile: (path: string) => void;
  sendTextPrompt: () => void;
  setCode: (code: string) => void;
  setTerminalTab: (tab: TTerminalTab) => void;
  setTypedPrompt: (value: string) => void;
  shareScreenshot: () => Promise<void>;
  startAudioCapture: () => Promise<void>;
  stopSession: () => void;
}
