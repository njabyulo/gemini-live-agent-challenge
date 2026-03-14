"use client";

import {
  ArrowLeft,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Circle,
  FileCode2,
  FlaskConical,
  Lightbulb,
  LockKeyhole,
  Play,
  Sparkles,
} from "lucide-react";

import type { ICourseDefinition, ILessonContext } from "@agent-tutor/shared/types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";

import type { TCourseTopicStatus } from "../types";

const getTopicStatusLabel = (status: TCourseTopicStatus) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "active":
      return "Active";
    case "available":
      return "Available";
    default:
      return "Locked";
  }
};

const getTopicStatusIcon = (status: TCourseTopicStatus) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-[#2f735f]" />;
    case "active":
      return <Circle className="h-4 w-4 fill-[#2f735f] text-[#2f735f]" />;
    case "available":
      return <Circle className="h-4 w-4 text-[#b6c4bb]" />;
    default:
      return <LockKeyhole className="h-4 w-4 text-[#98a99e]" />;
  }
};

const getFileIcon = (path: string) => {
  if (path.endsWith("test_main.py")) {
    return <FlaskConical className="h-4 w-4 text-[#f2ad53]" />;
  }

  if (path.endsWith(".md")) {
    return <BookOpenText className="h-4 w-4 text-[#4f8fd6]" />;
  }

  return <FileCode2 className="h-4 w-4 text-[#2f735f]" />;
};

export function LessonPanel({
  course,
  isLoadingLesson,
  lessonView,
  loadedTopicId,
  onBackToOutline,
  onPreviewTopic,
  onStartLesson,
  selectedLesson,
  selectedTopicId,
  topicStatusById,
}: {
  course: ICourseDefinition;
  isLoadingLesson: boolean;
  lessonView: "outline" | "detail";
  loadedTopicId: string | null;
  onBackToOutline: () => void;
  onPreviewTopic: (topicId: string) => void;
  onStartLesson: (topicId: string) => void;
  selectedLesson: ILessonContext | null;
  selectedTopicId: string | null;
  topicStatusById: Record<string, TCourseTopicStatus>;
}) {
  const completedCount = Object.values(topicStatusById).filter(
    (status) => status === "completed",
  ).length;
  const totalCount = Object.keys(topicStatusById).length;
  const progressPercent = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;
  const isLoadedSelection = Boolean(
    selectedLesson?.lessonId && loadedTopicId === selectedLesson.lessonId,
  );

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-[rgba(20,31,24,0.08)] px-5 py-4">
        <p className="workspace-eyebrow">Learning rail</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[1.45rem] leading-[1.08] font-semibold tracking-[-0.04em] text-[#16211b]">
              {course.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#5f7468]">
              {completedCount} of {totalCount} topics completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="rounded-full border border-[#c9d9ce] bg-[#f3f7f4] px-3 py-1 text-[11px] text-[#486055] shadow-none">
              {completedCount}/{totalCount}
            </Badge>
            <Badge className="rounded-full border border-[#c9d9ce] bg-[#f3f7f4] px-3 py-1 text-[11px] text-[#486055] shadow-none">
              {progressPercent}%
            </Badge>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#e5ece6]">
          <div
            className="h-full rounded-full bg-[#2f735f]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {lessonView === "outline" ? (
          <div className="space-y-5 px-5 py-5">
            {course.sections.map((section) => (
              <section key={section.id} className="rounded-[22px] border border-[rgba(20,31,24,0.08)] bg-[#f8fbf7]">
                <div className="border-b border-[rgba(20,31,24,0.08)] px-4 py-3">
                  <p className="text-[0.74rem] font-semibold tracking-[0.16em] uppercase text-[#60756a]">
                    {section.title}
                  </p>
                </div>
                <div className="space-y-1 px-3 py-3">
                  {section.topics.map((topic) => {
                    const lessonId = topic.lesson.lessonId;
                    const status = topicStatusById[lessonId] ?? "locked";
                    const isSelected = selectedTopicId === lessonId;
                    const isDisabled = status === "locked";

                    return (
                      <button
                        key={lessonId}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => onPreviewTopic(lessonId)}
                        className={`flex w-full items-start gap-3 rounded-[18px] border px-3 py-3 text-left transition ${
                          isSelected
                            ? "border-[#b8d7c4] bg-[#eef8f1]"
                            : "border-transparent bg-transparent hover:border-[rgba(20,31,24,0.08)] hover:bg-[#f1f6f2]"
                        } ${isDisabled ? "cursor-not-allowed opacity-55" : ""}`}
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d7e4db] bg-white">
                          {getTopicStatusIcon(status)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-3">
                            <span className="truncate text-[0.95rem] font-medium text-[#17241d]">
                              {topic.lesson.lessonTitle}
                            </span>
                            <Badge className="rounded-full border border-[#d3dfd7] bg-white px-2.5 py-1 text-[10.5px] text-[#60756a] shadow-none">
                              {getTopicStatusLabel(status)}
                            </Badge>
                          </span>
                          <span className="mt-1 block text-[0.82rem] leading-5 text-[#61756a]">
                            {topic.practiceLabel}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-4 px-5 py-5">
            <Button
              type="button"
              variant="ghost"
              onClick={onBackToOutline}
              className="h-9 rounded-full px-3 text-[#476055] hover:bg-[#edf4ef] hover:text-[#1e3427]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to outline
            </Button>

            {selectedLesson ? (
              <>
                <section className="rounded-[22px] border border-[rgba(20,31,24,0.08)] bg-[#f8fbf7] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="workspace-eyebrow">{selectedLesson.sectionTitle}</p>
                      <h3 className="mt-1 text-[1.35rem] leading-[1.08] font-semibold tracking-[-0.035em] text-[#16211b]">
                        {selectedLesson.lessonTitle}
                      </h3>
                      <p className="mt-2 text-[0.94rem] leading-6 text-[#50655a]">
                        {selectedLesson.summary}
                      </p>
                    </div>
                    <Badge className="rounded-full border border-[#c9d9ce] bg-[#f3f7f4] px-3 py-1 text-[10.5px] text-[#486055] shadow-none">
                      {getTopicStatusLabel(
                        topicStatusById[selectedLesson.lessonId] ?? "locked",
                      )}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="rounded-[18px] border border-[rgba(20,31,24,0.08)] bg-white px-4 py-3">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#60756a]">
                        Concept
                      </p>
                      <p className="mt-2 text-[0.92rem] leading-6 text-[#304339]">
                        {selectedLesson.concept}
                      </p>
                    </div>

                    <div className="rounded-[18px] border border-[rgba(20,31,24,0.08)] bg-white px-4 py-3">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#60756a]">
                        Why it matters
                      </p>
                      <p className="mt-2 text-[0.92rem] leading-6 text-[#304339]">
                        {selectedLesson.whyItMatters}
                      </p>
                    </div>

                    <div className="rounded-[18px] border border-[rgba(20,31,24,0.08)] bg-white px-4 py-3">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#60756a]">
                        Task
                      </p>
                      <p className="mt-2 text-[0.92rem] leading-7 text-[#304339]">
                        {selectedLesson.task}
                      </p>
                    </div>

                    <div className="rounded-[18px] border border-[rgba(20,31,24,0.08)] bg-white px-4 py-3">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#60756a]">
                        Checker expects
                      </p>
                      <p className="mt-2 text-[0.92rem] leading-6 text-[#304339]">
                        {selectedLesson.checkerExpects}
                      </p>
                    </div>

                    <div className="rounded-[18px] border border-[rgba(20,31,24,0.08)] bg-white px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#2f735f]" />
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#60756a]">
                          Common failure
                        </p>
                      </div>
                      <p className="mt-2 text-[0.92rem] leading-6 text-[#304339]">
                        {selectedLesson.commonFailure}
                      </p>
                    </div>

                    <div className="rounded-[18px] border border-[#b8d7c4] bg-[#eef8f1] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-[#2f735f]" />
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2f735f]">
                          Hints
                        </p>
                      </div>
                      <ul className="mt-2 space-y-2 text-[0.9rem] leading-6 text-[#40564b]">
                        {selectedLesson.hints.map((hint) => (
                          <li key={hint} className="flex gap-2">
                            <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-[#7ab89d]" />
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-[18px] border border-[rgba(20,31,24,0.08)] bg-white px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpenText className="h-4 w-4 text-[#2f735f]" />
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#60756a]">
                          Need a refresher?
                        </p>
                      </div>
                      <ul className="mt-2 space-y-2 text-[0.9rem] leading-6 text-[#40564b]">
                        {selectedLesson.references.map((reference) => (
                          <li key={reference} className="flex items-start gap-2">
                            <ChevronRight className="mt-1 h-4 w-4 text-[#7a9487]" />
                            <span>{reference}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-[18px] border border-[rgba(20,31,24,0.08)] bg-white px-4 py-3">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#60756a]">
                        Files to load
                      </p>
                      <div className="mt-3 space-y-2">
                        {selectedLesson.workspaceFiles.map((file) => (
                          <div
                            key={file}
                            className="flex items-center gap-2 rounded-2xl border border-[rgba(20,31,24,0.08)] bg-[#f8fbf7] px-3 py-2 text-[0.88rem] text-[#40564b]"
                          >
                            {getFileIcon(file)}
                            <span>{file.split("/").at(-1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <Button
                  type="button"
                  size="lg"
                  onClick={() => onStartLesson(selectedLesson.lessonId)}
                  disabled={isLoadingLesson || isLoadedSelection}
                  className={`h-11 rounded-full px-5 text-sm font-semibold ${
                    isLoadedSelection
                      ? "bg-[#dfe9e1] text-[#4f6458] hover:bg-[#dfe9e1]"
                      : "bg-[#2f735f] text-[#f5fff8] hover:bg-[#336f5d]"
                  }`}
                >
                  {isLoadedSelection ? (
                    "Loaded in workspace"
                  ) : isLoadingLesson ? (
                    "Loading lesson..."
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start lesson
                    </>
                  )}
                </Button>
              </>
            ) : null}
          </div>
        )}
      </ScrollArea>
    </section>
  );
}
