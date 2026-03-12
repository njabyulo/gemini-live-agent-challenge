import type { ILessonContext } from "@agent-tutor/shared/types";

export const getLessonContext = ({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}): ILessonContext => ({
  courseId,
  courseTitle: "React Debugging",
  lessonId,
  lessonTitle: "Fix button interaction",
  objective:
    "Understand prop flow and event wiring in a small React component.",
  task: "Make the button render the correct label and call the passed click handler.",
  expectedOutcome:
    "The rendered button shows the right label and clicking it triggers the provided callback.",
});
