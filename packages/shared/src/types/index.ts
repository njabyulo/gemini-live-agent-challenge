import { z } from "zod";

import { TUTOR_SESSION_PHASES } from "../consts/index.js";

export interface ILessonContext {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  objective: string;
  task: string;
  expectedOutcome: string;
  workspaceFiles: string[];
  focusFilePath: string;
}

export interface ITestState {
  id: "state-1" | "state-2" | "state-3";
  label: string;
  summary: string;
  terminalOutput: string;
  mentorHint: string;
}

export interface IFunctionCallResult {
  lesson?: ILessonContext;
  testState?: ITestState;
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

export interface IBrowserStartEvent {
  type: "start";
  courseId: string;
  lessonId: string;
  testStateId?: ITestState["id"];
  terminalOutput?: string;
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

export interface IBrowserContextEvent {
  type: "context";
  testStateId: ITestState["id"];
  terminalOutput: string;
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

export const SBrowserStartEvent = z.object({
  type: z.literal("start"),
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  testStateId: z.enum(["state-1", "state-2", "state-3"]).optional(),
  terminalOutput: z.string().optional(),
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

export const SBrowserContextEvent = z.object({
  type: z.literal("context"),
  testStateId: z.enum(["state-1", "state-2", "state-3"]),
  terminalOutput: z.string().min(1),
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
