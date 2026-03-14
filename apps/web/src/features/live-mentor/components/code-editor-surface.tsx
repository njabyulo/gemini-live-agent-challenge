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
    <section className="panel-surface editor-grid flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-white/8">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-[#0d121b] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-2xl border border-[#72e7cf]/20 bg-[#12202a] p-2 text-[#72e7cf]">
            <FolderTree className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="workspace-eyebrow">Workspace</p>
            <p className="truncate text-sm text-[#dde8fa]">
              {lesson?.courseTitle ?? "Python foundations"} /{" "}
              {lesson?.lessonTitle ?? "echo-input"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-white/8 bg-[#0f1622] px-4 py-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <div className="rounded-[22px] border border-white/8 bg-[#0c131d] px-4 py-3">
          <div className="flex items-center gap-2 text-[#dce8fb]">
            <Sparkles className="h-4 w-4 text-[#72e7cf]" />
            <p className="text-sm font-medium">Lesson brief</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#dbe7f8]">
            {lesson?.task ??
              "Run the program, inspect the output, then fix the bug in main.py."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="rounded-full border border-white/10 bg-[#141b28] px-3 py-1 text-[11px] text-[#d9e6fa] shadow-none">
              Focus file: {lesson?.focusFilePath?.split("/").at(-1) ?? "main.py"}
            </Badge>
            {lesson?.commandSuggestions?.[0] ? (
              <Badge className="rounded-full border border-[#72e7cf]/16 bg-[#0e1d1d] px-3 py-1 text-[11px] text-[#c5fff1] shadow-none">
                {lesson.commandSuggestions[0]}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#72e7cf]/16 bg-[#0c1819] px-4 py-3">
          <div className="flex items-center gap-2 text-[#dffcf6]">
            <Bot className="h-4 w-4 text-[#72e7cf]" />
            <p className="text-sm font-medium">Tutor note</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#d3e7e2]">{tutorNote}</p>
        </div>
      </div>

      <Tabs
        value={activeFile?.path ?? files[0]?.path ?? "/workspace/main.py"}
        onValueChange={onSelectFile}
        className="min-h-0 flex-1 gap-0"
      >
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-2 border-b border-white/8 bg-[#111723] px-3 py-2"
        >
          {files.map((file) => (
            <TabsTrigger
              key={file.path}
              value={file.path}
              className="rounded-t-2xl border border-transparent px-3 py-2 text-sm text-[#89a1c0] hover:bg-[#141b28] hover:text-[#d9e6fa] data-active:border-white/10 data-active:bg-[#161e2c] data-active:text-[#f2f7ff] data-active:after:hidden"
            >
              {getFileIcon(file.path)}
              <span>{file.path.split("/").at(-1)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-[#0f1520] px-4 py-2.5 text-xs text-[#8ca0bf]">
          <span className="truncate">
            {activeFile?.path ?? "/workspace/main.py"}
          </span>
          <Badge
            variant="outline"
            className="rounded-full border-white/10 bg-[#141b28] px-2.5 py-1 text-[11px] text-[#d9e6fa]"
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
