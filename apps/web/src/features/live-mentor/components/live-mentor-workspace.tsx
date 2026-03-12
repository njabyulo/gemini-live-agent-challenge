"use client";

import {
  AlertCircle,
  AudioLines,
  Bot,
  CheckCircle2,
  CircleDot,
  Cloud,
  FileCode2,
  FileJson2,
  FolderTree,
  GitBranch,
  Globe,
  GripHorizontal,
  MessageSquareText,
  Mic,
  MicOff,
  NotebookText,
  Play,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  TerminalSquare,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { useLiveMentorDemo } from "../hooks/use-live-mentor-demo";
import type { IWorkspaceFile } from "../types";
import { CodeEditorSurface } from "./code-editor-surface";

export function LiveMentorWorkspace() {
  const {
    activeFile,
    files,
    connectSession,
    finishAudioCapture,
    interruptMentor,
    isCapturingAudio,
    isSessionLive,
    lesson,
    messages,
    resetDemo,
    runTests,
    selectFile,
    sendTextPrompt,
    sessionPhase,
    setCode,
    setTerminalTab,
    setTypedPrompt,
    shareScreenshot,
    startAudioCapture,
    statusLabel,
    stopSession,
    terminalNote,
    terminalTab,
    testState,
    typedPrompt,
  } = useLiveMentorDemo();

  const activityItems = [
    "Open the failing lesson and start the live mentor session.",
    "Ask out loud why the tests are failing.",
    "Rerun tests after each code change and let the mentor adapt.",
    "Land on the ready-to-submit summary.",
  ];

  const phaseSummary = getPhaseSummary(sessionPhase);

  return (
    <main className="min-h-screen bg-[#090d14] px-3 py-3 text-[#edf3ff] sm:px-4 sm:py-4">
      <div className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1780px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111722] shadow-[0_24px_120px_rgba(4,10,18,0.58)]">
        <header className="border-b border-white/8 bg-[#0d131d]">
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2f]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex items-center gap-3 text-sm workspace-ui">
                <span className="font-semibold tracking-[0.22em] text-[#7ce7d3] uppercase">
                  Garrii Live Mentor
                </span>
                <span className="hidden text-[#8095b3] sm:inline">/</span>
                <span className="hidden text-[#bcc8db] sm:inline">
                  {lesson.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Badge tone="slate">
                <Cloud className="h-3.5 w-3.5" />
                Cloud Run agent
              </Badge>
              <Badge tone="slate">
                <Globe className="h-3.5 w-3.5" />
                gemini-live.njabulomajozi.com
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 px-5 py-4">
            <div className="space-y-2">
              <p className="workspace-eyebrow">Lesson objective</p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="workspace-heading text-[2rem] font-semibold leading-[1.06] text-[#f8fbff]">
                  {lesson.objective}
                </h1>
                <Badge tone="teal">{testState.label}</Badge>
              </div>
              <p className="workspace-copy max-w-4xl text-[15px] leading-7">
                {lesson.task}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusPill label={statusLabel} phase={sessionPhase} />
              <MetricChip
                label="Target"
                value="Voice -> fix -> rerun -> summary"
              />
              <MetricChip label="Current file" value={activeFile.label} />
            </div>
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-9.75rem)] lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="min-w-0 border-b border-white/8 lg:border-b-0 lg:border-r">
            <div className="grid min-h-full lg:grid-cols-[248px_minmax(0,1fr)]">
              <aside className="border-b border-white/8 bg-[#0f1520] lg:border-b-0 lg:border-r">
                <div className="px-4 py-4">
                  <div className="workspace-eyebrow mb-5 flex items-center gap-2">
                    <FolderTree className="h-3.5 w-3.5" />
                    Explorer
                  </div>

                  <div className="rounded-[18px] border border-white/8 bg-[#121927] p-3">
                    <p className="workspace-eyebrow">Open editors</p>
                    <div className="mt-3 space-y-2">
                      {files
                        .filter((file) => file.path === activeFile.path)
                        .map((file) => (
                          <button
                            key={file.path}
                            type="button"
                            onClick={() => selectFile(file.path)}
                            className="flex w-full items-center gap-2 rounded-xl bg-[#1a2233] px-3 py-2 text-left text-sm text-[#f6f8ff]"
                          >
                            {getFileIcon(file.kind)}
                            <span className="truncate">{file.label}</span>
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    {files.map((file) => (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => selectFile(file.path)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                          file.path === activeFile.path
                            ? "bg-[#182130] text-[#f4f7ff]"
                            : "text-[#b0bfd4] hover:bg-[#141c2a] hover:text-[#f4f7ff]",
                        )}
                      >
                        {getFileIcon(file.kind)}
                        <span className="min-w-0 flex-1 truncate">
                          {file.path}
                        </span>
                        {file.status ? (
                          <span
                            className={cn(
                              "text-[10px] font-semibold uppercase tracking-[0.2em]",
                              file.status === "modified"
                                ? "text-[#6ee7c8]"
                                : "text-[#ffb86b]",
                            )}
                          >
                            {file.status === "modified" ? "M" : "!"}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[18px] border border-white/8 bg-[#121927] p-3">
                    <p className="workspace-eyebrow">Expected outcome</p>
                    <p className="workspace-copy mt-3 text-[15px] leading-7">
                      {lesson.expectedOutcome}
                    </p>
                  </div>
                </div>
              </aside>

              <div className="grid min-h-full grid-rows-[auto_minmax(0,1fr)_296px]">
                <div className="border-b border-white/8 bg-[#101620]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {files.slice(0, 3).map((file) => (
                        <button
                          key={file.path}
                          type="button"
                          onClick={() => selectFile(file.path)}
                          className={cn(
                            "flex items-center gap-2 rounded-t-2xl border border-transparent px-3 py-2 text-sm",
                            file.path === activeFile.path
                              ? "border-white/10 bg-[#141924] text-[#f4f7ff]"
                              : "text-[#96a8c6] hover:bg-[#141c2a] hover:text-[#dfe8f7]",
                          )}
                        >
                          {getFileIcon(file.kind)}
                          {file.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#96a8c6]">
                      <InlineStatusPill>
                        <GitBranch className="h-3.5 w-3.5" />
                        main
                      </InlineStatusPill>
                      <InlineStatusPill>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        typesafe
                      </InlineStatusPill>
                      <InlineStatusPill>
                        <Radio className="h-3.5 w-3.5" />
                        port 3000
                      </InlineStatusPill>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="workspace-subtle flex items-center gap-2 text-xs">
                      <Sparkles className="h-4 w-4 text-[#7ce7d3]" />
                      src / components / ContinueButton.tsx
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#8ea3c1]">
                      <span className="rounded-full border border-white/10 bg-[#111c2a] px-2.5 py-1">
                        React lesson workspace
                      </span>
                      <span className="rounded-full border border-white/10 bg-[#111c2a] px-2.5 py-1">
                        Mentor-aware terminal
                      </span>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 bg-[#141924] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <CodeEditorSurface
                    activeFile={activeFile}
                    onChange={setCode}
                  />
                </div>

                <section className="min-h-0 border-t border-white/8 bg-[#0c121b]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TerminalSquare className="h-4 w-4 text-[#67d6c0]" />
                      <div className="flex items-center gap-2">
                        <TerminalTabButton
                          active={terminalTab === "tests"}
                          label="Tests"
                          onClick={() => setTerminalTab("tests")}
                        />
                        <TerminalTabButton
                          active={terminalTab === "notes"}
                          label="Notes"
                          onClick={() => setTerminalTab("notes")}
                        />
                        <TerminalTabButton
                          active={terminalTab === "activity"}
                          label="Activity"
                          onClick={() => setTerminalTab("activity")}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        onClick={runTests}
                        className="rounded-full border border-[#4cc8ae]/25 bg-[#18342f] text-[#d8fff2] hover:bg-[#1d4038]"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Run tests
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void shareScreenshot()}
                        className="rounded-full border-white/10 bg-transparent text-[#d7e3fb] hover:bg-white/6"
                      >
                        Share screenshot
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetDemo}
                        className="rounded-full border-white/10 bg-transparent text-[#d7e3fb] hover:bg-white/6"
                      >
                        Reset demo
                      </Button>
                    </div>
                  </div>

                  <div className="grid min-h-0 gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.15fr)_320px]">
                    <div className="min-h-0 rounded-[20px] border border-white/8 bg-[#0b1019] p-4 font-mono text-sm leading-7 text-[#e5ffe3]">
                      {terminalTab === "tests" ? (
                        <>
                          <p className="workspace-eyebrow mb-3 flex items-center gap-2">
                            <GripHorizontal className="h-3.5 w-3.5" />
                            Terminal output
                          </p>
                          <pre className="whitespace-pre-wrap">
                            {testState.terminalOutput}
                          </pre>
                        </>
                      ) : null}

                      {terminalTab === "notes" ? (
                        <div className="space-y-3 font-sans text-[#d9e4f5]">
                          <p className="workspace-eyebrow">Mentor angle</p>
                          <h3 className="workspace-heading text-xl font-semibold text-[#f6f9ff]">
                            {terminalNote.title}
                          </h3>
                          <p className="workspace-copy text-[15px] leading-7">
                            {terminalNote.body}
                          </p>
                          <div className="rounded-[18px] border border-[#2e6a58] bg-[#11261f] px-4 py-3 text-sm text-[#e0fff5]">
                            {testState.mentorHint}
                          </div>
                        </div>
                      ) : null}

                      {terminalTab === "activity" ? (
                        <div className="space-y-3 font-sans text-[#d9e4f5]">
                          <p className="workspace-eyebrow">Demo flow</p>
                          {activityItems.map((item, index) => (
                            <div
                              key={item}
                              className="flex items-start gap-3 rounded-[16px] border border-white/8 bg-[#121927] px-3 py-3 text-sm leading-6"
                            >
                              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#1c2636] text-[11px] font-semibold text-[#72d8c2]">
                                {index + 1}
                              </span>
                              <span className="text-[#c1cde0]">{item}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      <InfoCard
                        icon={<CircleDot className="h-4 w-4 text-[#67d6c0]" />}
                        label="Current state"
                        value={testState.label}
                        description={testState.summary}
                      />
                      <InfoCard
                        icon={
                          <NotebookText className="h-4 w-4 text-[#ffca73]" />
                        }
                        label="Lesson"
                        value={lesson.title}
                        description={lesson.expectedOutcome}
                      />
                      <InfoCard
                        icon={
                          <CheckCircle2 className="h-4 w-4 text-[#8cf0aa]" />
                        }
                        label="Dopamine hit"
                        value="Red to almost-green"
                        description="The mentor gives one grounded spoken step, and the rerun immediately shows progress."
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>

          <aside className="flex min-h-0 flex-col bg-[#0f1520]">
            <div className="border-b border-white/8 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="workspace-eyebrow">Live mentor</p>
                  <h2 className="workspace-heading mt-2 text-[2rem] font-semibold leading-[1.08] text-[#f8fbff]">
                    Voice, transcript, interruption
                  </h2>
                  <p className="workspace-copy mt-3 max-w-sm text-[15px] leading-7">
                    A grounded live coding coach that sees lesson intent,
                    terminal state, and your last test rerun.
                  </p>
                </div>
                <div
                  className="agent-orb flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px]"
                  data-phase={sessionPhase}
                >
                  <div
                    className="voice-bars flex h-10 items-end gap-1"
                    aria-hidden="true"
                  >
                    <span className="h-3" />
                    <span className="h-6" />
                    <span className="h-8" />
                    <span className="h-5" />
                    <span className="h-3" />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(23,33,49,0.88),rgba(14,20,31,0.96))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#f7fbff]">
                      <AudioLines className="h-4 w-4 text-[#7ce7d3]" />
                      {phaseSummary.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#b9c7db]">
                      {phaseSummary.description}
                    </p>
                  </div>
                  <Badge tone="teal">
                    <Bot className="h-3.5 w-3.5" />
                    Gemini Live
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                  <InlineStatusPill>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Grounded in tests
                  </InlineStatusPill>
                  <InlineStatusPill>
                    <AudioLines className="h-3.5 w-3.5" />
                    Interruptible
                  </InlineStatusPill>
                  <InlineStatusPill>
                    <Cloud className="h-3.5 w-3.5" />
                    Cloud Run runtime
                  </InlineStatusPill>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={connectSession}
                  disabled={isSessionLive}
                  className="rounded-full border border-[#4cc8ae]/30 bg-[linear-gradient(180deg,#1a5a4e,#153d36)] text-[#e3fff7] shadow-[0_10px_24px_rgba(13,53,45,0.35)] hover:bg-[linear-gradient(180deg,#1d6457,#17463e)]"
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Talk to mentor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopSession}
                  disabled={!isSessionLive}
                  className="rounded-full border-white/10 bg-[#101827] text-[#d7e3fb] hover:bg-[#152033]"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop session
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void startAudioCapture()}
                  disabled={!isSessionLive || isCapturingAudio}
                  className="rounded-full border-white/10 bg-[#101827] text-[#d7e3fb] hover:bg-[#152033]"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Start mic
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={finishAudioCapture}
                  disabled={!isCapturingAudio}
                  className="rounded-full border-white/10 bg-[#101827] text-[#d7e3fb] hover:bg-[#152033]"
                >
                  <MicOff className="mr-2 h-4 w-4" />
                  Stop mic
                </Button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#f4f7ff]">
                  <MessageSquareText className="h-4 w-4 text-[#7ce7d3]" />
                  Transcript
                </div>
                <div className="text-xs text-[#93a8c7]">
                  Hard fail {"->"} Almost there {"->"} Ready to submit
                </div>
              </div>

              <div className="flex min-h-[260px] flex-1 flex-col gap-2 overflow-y-auto rounded-[22px] border border-white/8 bg-[#0b1018] p-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[92%] rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm",
                      message.role === "assistant" &&
                        "mr-auto bg-[#15362f] text-[#d8fff2]",
                      message.role === "user" &&
                        "ml-auto bg-[#192233] text-[#edf3ff]",
                      message.role === "system" &&
                        "mx-auto bg-[#121927] text-[#c2d0e3]",
                    )}
                  >
                    {message.text}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[22px] border border-white/8 bg-[#0b1018] p-3">
                <label
                  htmlFor="typed-prompt"
                  className="mb-2 block text-sm font-semibold text-[#f4f7ff]"
                >
                  Typed fallback
                </label>
                <textarea
                  id="typed-prompt"
                  value={typedPrompt}
                  onChange={(event) => setTypedPrompt(event.target.value)}
                  className="min-h-28 w-full resize-none rounded-[18px] border border-white/10 bg-[#121927] px-4 py-3 text-sm leading-6 text-[#edf3ff] outline-none placeholder:text-[#8ba1bf]"
                  placeholder="I reran tests and the click handler is still failing..."
                />

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={sendTextPrompt}
                    disabled={!isSessionLive || !typedPrompt.trim()}
                    className="rounded-full border border-[#4cc8ae]/25 bg-[#18342f] text-[#d8fff2] hover:bg-[#1d4038]"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send prompt
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={interruptMentor}
                    disabled={!isSessionLive}
                    className="rounded-full border-white/10 bg-transparent text-[#d7e3fb] hover:bg-white/6"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Interrupt
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-[#111927] p-4">
      <div className="workspace-eyebrow flex items-center gap-2">
        {icon}
        {label}
      </div>
      <p className="workspace-heading mt-3 text-[1.4rem] font-semibold text-[#f6f9ff]">
        {value}
      </p>
      <p className="workspace-copy mt-2 text-[15px] leading-7">{description}</p>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-[#111a27] px-3 py-2 text-xs text-[#c1d0e2]">
      <span className="font-semibold text-[#7ce7d3]">{label}:</span> {value}
    </div>
  );
}

function InlineStatusPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111a27] px-2.5 py-1 text-[#aebed3]">
      {children}
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "slate" | "teal";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
        tone === "slate" && "border-white/10 bg-[#121927] text-[#d2def0]",
        tone === "teal" && "border-[#3ab89d]/35 bg-[#143730] text-[#e0fff5]",
      )}
    >
      {children}
    </div>
  );
}

function getPhaseSummary(
  phase: ReturnType<typeof useLiveMentorDemo>["sessionPhase"],
) {
  if (phase === "listening") {
    return {
      title: "Listening for the learner",
      description:
        "The mentor is actively taking voice input and waiting for the next grounded question.",
    };
  }

  if (phase === "thinking") {
    return {
      title: "Reasoning on the latest test state",
      description:
        "Gemini is reconciling the lesson objective with the newest terminal context before speaking.",
    };
  }

  if (phase === "speaking") {
    return {
      title: "Delivering one concrete step",
      description:
        "The mentor is in spoken coaching mode and can still be interrupted for a sharper follow-up.",
    };
  }

  if (phase === "ready") {
    return {
      title: "Session ready",
      description:
        "Mic, transcript, and context tools are available. Ask out loud why the tests are failing to start the loop.",
    };
  }

  if (phase === "connecting") {
    return {
      title: "Connecting to the live runtime",
      description:
        "Cloud Run is opening the live tutor session and preparing the grounded coaching tools.",
    };
  }

  if (phase === "error") {
    return {
      title: "Runtime attention needed",
      description:
        "The live connection needs recovery before the mentor can continue the voice loop.",
    };
  }

  return {
    title: "Standby",
    description:
      "The mentor dock is waiting for the live session to start. The workspace is already primed with lesson and failing test context.",
  };
}

function StatusPill({
  label,
  phase,
}: {
  label: string;
  phase: ReturnType<typeof useLiveMentorDemo>["sessionPhase"];
}) {
  return (
    <div
      className={cn(
        "rounded-full px-3 py-2 text-xs font-semibold",
        phase === "idle" && "bg-[#1a2232] text-[#c7d3e8]",
        phase === "connecting" && "bg-[#3c2e13] text-[#ffd78b]",
        phase === "ready" && "bg-[#17324d] text-[#a6d7ff]",
        phase === "listening" && "bg-[#14362f] text-[#b2ffe8]",
        phase === "thinking" && "bg-[#382615] text-[#ffc989]",
        phase === "speaking" && "bg-[#1b2744] text-[#c1d7ff]",
        phase === "error" && "bg-[#421b20] text-[#ffb8c0]",
      )}
    >
      {label}
    </div>
  );
}

function TerminalTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase transition-colors",
        active
          ? "bg-[#192334] text-[#f4f7ff]"
          : "text-[#95a9c8] hover:bg-[#141b28] hover:text-[#e0e9f7]",
      )}
    >
      {label}
    </button>
  );
}

function getFileIcon(kind: IWorkspaceFile["kind"]) {
  if (kind === "json") {
    return <FileJson2 className="h-4 w-4 shrink-0 text-[#ffca73]" />;
  }

  if (kind === "md") {
    return <NotebookText className="h-4 w-4 shrink-0 text-[#9ec4ff]" />;
  }

  return <FileCode2 className="h-4 w-4 shrink-0 text-[#7ce7d3]" />;
}
