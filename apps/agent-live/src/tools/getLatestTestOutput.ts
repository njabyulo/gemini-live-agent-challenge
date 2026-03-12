import type { ITestState } from "@agent-tutor/shared/types";

const TEST_STATES: Record<ITestState["id"], ITestState> = {
  "state-1": {
    id: "state-1",
    label: "Hard fail",
    summary:
      "The button renders the wrong label and never calls the click handler.",
    terminalOutput: `FAIL src/components/Button.test.tsx\nExpected text "Continue" but received "Submit".\nExpected handleClick to have been called 1 time, but it was called 0 times.`,
    mentorHint:
      "Check the props flowing into the button component before changing any logic.",
  },
  "state-2": {
    id: "state-2",
    label: "Almost there",
    summary:
      "The label is correct now, but the click handler is still not wired.",
    terminalOutput: `FAIL src/components/Button.test.tsx\nExpected handleClick to have been called 1 time, but it was called 0 times.`,
    mentorHint:
      "Focus on how the click handler is passed and attached to the rendered button element.",
  },
  "state-3": {
    id: "state-3",
    label: "Pass",
    summary: "All tests pass and the learner is ready to submit.",
    terminalOutput: `PASS src/components/Button.test.tsx\nTest Suites: 1 passed, 1 total\nTests: 2 passed, 2 total`,
    mentorHint:
      "You fixed the prop flow and event wiring. Run the full suite once more, then submit.",
  },
};

export const getLatestTestOutput = ({
  testStateId = "state-1",
  terminalOutput,
}: {
  testStateId?: ITestState["id"];
  terminalOutput?: string;
}): ITestState => {
  const base = TEST_STATES[testStateId] ?? TEST_STATES["state-1"];
  if (!terminalOutput) {
    return base;
  }

  return {
    ...base,
    terminalOutput,
  };
};
