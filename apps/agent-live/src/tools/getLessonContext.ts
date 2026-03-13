import type { ILessonContext } from "@agent-tutor/shared/types";

export const getLessonContext = ({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}): ILessonContext => ({
  courseId,
  courseTitle: "Python Foundations",
  lessonId,
  lessonTitle: "Echo command-line input",
  objective:
    "Read one command-line argument and print it back exactly as typed.",
  task: 'Fix main.py so `python3 main.py "Ada Lovelace"` prints `Ada Lovelace` exactly.',
  expectedOutcome:
    "The learner understands sys.argv, argument indexing, and why echo commands should not transform the input.",
  workspaceFiles: [
    "/workspace/main.py",
    "/workspace/README.md",
    "/workspace/test_main.py",
  ],
  focusFilePath: "/workspace/main.py",
  commandSuggestions: ['python3 main.py "Ada Lovelace"', "pytest -q"],
});
