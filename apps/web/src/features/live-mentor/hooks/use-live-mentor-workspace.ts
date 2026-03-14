"use client";

import {
  DEFAULT_LESSON_ID,
  PYTHON_FOUNDATIONS_COURSE,
  getLessonContextById,
  getNextLessonId,
} from "@agent-tutor/shared/consts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useSession } from "~/features/auth/services/auth-client";

import {
  bootstrapLessonWorkspace,
  loadLessonWorkspace,
  resetLessonWorkspace,
  runLessonCommand,
  updateMainFile,
} from "../services/lesson-api";
import { useLiveMentorStore } from "../states/use-live-mentor-store";
import {
  formatPythonProgramCommand,
  formatTerminalExchange,
  PYTEST_COMMAND,
} from "../utils/terminal";

export function useLiveMentorWorkspace() {
  const queryClient = useQueryClient();
  const lastSavedSourceRef = useRef<string>("");
  const hasAnnouncedReadinessRef = useRef(false);

  const {
    data: session,
    error: sessionError,
    isPending: isSessionPending,
  } = useSession();

  const activeFilePath = useLiveMentorStore((state) => state.activeFilePath);
  const activeRailTab = useLiveMentorStore((state) => state.activeRailTab);
  const completedTopicIds = useLiveMentorStore((state) => state.completedTopicIds);
  const files = useLiveMentorStore((state) => state.files);
  const lesson = useLiveMentorStore((state) => state.lesson);
  const lessonView = useLiveMentorStore((state) => state.lessonView);
  const loadedTopicId = useLiveMentorStore((state) => state.loadedTopicId);
  const programInput = useLiveMentorStore((state) => state.programInput);
  const runtime = useLiveMentorStore((state) => state.runtime);
  const sandboxId = useLiveMentorStore((state) => state.sandboxId);
  const selectedTopicId = useLiveMentorStore((state) => state.selectedTopicId);
  const sessionPhase = useLiveMentorStore((state) => state.sessionPhase);
  const terminalBuffer = useLiveMentorStore((state) => state.terminalBuffer);
  const topicStatusById = useLiveMentorStore((state) => state.topicStatusById);
  const transcripts = useLiveMentorStore((state) => state.transcripts);
  const typedPrompt = useLiveMentorStore((state) => state.typedPrompt);
  const setActiveFilePath = useLiveMentorStore(
    (state) => state.setActiveFilePath,
  );
  const setActiveRailTab = useLiveMentorStore((state) => state.setActiveRailTab);
  const hydrateWorkspace = useLiveMentorStore(
    (state) => state.hydrateWorkspace,
  );
  const markTopicCompleted = useLiveMentorStore(
    (state) => state.markTopicCompleted,
  );
  const publishRuntime = useLiveMentorStore((state) => state.publishRuntime);
  const resetWorkspace = useLiveMentorStore((state) => state.resetWorkspace);
  const setFileContent = useLiveMentorStore((state) => state.setFileContent);
  const setProgramInput = useLiveMentorStore((state) => state.setProgramInput);
  const setLessonSelection = useLiveMentorStore(
    (state) => state.setLessonSelection,
  );
  const setLessonView = useLiveMentorStore((state) => state.setLessonView);
  const setSession = useLiveMentorStore((state) => state.setSession);
  const setTypedPrompt = useLiveMentorStore((state) => state.setTypedPrompt);
  const appendTerminalBuffer = useLiveMentorStore(
    (state) => state.appendTerminalBuffer,
  );
  const appendTranscript = useLiveMentorStore(
    (state) => state.appendTranscript,
  );

  const workspaceQuery = useQuery({
    enabled: Boolean(session?.user),
    gcTime: 0,
    queryFn: bootstrapLessonWorkspace,
    queryKey: ["lesson-workspace", session?.user?.id],
    staleTime: 0,
  });

  const saveFileMutation = useMutation({
    mutationFn: updateMainFile,
  });

  const runCommandMutation = useMutation({
    mutationFn: runLessonCommand,
    onSuccess: (nextRuntime, variables) => {
      publishRuntime(nextRuntime);
      appendTerminalBuffer(
        `${formatTerminalExchange(variables.command, nextRuntime)}\r\n`,
      );
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetLessonWorkspace,
    onSuccess: (payload) => {
      lastSavedSourceRef.current = payload.snapshot.sourceCode;
      hydrateWorkspace(payload);
    },
  });

  const loadLessonMutation = useMutation({
    mutationFn: loadLessonWorkspace,
    onSuccess: (payload) => {
      lastSavedSourceRef.current = payload.snapshot.sourceCode;
      hydrateWorkspace(payload);
    },
  });

  useEffect(() => {
    setSession(
      session
        ? {
            session: {
              expiresAt: session.session.expiresAt.toISOString(),
              id: session.session.id,
            },
            user: {
              email: session.user.email,
              id: session.user.id,
              image: session.user.image ?? null,
              name: session.user.name,
            },
          }
        : null,
    );
  }, [session, setSession]);

  useEffect(() => {
    if (!workspaceQuery.data) {
      return;
    }

    lastSavedSourceRef.current = workspaceQuery.data.snapshot.sourceCode;
    hasAnnouncedReadinessRef.current = false;
    hydrateWorkspace(workspaceQuery.data);
  }, [hydrateWorkspace, workspaceQuery.data]);

  const sourceFile = files.find((file) => file.path === "/workspace/main.py");
  const sourceCode = sourceFile?.content ?? runtime.sourceCode;

  useEffect(() => {
    if (
      !sandboxId ||
      !sourceCode ||
      sourceCode === lastSavedSourceRef.current
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastSavedSourceRef.current = sourceCode;
      saveFileMutation.mutate({
        content: sourceCode,
        sandboxId,
      });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [sandboxId, saveFileMutation, sourceCode]);

  const activeFile =
    files.find((file) => file.path === activeFilePath) ?? files[0] ?? null;

  const executeCommand = (command: string) => {
    if (!sandboxId) {
      return;
    }

    appendTerminalBuffer(`$ ${command}\r\n`);
    runCommandMutation.mutate({
      command,
      sandboxId,
      sourceCode,
    });
  };

  const runProgram = () => {
    executeCommand(formatPythonProgramCommand(programInput));
  };

  const runTests = () => {
    executeCommand(PYTEST_COMMAND);
  };

  const resetLesson = () => {
    resetWorkspace();
    void queryClient.cancelQueries({ queryKey: ["lesson-workspace"] });
    resetMutation.mutate(loadedTopicId ?? DEFAULT_LESSON_ID);
  };

  const loadLesson = (lessonId: string) => {
    resetWorkspace();
    void queryClient.cancelQueries({ queryKey: ["lesson-workspace"] });
    loadLessonMutation.mutate(lessonId);
  };

  useEffect(() => {
    if (!sessionError) {
      return;
    }

    appendTranscript(
      "system",
      "Session lookup failed. Check the API auth setup.",
    );
  }, [appendTranscript, sessionError]);

  useEffect(() => {
    const passedTests =
      runtime.command === PYTEST_COMMAND &&
      /(^|\s)\d+\s+passed\b/u.test(runtime.stdout);

    if (!passedTests) {
      hasAnnouncedReadinessRef.current = false;
      return;
    }

    if (hasAnnouncedReadinessRef.current) {
      return;
    }

    hasAnnouncedReadinessRef.current = true;
    if (lesson?.lessonId) {
      markTopicCompleted(lesson.lessonId);
    }
    appendTranscript(
      "system",
      "Nice. You preserved the original input exactly. You’re ready.",
    );
  }, [appendTranscript, lesson?.lessonId, markTopicCompleted, runtime.command, runtime.stdout]);

  const selectedLesson =
    getLessonContextById(selectedTopicId ?? loadedTopicId ?? DEFAULT_LESSON_ID) ??
    lesson;
  const loadedLesson =
    getLessonContextById(loadedTopicId ?? lesson?.lessonId ?? DEFAULT_LESSON_ID) ??
    lesson;
  const nextLessonId = loadedLesson?.lessonId
    ? getNextLessonId(loadedLesson.lessonId)
    : null;
  const nextLesson =
    nextLessonId ? getLessonContextById(nextLessonId) : null;

  return {
    activeFile,
    activeRailTab,
    activeTaskSummary: loadedLesson?.task ?? lesson?.task ?? "",
    completedTopicIds,
    course: PYTHON_FOUNDATIONS_COURSE,
    files,
    isBootstrapping:
      isSessionPending ||
      workspaceQuery.isPending ||
      resetMutation.isPending ||
      loadLessonMutation.isPending,
    isRunningCommand: runCommandMutation.isPending,
    isLoadingLesson: loadLessonMutation.isPending,
    isSessionPending,
    lesson,
    lessonView,
    loadedLesson,
    loadedTopicId,
    nextLesson,
    programInput,
    runtime,
    selectedLesson,
    selectedTopicId,
    session,
    sessionError,
    sessionPhase,
    terminalBuffer,
    topicStatusById,
    transcripts,
    typedPrompt,
    updateActiveRailTab: setActiveRailTab,
    updateActiveFile: setActiveFilePath,
    updateLessonSelection: setLessonSelection,
    updateLessonView: setLessonView,
    updateProgramInput: setProgramInput,
    updateFileContent: (path: string, content: string) => {
      const file = files.find((candidate) => candidate.path === path);
      if (!file?.isEditable) {
        return;
      }

      setFileContent(path, content);
    },
    loadLesson,
    resetLesson,
    runProgram,
    runTests,
    setTypedPrompt,
    userEmail: session?.user.email ?? "",
  };
}
