import { DEFAULT_COURSE_ID, getLessonContextById } from "@agent-tutor/shared/consts";
import type { ILessonContext } from "@agent-tutor/shared/types";

export const getLessonContext = ({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}): ILessonContext => {
  if (courseId !== DEFAULT_COURSE_ID) {
    throw new Error(`Unknown course: ${courseId}`);
  }

  const lesson = getLessonContextById(lessonId);
  if (!lesson) {
    throw new Error(`Unknown lesson: ${lessonId}`);
  }

  return lesson;
};
