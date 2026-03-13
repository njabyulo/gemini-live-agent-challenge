import type { IRuntimeSnapshot } from "@agent-tutor/shared/types";

export const getRuntimeSnapshot = (
  runtime: Partial<IRuntimeSnapshot>,
): IRuntimeSnapshot => ({
  command: runtime.command ?? "",
  sourceCode: runtime.sourceCode ?? "",
  stderr: runtime.stderr ?? "",
  stdout: runtime.stdout ?? "",
});
