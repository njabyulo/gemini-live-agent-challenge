"use client";

import Editor, { type Monaco } from "@monaco-editor/react";
import {
  FileCode2,
  FlaskConical,
  BookOpenText,
} from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

import type { IWorkspaceFileRecord } from "@gemini-live-agent/shared/types";

const resolveLanguage = (path: string) => {
  if (path.endsWith(".py")) {
    return "python";
  }

  if (path.endsWith(".md")) {
    return "markdown";
  }

  return "plaintext";
};

const getFileIcon = (path: string) => {
  if (path.endsWith("test_main.py")) {
    return <FlaskConical className="h-4 w-4 text-[#ffb86b]" />;
  }

  if (path.endsWith(".md")) {
    return <BookOpenText className="h-4 w-4 text-[#6fb5ff]" />;
  }

  return <FileCode2 className="h-4 w-4 text-[#72e7cf]" />;
};

const handleBeforeMount = (monaco: Monaco) => {
  monaco.editor.defineTheme("gemini-live-agent-dark", {
    base: "vs-dark",
    inherit: true,
    colors: {
      "editor.background": "#0e131d",
      "editor.foreground": "#e7eefb",
      "editor.lineHighlightBackground": "#1a2232",
      "editorLineNumber.foreground": "#6b7d99",
      "editorLineNumber.activeForeground": "#cad7ed",
      "editor.selectionBackground": "#254463",
      "editorCursor.foreground": "#7ce7d3",
      "editorIndentGuide.background1": "#1d2940",
      "editorIndentGuide.activeBackground1": "#35516c",
      "minimap.background": "#0b1018",
    },
    rules: [
      { token: "comment", foreground: "627693", fontStyle: "italic" },
      { token: "keyword", foreground: "8cc8ff" },
      { token: "string", foreground: "a5f3a2" },
      { token: "number", foreground: "ffc279" },
      { token: "delimiter", foreground: "8aa2c8" },
    ],
  });
};

export function CodeEditorSurface({
  activeFile,
  className,
  embedded = false,
  files,
  onChange,
  onSelectFile,
}: {
  activeFile: IWorkspaceFileRecord | null;
  className?: string;
  embedded?: boolean;
  files: IWorkspaceFileRecord[];
  onChange: (path: string, value: string) => void;
  onSelectFile: (path: string) => void;
}) {
  const activePath = activeFile?.path ?? files[0]?.path ?? "/workspace/main.py";
  const editorSurfaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorSurfaceRef.current) {
      return;
    }

    const setImeTextareaAttributes = () => {
      const imeTextarea =
        editorSurfaceRef.current?.querySelector<HTMLTextAreaElement>(
          "textarea.ime-text-area",
        );

      if (!imeTextarea) {
        return;
      }

      imeTextarea.id = "workspace-editor-ime";
      imeTextarea.name = "workspaceEditorIme";
    };

    setImeTextareaAttributes();

    const observer = new MutationObserver(() => {
      setImeTextareaAttributes();
    });

    observer.observe(editorSurfaceRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [activePath]);

  return (
    <section
      ref={editorSurfaceRef}
      className={cn(
        "editor-grid flex min-h-0 flex-col overflow-hidden",
        embedded
          ? "codebase-editor-surface"
          : "panel-surface rounded-[24px] border border-[rgba(20,31,24,0.1)]",
        className,
      )}
    >
      <Tabs
        value={activePath}
        onValueChange={onSelectFile}
        className="min-h-0 flex-1 gap-0"
      >
        <TabsList
          variant="line"
          className="h-auto w-full flex-nowrap justify-start gap-1.5 overflow-x-auto border-b border-[rgba(20,31,24,0.08)] bg-[#eff4f0] px-3 py-2"
        >
          {files.map((file) => (
            <TabsTrigger
              key={file.path}
              value={file.path}
              className={`h-10 min-w-fit flex-none justify-start rounded-xl border px-3.5 py-2 text-[0.9rem] font-medium after:hidden ${
                activeFile?.path === file.path
                  ? "!border-[#1f2c38] !bg-[#162028] !text-[#edf4ff] shadow-[0_12px_24px_rgba(6,10,17,0.14)] hover:!bg-[#162028] hover:!text-[#edf4ff]"
                  : "border-transparent text-[#5b6f63] hover:bg-[#e8f0ea] hover:text-[#1e2d22]"
              }`}
            >
              {getFileIcon(file.path)}
              <span>{file.path.split("/").at(-1)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value={activePath}
          className="min-h-0 flex-1 bg-[#0e131d]"
        >
          <Editor
            beforeMount={handleBeforeMount}
            defaultLanguage="python"
            key={activePath}
            language={resolveLanguage(activePath)}
            onChange={(value) => onChange(activePath, value ?? "")}
            options={{
              automaticLayout: true,
              fontFamily: "var(--font-mono)",
              fontLigatures: true,
              fontSize: 14,
              lineDecorationsWidth: 12,
              lineNumbersMinChars: 3,
              minimap: { enabled: true },
              padding: { top: 18, bottom: 18 },
              readOnly: !activeFile?.isEditable,
              renderWhitespace: "selection",
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              tabSize: 4,
            }}
            path={activePath}
            theme="gemini-live-agent-dark"
            value={activeFile?.content ?? ""}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
