"use client";

import { Fragment, useEffect, useRef } from "react";

import type { ILessonContext } from "@agent-tutor/shared/types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { ITranscriptMessage } from "../types";

const getOperatorLabel = (role: ITranscriptMessage["role"]) => {
  switch (role) {
    case "assistant":
      return "AI";
    case "system":
      return "SYSTEM";
    default:
      return "USER";
  }
};

const renderInlineCode = (text: string) => {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded-md border border-[#7ddfcb]/25 bg-[#102320] px-1.5 py-0.5 font-mono text-[0.9em] text-[#b4fff0]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
};

const renderTranscriptBody = (text: string) => {
  const blocks = text.split(/```([\s\S]*?)```/g);

  return blocks.map((block, blockIndex) => {
    if (blockIndex % 2 === 1) {
      return (
        <pre
          key={`code-${blockIndex}`}
          className="mt-3 overflow-x-auto rounded-2xl border border-[#86b8ff]/14 bg-[#0b1320] px-3 py-3 font-mono text-[12px] leading-6 text-[#d8e8ff]"
        >
          <code>{block.trim()}</code>
        </pre>
      );
    }

    return block
      .split(/\n{2,}/g)
      .filter(Boolean)
      .map((paragraph, paragraphIndex) => (
        <p
          key={`paragraph-${blockIndex}-${paragraphIndex}`}
          className={paragraphIndex === 0 && blockIndex === 0 ? "" : "mt-3"}
        >
          {paragraph.split("\n").map((line, lineIndex) => (
            <Fragment key={`line-${blockIndex}-${paragraphIndex}-${lineIndex}`}>
              {lineIndex > 0 ? <br /> : null}
              {renderInlineCode(line)}
            </Fragment>
          ))}
        </p>
      ));
  });
};

export function VoiceAgentPanel({
  activeLesson,
  inputLevel,
  isCapturingAudio,
  isSessionLive,
  onSuggestedPrompt,
  sessionPhase,
  suggestedPrompts,
  tutorNote,
  transcripts,
}: {
  activeLesson: ILessonContext | null;
  inputLevel: number;
  isCapturingAudio: boolean;
  isSessionLive: boolean;
  onSuggestedPrompt: (prompt: string) => void;
  sessionPhase: string;
  suggestedPrompts: string[];
  tutorNote: string;
  transcripts: ITranscriptMessage[];
}) {
  const transcriptAreaRef = useRef<HTMLDivElement | null>(null);
  const isVoiceActive = isCapturingAudio && inputLevel > 0.02;
  const isTransportActive = isSessionLive || isCapturingAudio;
  const transportPhaseLabel = isTransportActive ? sessionPhase : "Tutor ready";

  useEffect(() => {
    const container =
      transcriptAreaRef.current?.querySelector<HTMLDivElement>(
        '[data-slot="scroll-area-viewport"]',
      ) ?? null;
    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom < 140) {
      container.scrollTop = container.scrollHeight;
    }
  }, [transcripts, isSessionLive]);

  return (
    <section className="voice-rail flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] p-5">
      <div ref={transcriptAreaRef} className="min-h-0 flex-1">
        <ScrollArea className="voice-transcript-scroll min-h-0 h-full pr-1">
          <div className="space-y-6 pb-36">
            <div className="border-b border-white/8 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="workspace-eyebrow">System tutor</p>
                  <h2 className="mt-1 text-[1.4rem] leading-[1.08] font-semibold tracking-[-0.035em] text-[#16211b]">
                    Gemini live copilot
                  </h2>
                  <p className="mt-2 text-[0.84rem] leading-6 text-[#5f7468]">
                    {activeLesson
                      ? `Grounded on ${activeLesson.lessonTitle}`
                      : "Start a lesson to ground the tutor on the current task."}
                  </p>
                </div>
                <Badge className="rounded-full border border-[#b8d7c4] bg-[#dff1e5] px-3 py-1.5 text-[10.5px] uppercase tracking-[0.18em] text-[#255845] shadow-none">
                  {transportPhaseLabel}
                </Badge>
              </div>

              <div className="mt-4 rounded-[20px] border border-[#b8d7c4] bg-[#eef8f1] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2f735f]">
                  Tutor note
                </p>
                <p className="mt-2 text-[0.92rem] leading-6 text-[#456255]">
                  {tutorNote}
                </p>
              </div>

              {suggestedPrompts.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <Button
                      key={prompt}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onSuggestedPrompt(prompt)}
                      className="h-9 rounded-full border-[rgba(20,31,24,0.1)] bg-[#f8fbf7] px-3.5 text-[0.82rem] text-[#32473b] hover:bg-[#edf4ef]"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-8">
              {transcripts.length ? (
                transcripts.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <article
                      key={message.id}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`voice-message max-w-[88%] ${
                          isUser
                            ? "voice-message-user items-end text-right"
                            : "voice-message-assistant items-start text-left"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-3 ${
                            isUser ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="voice-message-avatar" />
                          <p className="voice-message-label">
                            {getOperatorLabel(message.role)}
                          </p>
                        </div>

                        <div
                          className="transcript-copy voice-message-body mt-3"
                          data-role={message.role}
                        >
                          {renderTranscriptBody(message.text)}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="voice-empty-state max-w-[15rem]">
                  Start the tutor to begin the voice session.
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="voice-transport-shell pointer-events-none sticky bottom-0 mt-auto pt-5">
          <div className="voice-transport-backdrop pointer-events-none absolute inset-x-0 bottom-0 h-28" />
          {isTransportActive ? (
            <div className="voice-transport-layout voice-transport-layout-active relative">
              <div
                aria-hidden="true"
                className="voice-transport-pill voice-transport-pill-active"
              >
                <span
                  data-active={isVoiceActive}
                  className="voice-meter voice-transport-meter"
                >
                  {Array.from({ length: 30 }).map((_, index) => (
                    <span
                      key={`voice-bar-${index}`}
                      className="voice-meter-bar"
                      style={{
                        animationDelay: `${index * 0.035}s`,
                        ["--voice-level" as string]: `${Math.max(
                          inputLevel,
                          0.08,
                        )}`,
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
