"use client";

import dynamic from "next/dynamic";

import type { IWorkspaceFile } from "../types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] items-center justify-center bg-[#141924] text-sm text-[#96a6c4]">
      Loading Monaco workspace...
    </div>
  ),
});

function getLanguage(path: string): string {
  if (path.endsWith(".tsx")) {
    return "typescript";
  }

  if (path.endsWith(".ts")) {
    return "typescript";
  }

  if (path.endsWith(".json")) {
    return "json";
  }

  if (path.endsWith(".md")) {
    return "markdown";
  }

  return "plaintext";
}

export function CodeEditorSurface({
  activeFile,
  onChange,
}: {
  activeFile: IWorkspaceFile;
  onChange: (value: string) => void;
}) {
  return (
    <MonacoEditor
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("garrii-night", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "comment", foreground: "6f869f" },
            { token: "keyword", foreground: "c679ff" },
            { token: "string", foreground: "e8d177" },
            { token: "number", foreground: "7dd6c2" },
            { token: "identifier", foreground: "dbe7ff" },
            { token: "delimiter", foreground: "8297b6" },
          ],
          colors: {
            "editor.background": "#141924",
            "editor.foreground": "#edf3ff",
            "editorGutter.background": "#141924",
            "editor.lineHighlightBackground": "#1b2230",
            "editor.lineHighlightBorder": "#00000000",
            "editorCursor.foreground": "#73e0c2",
            "editorBracketMatch.background": "#27415f55",
            "editorBracketMatch.border": "#4c87d1",
            "editor.findMatchBackground": "#2f4f6f88",
            "editor.findMatchHighlightBackground": "#2f4f6f44",
            "editor.hoverHighlightBackground": "#20324a55",
            "editor.selectionBackground": "#2f4f6f66",
            "editor.inactiveSelectionBackground": "#2f4f6f44",
            "editorLineNumber.foreground": "#7f91ac",
            "editorLineNumber.activeForeground": "#c0d1eb",
            "editorIndentGuide.background1": "#263244",
            "editorIndentGuide.activeBackground1": "#38506e",
            "editorWhitespace.foreground": "#32425a",
            "editorWidget.background": "#1a2130",
            "minimap.background": "#101520",
            "minimap.selectionHighlight": "#2f4f6f55",
          },
        });
      }}
      defaultLanguage={getLanguage(activeFile.path)}
      height="100%"
      keepCurrentModel
      language={getLanguage(activeFile.path)}
      loading="Loading editor..."
      onChange={(value) => onChange(value ?? "")}
      options={{
        automaticLayout: true,
        bracketPairColorization: { enabled: true },
        cursorStyle: "line-thin",
        contextmenu: false,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        fontFamily: "var(--font-mono)",
        fontLigatures: true,
        fontSize: 15,
        lineHeight: 24,
        glyphMargin: true,
        guides: { bracketPairs: true, indentation: true },
        minimap: {
          enabled: true,
          side: "right",
          size: "fit",
          maxColumn: 100,
          renderCharacters: false,
          showSlider: "mouseover",
        },
        padding: { top: 20, bottom: 24 },
        readOnly: !activeFile.isEditable,
        renderLineHighlightOnlyWhenFocus: false,
        roundedSelection: false,
        rulers: [88],
        scrollBeyondLastLine: false,
        scrollbar: {
          alwaysConsumeMouseWheel: false,
          horizontalScrollbarSize: 10,
          verticalScrollbarSize: 10,
        },
        stickyScroll: { enabled: false },
        smoothScrolling: true,
        wordWrap: "on",
      }}
      path={activeFile.path}
      saveViewState
      theme="garrii-night"
      value={activeFile.content}
    />
  );
}
