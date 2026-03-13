export const TUTOR_SESSION_PHASES = [
  "connecting",
  "ready",
  "listening",
  "thinking",
  "speaking",
  "error",
] as const;

export const DEFAULT_LIVE_MODEL =
  "gemini-2.5-flash-native-audio-preview-12-2025";

export const INPUT_AUDIO_MIME_TYPE = "audio/pcm;rate=16000";

export const OUTPUT_AUDIO_MIME_TYPE = "audio/pcm;rate=24000";

export const DEFAULT_COURSE_ID = "python-foundations";

export const DEFAULT_LESSON_ID = "echo-input";

export const DEFAULT_WORKSPACE_FILE_PATH = "/workspace/main.py";

export const DEFAULT_TERMINAL_SESSION_ID = "lesson-shell";

export const DEFAULT_WORKSPACE_ROOT = "/workspace";
