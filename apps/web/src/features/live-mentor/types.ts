import type {
  ICourseDefinition,
  ILessonContext,
  IRuntimeSnapshot,
  ISessionSummary,
  IWorkspaceBootstrapResponse,
  IWorkspaceFileRecord,
  TBrowserEvent,
  TServerEvent,
  TSessionPhase,
} from "@agent-tutor/shared/types";

export type TTranscriptRole = "assistant" | "system" | "user";

export interface ITranscriptMessage {
  id: string;
  role: TTranscriptRole;
  text: string;
}

export interface IWorkspaceRunInput {
  command: string;
  lessonId: string;
  sandboxId: string;
  sourceCode: string;
}

export interface ILiveMentorStoreState {
  activeFilePath: string;
  activeRailTab: "lesson" | "tutor";
  completedTopicIds: string[];
  contextVersion: number;
  files: IWorkspaceFileRecord[];
  isCapturingAudio: boolean;
  isSessionLive: boolean;
  lesson: ILessonContext | null;
  lessonView: "outline" | "detail";
  loadedTopicId: string | null;
  programInput: string;
  runtime: IRuntimeSnapshot;
  sandboxId: string | null;
  selectedTopicId: string | null;
  session: ISessionSummary | null;
  sessionPhase: TSessionPhase | "idle";
  terminalBuffer: string;
  topicStatusById: Record<string, TCourseTopicStatus>;
  transcripts: ITranscriptMessage[];
  typedPrompt: string;
  appendTerminalBuffer: (value: string) => void;
  appendTranscript: (role: TTranscriptRole, text: string) => void;
  hydrateWorkspace: (payload: IWorkspaceBootstrapResponse) => void;
  markTopicCompleted: (topicId: string) => void;
  publishRuntime: (runtime: IRuntimeSnapshot) => void;
  resetWorkspace: () => void;
  setActiveFilePath: (path: string) => void;
  setActiveRailTab: (tab: "lesson" | "tutor") => void;
  setFileContent: (path: string, content: string) => void;
  setIsCapturingAudio: (value: boolean) => void;
  setIsSessionLive: (value: boolean) => void;
  setLessonSelection: (topicId: string | null, view?: "outline" | "detail") => void;
  setLessonView: (view: "outline" | "detail") => void;
  setProgramInput: (value: string) => void;
  setSession: (session: ISessionSummary | null) => void;
  setSessionPhase: (phase: TSessionPhase | "idle") => void;
  setTerminalBuffer: (value: string) => void;
  setTypedPrompt: (value: string) => void;
  syncCurrentContext: () => void;
}

export type TCourseTopicStatus =
  | "locked"
  | "available"
  | "active"
  | "completed";

export interface ILearningRailCourseView {
  course: ICourseDefinition;
  selectedTopic: ILessonContext | null;
}

export interface ILiveMentorAudioRefs {
  audioContext: AudioContext | null;
  outputSource: AudioBufferSourceNode | null;
  processor: ScriptProcessorNode | null;
  sourceNode: MediaStreamAudioSourceNode | null;
  stream: MediaStream | null;
}

export interface IAgentTutorLiveClientCallbacks {
  onClose: () => void;
  onError: () => void;
  onEvent: (event: TServerEvent) => void;
  onOpen: () => void;
}

export interface IAgentTutorLiveClientConnectInput {
  callbacks: IAgentTutorLiveClientCallbacks;
  startPayload: Extract<TBrowserEvent, { type: "start" }>;
  url: string;
}
