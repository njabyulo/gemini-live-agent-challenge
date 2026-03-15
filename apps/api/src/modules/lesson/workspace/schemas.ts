import { z } from "zod";
import { SRuntimeSnapshot } from "@agent-tutor/shared/types";

export const SLessonFileUpdateBody = z.object({
  sandboxId: z.string().min(1),
  content: z.string(),
});

export const SLessonLoadBody = z.object({
  lessonId: z.string().min(1),
});

export const SLessonRunCommandBody = z.object({
  command: z.string().min(1),
  lessonId: z.string().min(1),
  sandboxId: z.string().min(1),
  sourceCode: z.string().optional(),
});

export const SLessonSandboxQuery = z.object({
  sandboxId: z.string().min(1),
});

export const SLessonRuntimeBody = SRuntimeSnapshot;
