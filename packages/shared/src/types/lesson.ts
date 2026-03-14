export interface ILessonContext {
  courseId: string;
  courseTitle: string;
  sectionId: string;
  sectionTitle: string;
  lessonId: string;
  lessonTitle: string;
  summary: string;
  concept: string;
  whyItMatters: string;
  objective: string;
  task: string;
  checkerExpects: string;
  commonFailure: string;
  expectedOutcome: string;
  constraints: string[];
  hints: string[];
  references: string[];
  sampleInput: string;
  focusFilePath: string;
  workspaceFiles: string[];
  commandSuggestions: string[];
}

export interface ILessonDefinition {
  lesson: ILessonContext;
  files: IWorkspaceFileRecord[];
  practiceLabel: string;
}

export interface ILiveLessonGrounding {
  courseId: string;
  courseTitle: string;
  sectionId: string;
  sectionTitle: string;
  lessonId: string;
  lessonTitle: string;
  summary: string;
  concept: string;
  whyItMatters: string;
  objective: string;
  task: string;
  checkerExpects: string;
  commonFailure: string;
  expectedOutcome: string;
  constraints: string[];
  hints: string[];
  references: string[];
}

export interface ICourseSection {
  id: string;
  title: string;
  topics: ILessonDefinition[];
}

export interface ICourseDefinition {
  id: string;
  title: string;
  sections: ICourseSection[];
}

export interface IWorkspaceFileRecord {
  path: string;
  content: string;
  isEditable: boolean;
}

export interface IRuntimeSnapshot {
  sourceCode: string;
  command: string;
  stdout: string;
  stderr: string;
}

export interface IFunctionCallResult {
  lesson?: ILessonContext;
  runtime?: IRuntimeSnapshot;
}

export interface IWorkspaceBootstrapResponse {
  sandboxId: string;
  terminalSessionId: string;
  lesson: ILessonContext;
  files: IWorkspaceFileRecord[];
  snapshot: IRuntimeSnapshot;
}
