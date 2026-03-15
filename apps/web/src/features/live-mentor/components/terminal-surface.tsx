"use client";

import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { TerminalSquare } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import {
  DEFAULT_PROGRAM_INPUT,
  PYTHON_COMMAND_PREFIX,
} from "../utils/terminal";

export function TerminalSurface({
  className,
  embedded = false,
  isRunningCommand,
  onProgramInputChange,
  onRunProgram,
  programInput,
  terminalBuffer,
}: {
  className?: string;
  embedded?: boolean;
  isRunningCommand: boolean;
  onProgramInputChange: (value: string) => void;
  onRunProgram: () => void;
  programInput: string;
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
    const helperTextarea =
      containerRef.current.parentElement?.querySelector<HTMLTextAreaElement>(
        "textarea.xterm-helper-textarea",
      );

    if (helperTextarea) {
      helperTextarea.id = "workspace-terminal-helper";
      helperTextarea.name = "workspaceTerminalHelper";
    }

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
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden",
        embedded
          ? "codebase-terminal-dock border-t border-[rgba(20,31,24,0.08)]"
          : "panel-surface rounded-[24px] border border-[rgba(20,31,24,0.1)]",
        className,
      )}
    >
      <div className="border-b border-[rgba(20,31,24,0.08)] bg-[#edf4ef] px-4 py-3">
        <form
          className="grid gap-3 lg:grid-cols-[max-content_minmax(0,1fr)_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            onRunProgram();
          }}
        >
          <div className="flex min-h-11 items-center rounded-full border border-[rgba(20,31,24,0.1)] bg-[#f8fbf7] px-4 font-mono text-[0.94rem] text-[#1d2a21] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            <TerminalSquare className="mr-3 h-4 w-4 text-[#5f7468]" />
            <span>{PYTHON_COMMAND_PREFIX}</span>
          </div>

          <div className="flex min-h-11 min-w-0 items-center rounded-full border border-[rgba(20,31,24,0.1)] bg-[#f8fbf7] px-4">
            <Input
              id="program-argument"
              name="programInput"
              value={programInput}
              onChange={(event) => onProgramInputChange(event.target.value)}
              placeholder={DEFAULT_PROGRAM_INPUT}
              className="h-10 border-0 bg-transparent px-0 font-mono text-[0.95rem] leading-6 text-[#1d2a21] placeholder:text-[#748679] focus-visible:ring-0"
            />
          </div>

          <div className="flex items-stretch justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isRunningCommand}
              className="h-11 rounded-full bg-[#2f735f] px-6 text-sm font-semibold text-[#f5fff8] hover:bg-[#336f5d]"
            >
              {isRunningCommand ? "Running..." : "Run"}
            </Button>
          </div>
        </form>

      </div>

      <div className="terminal-surface min-h-0 flex-1 bg-[#0c111b] p-3">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </section>
  );
}
