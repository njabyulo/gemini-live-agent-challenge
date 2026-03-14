"use client";

import Editor, { type Monaco } from "@monaco-editor/react";
import {
  BookOpenText,
  Bot,
  FileCode2,
  FlaskConical,
  FolderTree,
  Sparkles,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";

import type {
  ILessonContext,
  IWorkspaceFileRecord,
} from "@agent-tutor/shared/types";

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
  monaco.editor.defineTheme("agent-tutor-dark", {
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
  files,
  lesson,
  onChange,
  onSelectFile,
  tutorNote,
}: {
  activeFile: IWorkspaceFileRecord | null;
  files: IWorkspaceFileRecord[];
  lesson: ILessonContext | null;
  onChange: (value: string) => void;
  onSelectFile: (path: string) => void;
  tutorNote: string;
}) {
  return (
    <section className="panel-surface editor-grid flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-[rgba(20,31,24,0.1)]">
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(20,31,24,0.1)] bg-[#f7fbf7] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-2xl border border-[#b8d7c4] bg-[#dff1e5] p-2 text-[#2f735f]">
            <FolderTree className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="workspace-eyebrow">Workspace</p>
            <p className="truncate text-sm text-[#213126]">
              {lesson?.courseTitle ?? "Python foundations"} /{" "}
              {lesson?.lessonTitle ?? "echo-input"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-[rgba(20,31,24,0.1)] bg-[#edf4ef] px-4 py-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <div className="rounded-[22px] border border-[rgba(20,31,24,0.1)] bg-[#f8fbf7] px-4 py-3">
          <div className="flex items-center gap-2 text-[#1f3026]">
            <Sparkles className="h-4 w-4 text-[#2f735f]" />
            <p className="text-sm font-medium">Lesson brief</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#44554b]">
            {lesson?.task ??
              "Run the program, inspect the output, then fix the bug in main.py."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="rounded-full border border-[rgba(20,31,24,0.12)] bg-[#edf4ef] px-3 py-1 text-[11px] text-[#385043] shadow-none">
              Focus file: {lesson?.focusFilePath?.split("/").at(-1) ?? "main.py"}
            </Badge>
            {lesson?.commandSuggestions?.[0] ? (
              <Badge className="rounded-full border border-[#b8d7c4] bg-[#dff1e5] px-3 py-1 text-[11px] text-[#265847] shadow-none">
                {lesson.commandSuggestions[0]}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#b8d7c4] bg-[#eaf6ed] px-4 py-3">
          <div className="flex items-center gap-2 text-[#214032]">
            <Bot className="h-4 w-4 text-[#2f735f]" />
            <p className="text-sm font-medium">Tutor note</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#446255]">{tutorNote}</p>
        </div>
      </div>

      <Tabs
        value={activeFile?.path ?? files[0]?.path ?? "/workspace/main.py"}
        onValueChange={onSelectFile}
        className="min-h-0 flex-1 gap-0"
      >
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-2 border-b border-[rgba(20,31,24,0.1)] bg-[#f1f6f2] px-3 py-2"
        >
          {files.map((file) => (
            <TabsTrigger
              key={file.path}
              value={file.path}
              className="rounded-t-2xl border border-transparent px-3 py-2 text-sm text-[#5b6f63] hover:bg-[#e8f0ea] hover:text-[#1e2d22] data-active:border-[rgba(20,31,24,0.08)] data-active:bg-[#0f1619] data-active:text-[#f2f7f4] data-active:after:hidden"
            >
              {getFileIcon(file.path)}
              <span>{file.path.split("/").at(-1)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center justify-between gap-3 border-b border-[rgba(20,31,24,0.1)] bg-[#f8fbf7] px-4 py-2.5 text-xs text-[#5f7468]">
          <span className="truncate">
            {activeFile?.path ?? "/workspace/main.py"}
          </span>
          <Badge
            variant="outline"
            className="rounded-full border-[rgba(20,31,24,0.12)] bg-[#edf4ef] px-2.5 py-1 text-[11px] text-[#385043]"
          >
            {activeFile?.isEditable ? "Editable" : "Reference file"}
          </Badge>
        </div>

        <TabsContent
          value={activeFile?.path ?? files[0]?.path ?? "/workspace/main.py"}
          className="min-h-0 flex-1 bg-[#0e131d]"
        >
          <Editor
            beforeMount={handleBeforeMount}
            defaultLanguage="python"
            language={resolveLanguage(activeFile?.path ?? "/workspace/main.py")}
            onChange={(value) => onChange(value ?? "")}
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
            path={activeFile?.path}
            theme="agent-tutor-dark"
            value={activeFile?.content ?? ""}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
