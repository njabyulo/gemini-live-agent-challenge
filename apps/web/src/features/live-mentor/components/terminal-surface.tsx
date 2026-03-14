"use client";

import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { FlaskConical, RotateCcw, TerminalSquare } from "lucide-react";
import { useEffect, useRef } from "react";

import type {
  ILessonContext,
  IRuntimeSnapshot,
} from "@agent-tutor/shared/types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  DEFAULT_PROGRAM_INPUT,
  PYTHON_COMMAND_PREFIX,
} from "../utils/terminal";

export function TerminalSurface({
  ambientCue,
  isRunningCommand,
  lesson,
  onProgramInputChange,
  onReset,
  onRunProgram,
  onRunTests,
  programInput,
  runtime,
  terminalBuffer,
}: {
  ambientCue: string;
  isRunningCommand: boolean;
  lesson: ILessonContext | null;
  onProgramInputChange: (value: string) => void;
  onReset: () => void;
  onRunProgram: () => void;
  onRunTests: () => void;
  programInput: string;
  runtime: IRuntimeSnapshot;
  terminalBuffer: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) {
      return;
    }

    const terminal = new Terminal({
      allowTransparency: true,
      convertEol: true,
      cursorBlink: false,
      cursorStyle: "bar",
      disableStdin: true,
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      lineHeight: 1.35,
      theme: {
        background: "#0c111b",
        brightBlue: "#6fb5ff",
        brightCyan: "#7ce7d3",
        brightGreen: "#a7f3a0",
        brightRed: "#ff8f7b",
        foreground: "#dbe6f8",
        red: "#ff7d6a",
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      fitAddon.dispose();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    terminalRef.current.reset();
    terminalRef.current.write(terminalBuffer);
    fitAddonRef.current?.fit();
  }, [terminalBuffer]);

  return (
    <section className="panel-surface flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-white/8">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-[#0d121b] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-[#6fb5ff]/18 bg-[#132134] p-2 text-[#6fb5ff]">
            <TerminalSquare className="h-4 w-4" />
          </div>
          <div>
            <p className="workspace-eyebrow">Terminal</p>
            <p className="text-sm text-[#dbe6f8]">
              Run the program, inspect the output, then tighten the fix.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Separator
            orientation="vertical"
            className="hidden h-8 bg-white/8 sm:block"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRunTests}
            disabled={isRunningCommand}
            className="border-[#86b8ff]/16 bg-[#101927] text-[#d9e7ff] hover:bg-[#142033]"
          >
            <FlaskConical className="mr-2 h-4 w-4" />
            Run tests
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            className="border-white/10 bg-white/5 text-[#dbe6f8] hover:bg-white/8"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset lesson
          </Button>
        </div>
      </div>

      <div className="border-b border-white/8 bg-[#0f1622] px-4 py-3">
        <form
          className="grid gap-3 xl:grid-cols-[max-content_minmax(0,1fr)_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            onRunProgram();
          }}
        >
          <div className="flex min-h-12 items-center rounded-full border border-[#243141] bg-[#0b1018] px-4 font-mono text-[0.95rem] text-[#eff5ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span className="mr-3 text-[#5f7391]">$</span>
            <span>{PYTHON_COMMAND_PREFIX}</span>
          </div>

          <div className="flex min-h-12 min-w-0 items-center rounded-full border border-[#243141] bg-[#0b1018] px-4">
            <Input
              id="program-argument"
              value={programInput}
              onChange={(event) => onProgramInputChange(event.target.value)}
              placeholder={DEFAULT_PROGRAM_INPUT}
              className="h-8 border-0 bg-transparent px-0 font-mono text-[0.95rem] text-[#e7eefb] placeholder:text-[#5d708f] focus-visible:ring-0"
            />
          </div>

          <div className="flex items-stretch justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isRunningCommand}
              className="h-12 rounded-full bg-[#173a39] px-5 text-[#e5fff8] hover:bg-[#1d4846]"
            >
              {isRunningCommand ? "Running..." : "Run"}
            </Button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge className="rounded-full border border-[#72e7cf]/16 bg-[#0f1d1c] px-3 py-1 text-[11px] text-[#c6fff0] shadow-none">
            {ambientCue}
          </Badge>
          {lesson?.expectedOutcome ? (
            <Badge className="rounded-full border border-white/10 bg-[#141b28] px-3 py-1 text-[11px] text-[#d8e4f7] shadow-none">
              Goal: {lesson.expectedOutcome}
            </Badge>
          ) : null}
          {runtime.command ? (
            <Badge className="rounded-full border border-[#6fb5ff]/14 bg-[#101927] px-3 py-1 text-[11px] text-[#d9e7ff] shadow-none">
              Last command: {runtime.command}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="terminal-surface min-h-0 flex-1 bg-[#0c111b] p-3">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </section>
  );
}
