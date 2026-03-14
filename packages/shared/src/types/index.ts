import { z } from "zod";

import { TUTOR_SESSION_PHASES } from "../consts/index.js";

export interface ILessonContext {
  courseId: string;
  courseTitle: string;
  sectionId: string;
  sectionTitle: string;
  lessonId: string;
  lessonTitle: string;
  summary: string;
  concept: string;
  whyItMatters: string;
  objective: string;
  task: string;
  checkerExpects: string;
  commonFailure: string;
  expectedOutcome: string;
  constraints: string[];
  hints: string[];
  references: string[];
  sampleInput: string;
  focusFilePath: string;
  workspaceFiles: string[];
  commandSuggestions: string[];
}

export interface ILessonDefinition {
  lesson: ILessonContext;
  files: IWorkspaceFileRecord[];
  practiceLabel: string;
}

export interface ICourseSection {
  id: string;
  title: string;
  topics: ILessonDefinition[];
}

export interface ICourseDefinition {
  id: string;
  title: string;
  sections: ICourseSection[];
}

export interface IWorkspaceFileRecord {
  path: string;
  content: string;
  isEditable: boolean;
}

export interface IRuntimeSnapshot {
  sourceCode: string;
  command: string;
  stdout: string;
  stderr: string;
}

export interface IFunctionCallResult {
  lesson?: ILessonContext;
  runtime?: IRuntimeSnapshot;
}

export interface IWorkspaceBootstrapResponse {
  sandboxId: string;
  terminalSessionId: string;
  lesson: ILessonContext;
  files: IWorkspaceFileRecord[];
  snapshot: IRuntimeSnapshot;
}

export interface ISessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface ISessionSummary {
  user: ISessionUser;
  session: {
    id: string;
    expiresAt: string;
  };
}

export type TSessionPhase = (typeof TUTOR_SESSION_PHASES)[number];

export type TBrowserEvent =
  | TBrowserStartEvent
  | TBrowserAudioEvent
  | TBrowserAudioEndEvent
  | TBrowserTextEvent
  | TBrowserImageEvent
  | TBrowserContextEvent
  | TBrowserInterruptEvent
  | TBrowserStopEvent;

export type TServerEvent =
  | TServerReadyEvent
  | TServerStatusEvent
  | TServerInputTranscriptEvent
  | TServerOutputTranscriptEvent
  | TServerAudioOutEvent
  | TServerInterruptedEvent
  | TServerSummaryEvent
  | TServerErrorEvent;

export interface IBrowserStartEvent extends IRuntimeSnapshot {
  type: "start";
  courseId: string;
  lessonId: string;
}

export interface IBrowserAudioEvent {
  type: "audio";
  data: string;
}

export interface IBrowserAudioEndEvent {
  type: "audio_end";
}

export interface IBrowserTextEvent {
  type: "text";
  text: string;
}

export interface IBrowserImageEvent {
  type: "image";
  data: string;
}

export interface IBrowserContextEvent extends IRuntimeSnapshot {
  type: "context";
  lessonId: string;
}

export interface IBrowserInterruptEvent {
  type: "interrupt";
}

export interface IBrowserStopEvent {
  type: "stop";
}

export interface IServerReadyEvent {
  type: "ready";
}

export interface IServerStatusEvent {
  type: "status";
  phase: TSessionPhase;
}

export interface IServerInputTranscriptEvent {
  type: "input_transcript";
  text: string;
}

export interface IServerOutputTranscriptEvent {
  type: "output_transcript";
  text: string;
}

export interface IServerAudioOutEvent {
  type: "audio_out";
  data: string;
  mimeType: string;
}

export interface IServerInterruptedEvent {
  type: "interrupted";
}

export interface IServerSummaryEvent {
  type: "summary";
  text: string;
}

export interface IServerErrorEvent {
  type: "error";
  message: string;
}

export type TBrowserStartEvent = IBrowserStartEvent;
export type TBrowserAudioEvent = IBrowserAudioEvent;
export type TBrowserAudioEndEvent = IBrowserAudioEndEvent;
export type TBrowserTextEvent = IBrowserTextEvent;
export type TBrowserImageEvent = IBrowserImageEvent;
export type TBrowserContextEvent = IBrowserContextEvent;
export type TBrowserInterruptEvent = IBrowserInterruptEvent;
export type TBrowserStopEvent = IBrowserStopEvent;
export type TServerReadyEvent = IServerReadyEvent;
export type TServerStatusEvent = IServerStatusEvent;
export type TServerInputTranscriptEvent = IServerInputTranscriptEvent;
export type TServerOutputTranscriptEvent = IServerOutputTranscriptEvent;
export type TServerAudioOutEvent = IServerAudioOutEvent;
export type TServerInterruptedEvent = IServerInterruptedEvent;
export type TServerSummaryEvent = IServerSummaryEvent;
export type TServerErrorEvent = IServerErrorEvent;

export const SRuntimeSnapshot = z.object({
  sourceCode: z.string(),
  command: z.string(),
  stdout: z.string(),
  stderr: z.string(),
});

export const SBrowserStartEvent = SRuntimeSnapshot.extend({
  type: z.literal("start"),
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
});

export const SBrowserAudioEvent = z.object({
  type: z.literal("audio"),
  data: z.string().min(1),
});

export const SBrowserAudioEndEvent = z.object({
  type: z.literal("audio_end"),
});

export const SBrowserTextEvent = z.object({
  type: z.literal("text"),
  text: z.string().min(1),
});

export const SBrowserImageEvent = z.object({
  type: z.literal("image"),
  data: z.string().min(1),
});

export const SBrowserContextEvent = SRuntimeSnapshot.extend({
  type: z.literal("context"),
  lessonId: z.string().min(1),
});

export const SBrowserInterruptEvent = z.object({
  type: z.literal("interrupt"),
});

export const SBrowserStopEvent = z.object({
  type: z.literal("stop"),
});

export const SBrowserEvent = z.discriminatedUnion("type", [
  SBrowserStartEvent,
  SBrowserAudioEvent,
  SBrowserAudioEndEvent,
  SBrowserTextEvent,
  SBrowserImageEvent,
  SBrowserContextEvent,
  SBrowserInterruptEvent,
  SBrowserStopEvent,
]);
