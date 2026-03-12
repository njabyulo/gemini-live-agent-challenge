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

export interface TBrowserStartEvent {
  type: "start";
  courseId: string;
  lessonId: string;
  testStateId?: ITestState["id"];
  terminalOutput?: string;
}

export interface TBrowserAudioEvent {
  type: "audio";
  data: string;
}

export interface TBrowserAudioEndEvent {
  type: "audio_end";
}

export interface TBrowserTextEvent {
  type: "text";
  text: string;
}

export interface TBrowserImageEvent {
  type: "image";
  data: string;
}

export interface TBrowserInterruptEvent {
  type: "interrupt";
}

export interface TBrowserStopEvent {
  type: "stop";
}

export interface TServerReadyEvent {
  type: "ready";
}

export interface TServerStatusEvent {
  type: "status";
  phase: TSessionPhase;
}

export interface TServerInputTranscriptEvent {
  type: "input_transcript";
  text: string;
}

export interface TServerOutputTranscriptEvent {
  type: "output_transcript";
  text: string;
}

export interface TServerAudioOutEvent {
  type: "audio_out";
  data: string;
  mimeType: string;
}

export interface TServerInterruptedEvent {
  type: "interrupted";
}

export interface TServerSummaryEvent {
  type: "summary";
  text: string;
}

export interface TServerErrorEvent {
  type: "error";
  message: string;
}

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
  SBrowserInterruptEvent,
  SBrowserStopEvent,
]);
