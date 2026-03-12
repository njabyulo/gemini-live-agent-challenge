import type { ITestState, TSessionPhase } from "@agent-tutor/shared/types";

import type {
  ILessonCard,
  ITerminalNote,
  ITranscriptMessage,
  IWorkspaceFile,
} from "../types";

export const SOURCE_FILE_PATH = "src/components/ContinueButton.tsx";

export const LESSON_CARD: ILessonCard = {
  course: "React Debugging Sprint",
  title: "Fix button interaction",
  objective: "Repair prop flow and event wiring without leaving the workspace.",
  task: "Make ContinueButton render the learner-facing label and trigger the provided callback when clicked.",
  expectedOutcome:
    "The button should display Continue and call handleClick exactly once.",
};

export const TEST_STATES: ITestState[] = [
  {
    id: "state-1",
    label: "Hard fail",
    summary:
      "The button renders the wrong label and never calls the click handler.",
    terminalOutput: [
      "> pnpm test ContinueButton",
      "",
      " FAIL  src/components/ContinueButton.test.tsx",
      '  Expected text "Continue" but received "Submit".',
      "  Expected handleClick to have been called 1 time, but it was called 0 times.",
    ].join("\n"),
    mentorHint:
      "Start with what the rendered button receives. Fix the label before you touch event wiring.",
  },
  {
    id: "state-2",
    label: "Almost there",
    summary:
      "The label is correct, but the click handler is still disconnected.",
    terminalOutput: [
      "> pnpm test ContinueButton",
      "",
      " FAIL  src/components/ContinueButton.test.tsx",
      "  Expected handleClick to have been called 1 time, but it was called 0 times.",
    ].join("\n"),
    mentorHint:
      "The text is right now. Focus on where onClick should be attached on the rendered button.",
  },
  {
    id: "state-3",
    label: "Ready to submit",
    summary: "All checks pass and the learner can submit with confidence.",
    terminalOutput: [
      "> pnpm test ContinueButton",
      "",
      " PASS  src/components/ContinueButton.test.tsx",
      "  Tests: 2 passed, 2 total",
      "  Status: Ready to submit.",
    ].join("\n"),
    mentorHint:
      "You repaired both the prop flow and the click wiring. Confirm the behavior once more, then submit.",
  },
];

export const STATUS_LABELS: Record<TSessionPhase | "idle", string> = {
  idle: "Idle",
  connecting: "Connecting",
  ready: "Ready",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  error: "Error",
};

export const INITIAL_MESSAGES: ITranscriptMessage[] = [
  {
    id: "mentor-intro",
    role: "assistant",
    text: "I’m Garrii Live Mentor. Ask for help out loud, share the failing test context, and I’ll coach you one step at a time.",
  },
];

export const TERMINAL_NOTES: Record<ITestState["id"], ITerminalNote> = {
  "state-1": {
    title: "Current breakdown",
    body: "Two things are wrong: the button text is hardcoded to Submit, and the click handler never reaches the DOM button.",
  },
  "state-2": {
    title: "Progress made",
    body: "The learner fixed the text path. The remaining issue is event wiring, which makes this the perfect interruption moment in the demo.",
  },
  "state-3": {
    title: "What changed",
    body: "The source file now reflects the lesson goal. The mentor can close with a short readiness summary instead of another hint.",
  },
};

export const INITIAL_WORKSPACE_FILES: IWorkspaceFile[] = [
  {
    path: "package.json",
    label: "package.json",
    kind: "json",
    isEditable: false,
    content: `{
  "name": "lesson-react-debugging",
  "scripts": {
    "test": "vitest run"
  }
}`,
  },
  {
    path: SOURCE_FILE_PATH,
    label: "ContinueButton.tsx",
    kind: "tsx",
    isEditable: true,
    status: "attention",
    content: `type TButtonProps = {
  label: string;
  onClick?: () => void;
};

export function ContinueButton(props: TButtonProps) {
  return (
    <button className="cta">
      Submit
    </button>
  );
}`,
  },
  {
    path: "src/components/ContinueButton.test.tsx",
    label: "ContinueButton.test.tsx",
    kind: "tsx",
    isEditable: false,
    content: `import { fireEvent, render, screen } from "@testing-library/react";

import { ContinueButton } from "./ContinueButton";

test("renders the learner-facing label", () => {
  render(<ContinueButton label="Continue" />);
  expect(screen.getByRole("button")).toHaveTextContent("Continue");
});

test("fires the provided click handler", () => {
  const handleClick = vi.fn();
  render(<ContinueButton label="Continue" onClick={handleClick} />);
  fireEvent.click(screen.getByRole("button"));
  expect(handleClick).toHaveBeenCalledTimes(1);
});`,
  },
  {
    path: "LESSON.md",
    label: "LESSON.md",
    kind: "md",
    isEditable: false,
    content: `# Fix button interaction

Objective: Repair prop flow and event wiring without leaving the workspace.

Expected outcome:
- The button shows "Continue"
- Clicking the button calls the provided callback
- The learner can explain why the fix works`,
  },
];

export function buildWorkspaceFiles(
  sourceCode = getSourceCode(INITIAL_WORKSPACE_FILES),
): IWorkspaceFile[] {
  const stateId = resolveTestStateIdFromCode(sourceCode);

  return INITIAL_WORKSPACE_FILES.map((file) =>
    file.path === SOURCE_FILE_PATH
      ? {
          ...file,
          content: sourceCode,
          status: stateId === "state-3" ? "modified" : "attention",
        }
      : file,
  );
}

export function getSourceCode(files: IWorkspaceFile[]): string {
  return (
    files.find((file) => file.path === SOURCE_FILE_PATH)?.content ??
    INITIAL_WORKSPACE_FILES[1]?.content ??
    ""
  );
}

export function resolveTestStateIdFromCode(
  sourceCode: string,
): ITestState["id"] {
  const hasDynamicLabel = /\{(?:props\.)?label\}/.test(sourceCode);
  const hasClickHandler = /onClick=\{(?:props\.)?onClick\}/.test(sourceCode);

  if (hasDynamicLabel && hasClickHandler) {
    return "state-3";
  }

  if (hasDynamicLabel) {
    return "state-2";
  }

  return "state-1";
}

export function getTestStateById(id: ITestState["id"]): ITestState {
  return TEST_STATES.find((state) => state.id === id) ?? TEST_STATES[0]!;
}

export function getTerminalNoteByState(id: ITestState["id"]): ITerminalNote {
  return TERMINAL_NOTES[id] ?? TERMINAL_NOTES["state-1"];
}

export function buildScreenshotFromTestState(
  testState: ITestState,
  sourceCode: string,
): string | null {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  ctx.fillStyle = "#1d2230";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#252b3b";
  ctx.fillRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.fillStyle = "#141925";
  ctx.fillRect(60, 118, 860, 610);

  ctx.fillStyle = "#0f1420";
  ctx.fillRect(940, 118, 420, 610);

  ctx.fillStyle = "#0d111a";
  ctx.fillRect(60, 742, 1300, 122);

  ctx.fillStyle = "#67d6c0";
  ctx.font = "600 30px sans-serif";
  ctx.fillText("Garrii Live Mentor", 86, 86);

  ctx.fillStyle = "#d8e2f2";
  ctx.font = "500 22px sans-serif";
  ctx.fillText("Lesson: Fix button interaction", 86, 160);
  ctx.fillText(`State: ${testState.label}`, 980, 160);

  ctx.font = "18px monospace";
  sourceCode
    .split("\n")
    .slice(0, 12)
    .forEach((line, index) => {
      ctx.fillStyle = "#7e8ca7";
      ctx.fillText(String(index + 1).padStart(2, " "), 86, 208 + index * 36);
      ctx.fillStyle = "#ebf1ff";
      ctx.fillText(line, 140, 208 + index * 36);
    });

  ctx.fillStyle = "#95f7bf";
  testState.terminalOutput.split("\n").forEach((line, index) => {
    ctx.fillText(line, 86, 786 + index * 24);
  });

  return canvas.toDataURL("image/jpeg", 0.9).split(",")[1] ?? null;
}
