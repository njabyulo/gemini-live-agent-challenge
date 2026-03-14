import type {
  ICourseDefinition,
  ILessonContext,
  ILessonDefinition,
  IWorkspaceFileRecord,
} from "../types/index.js";

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

export const DEFAULT_WORKSPACE_FILE_PATH = "/workspace/main.py";

export const DEFAULT_TERMINAL_SESSION_ID = "lesson-shell";

export const DEFAULT_WORKSPACE_ROOT = "/workspace";

const DEFAULT_REFERENCE_FILES = [
  "/workspace/main.py",
  "/workspace/README.md",
  "/workspace/test_main.py",
];

const createLessonDefinition = ({
  sectionId,
  sectionTitle,
  lessonId,
  lessonTitle,
  summary,
  objective,
  task,
  expectedOutcome,
  constraints,
  hints,
  references,
  sampleInput,
  practiceLabel,
  mainPy,
  readmeMd,
  testMainPy,
}: {
  sectionId: string;
  sectionTitle: string;
  lessonId: string;
  lessonTitle: string;
  summary: string;
  objective: string;
  task: string;
  expectedOutcome: string;
  constraints: string[];
  hints: string[];
  references: string[];
  sampleInput: string;
  practiceLabel: string;
  mainPy: string;
  readmeMd: string;
  testMainPy: string;
}): ILessonDefinition => {
  const lesson: ILessonContext = {
    courseId: DEFAULT_COURSE_ID,
    courseTitle: "Python Foundations",
    sectionId,
    sectionTitle,
    lessonId,
    lessonTitle,
    summary,
    objective,
    task,
    expectedOutcome,
    constraints,
    hints,
    references,
    sampleInput,
    focusFilePath: "/workspace/main.py",
    workspaceFiles: DEFAULT_REFERENCE_FILES,
    commandSuggestions: [
      `python3 main.py "${sampleInput}"`,
      "python3 -m pytest -q",
    ],
  };

  const files: IWorkspaceFileRecord[] = [
    {
      path: "/workspace/main.py",
      isEditable: true,
      content: mainPy,
    },
    {
      path: "/workspace/README.md",
      isEditable: false,
      content: readmeMd,
    },
    {
      path: "/workspace/test_main.py",
      isEditable: false,
      content: testMainPy,
    },
  ];

  return {
    lesson,
    files,
    practiceLabel,
  };
};

export const PYTHON_FOUNDATIONS_COURSE: ICourseDefinition = {
  id: DEFAULT_COURSE_ID,
  title: "Python Foundations",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      topics: [
        createLessonDefinition({
          sectionId: "introduction",
          sectionTitle: "Introduction",
          lessonId: "code-snippets",
          lessonTitle: "Code Snippets",
          summary: "Use a simple print statement to combine text with learner input.",
          objective: 'Read one CLI argument and print "Hello, <name>" exactly once.',
          task: 'Fix main.py so python3 main.py "Ada Lovelace" prints Hello, Ada Lovelace.',
          expectedOutcome:
            "The learner can inspect a short Python snippet and fix string output without losing the learner input.",
          constraints: [
            'Keep the output format as "Hello, <name>".',
            "Preserve the learner input exactly as typed.",
          ],
          hints: [
            "Check the spacing in the final print statement.",
            "Use the learner input directly instead of hard-coding the name.",
          ],
          references: [
            "print() outputs text exactly as you compose it.",
            "String concatenation needs explicit spaces if you want them in the output.",
          ],
          sampleInput: "Ada Lovelace",
          practiceLabel: "Practice",
          mainPy: `import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("Please provide input")
        return

    learner_name = sys.argv[1]
    print("Hello," + learner_name)


if __name__ == "__main__":
    main()
`,
          readmeMd: `# Lesson: Code Snippets

Objective:
- Read the first CLI argument.
- Print "Hello, <name>" with the correct spacing.

Try:
- python3 main.py "Ada Lovelace"
- python3 -m pytest -q
`,
          testMainPy: `from subprocess import run


def test_greets_the_learner_with_spacing():
    completed = run(
        ["python3", "main.py", "Ada Lovelace"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.stdout.strip() == "Hello, Ada Lovelace"
`,
        }),
        createLessonDefinition({
          sectionId: "introduction",
          sectionTitle: "Introduction",
          lessonId: "variables",
          lessonTitle: "Variables",
          summary: "Store the learner input in a variable before printing it back out.",
          objective: "Use a variable to hold the CLI argument and print it exactly.",
          task: 'Fix main.py so python3 main.py "Grace Hopper" prints Grace Hopper exactly.',
          expectedOutcome:
            "The learner understands how variables store values and why a literal string is different from user input.",
          constraints: [
            "Use the CLI argument, not a hard-coded string.",
            "Print the variable value exactly as supplied.",
          ],
          hints: [
            "The variable should store sys.argv[1], not the word name.",
            "Printing a string literal is not the same as printing the learner input.",
          ],
          references: [
            "Variables store values you can reuse later in the program.",
            "sys.argv[1] is the first value supplied by the learner.",
          ],
          sampleInput: "Grace Hopper",
          practiceLabel: "Practice",
          mainPy: `import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("Please provide input")
        return

    learner_name = "name"
    print(learner_name)


if __name__ == "__main__":
    main()
`,
          readmeMd: `# Lesson: Variables

Objective:
- Read the first CLI argument.
- Store it in a variable.
- Print the variable value.
`,
          testMainPy: `from subprocess import run


def test_uses_the_cli_argument_variable():
    completed = run(
        ["python3", "main.py", "Grace Hopper"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.stdout.strip() == "Grace Hopper"
`,
        }),
        createLessonDefinition({
          sectionId: "introduction",
          sectionTitle: "Introduction",
          lessonId: "operators",
          lessonTitle: "Operators",
          summary: "Use the correct arithmetic operator to transform numeric input.",
          objective: "Read a number, double it, and print the result.",
          task: 'Fix main.py so python3 main.py "6" prints 12.',
          expectedOutcome:
            "The learner understands the difference between addition and multiplication when working with numeric input.",
          constraints: [
            "Convert the CLI input to an integer before operating on it.",
            "Print the doubled value as a number.",
          ],
          hints: [
            "The lesson expects doubling, not adding two.",
            "Check the operator in the final print statement.",
          ],
          references: [
            "int() converts numeric text into an integer.",
            "Multiplication uses *, addition uses +.",
          ],
          sampleInput: "6",
          practiceLabel: "Practice",
          mainPy: `import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("Please provide input")
        return

    value = int(sys.argv[1])
    print(value + 2)


if __name__ == "__main__":
    main()
`,
          readmeMd: `# Lesson: Operators

Objective:
- Read one numeric argument.
- Double it and print the result.
`,
          testMainPy: `from subprocess import run


def test_doubles_the_number():
    completed = run(
        ["python3", "main.py", "6"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.stdout.strip() == "12"
`,
        }),
        createLessonDefinition({
          sectionId: "introduction",
          sectionTitle: "Introduction",
          lessonId: "rules-of-precedence",
          lessonTitle: "Rules of Precedence",
          summary: "Use parentheses to force the intended order of operations.",
          objective: "Calculate (value + 2) * 3 and print the result.",
          task: 'Fix main.py so python3 main.py "4" prints 18.',
          expectedOutcome:
            "The learner understands that multiplication happens before addition unless parentheses change the order.",
          constraints: [
            "Use the learner input as an integer.",
            "Make the addition happen before the multiplication.",
          ],
          hints: [
            "Without parentheses, Python multiplies before it adds.",
            "Wrap the addition to force the right order.",
          ],
          references: [
            "Operator precedence decides which part of an expression runs first.",
            "Parentheses override the default precedence rules.",
          ],
          sampleInput: "4",
          practiceLabel: "Practice",
          mainPy: `import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("Please provide input")
        return

    value = int(sys.argv[1])
    print(value + 2 * 3)


if __name__ == "__main__":
    main()
`,
          readmeMd: `# Lesson: Rules of Precedence

Objective:
- Read one numeric argument.
- Evaluate (value + 2) * 3.
`,
          testMainPy: `from subprocess import run


def test_uses_parentheses_to_change_order():
    completed = run(
        ["python3", "main.py", "4"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.stdout.strip() == "18"
`,
        }),
        createLessonDefinition({
          sectionId: "introduction",
          sectionTitle: "Introduction",
          lessonId: "input-and-output",
          lessonTitle: "Input and Output",
          summary: "Echo learner input exactly as provided on the command line.",
          objective:
            "Read one CLI argument and print it back exactly as the learner typed it.",
          task:
            'Fix main.py so python3 main.py "Ada Lovelace" prints Ada Lovelace exactly, without changing the casing or dropping spaces.',
          expectedOutcome:
            "The learner understands sys.argv, off-by-one argument access, and why not to transform input that should be echoed as-is.",
          constraints: [
            "Preserve spaces and casing exactly.",
            "Do not transform the learner input before printing it.",
          ],
          hints: [
            "Check how the last print path handles the learner input.",
            "The output should preserve the original value exactly, including spaces and casing.",
          ],
          references: [
            "Python strings keep their original casing and spacing unless you transform them.",
            "sys.argv[1] reads the first user-supplied CLI argument.",
          ],
          sampleInput: "Ada Lovelace",
          practiceLabel: "Practice",
          mainPy: `import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("Please provide input")
        return

    # Bug: the lesson expects the original input, not uppercase text.
    print(sys.argv[1].upper())


if __name__ == "__main__":
    main()
`,
          readmeMd: `# Lesson: Input and Output

Objective:
- Read the first user-provided CLI argument.
- Print it exactly as typed.

Try:
- python3 main.py "Ada Lovelace"
- python3 -m pytest -q
`,
          testMainPy: `from subprocess import run


def test_echoes_argument_exactly():
    completed = run(
        ["python3", "main.py", "Ada Lovelace"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.stdout.strip() == "Ada Lovelace"
`,
        }),
      ],
    },
    {
      id: "conditionals",
      title: "Conditionals",
      topics: [
        createLessonDefinition({
          sectionId: "conditionals",
          sectionTitle: "Conditionals",
          lessonId: "logical-expressions",
          lessonTitle: "Logical Expressions",
          summary: "Compare numeric input using >= and print the correct branch.",
          objective: 'Print "adult" when the age is 18 or more, otherwise print "minor".',
          task: 'Fix main.py so python3 main.py "18" prints adult.',
          expectedOutcome:
            "The learner understands how boundary values affect logical expressions.",
          constraints: [
            "Treat 18 as adult.",
            "Print only adult or minor.",
          ],
          hints: [
            "This is a boundary-value bug, not a parsing bug.",
            "The comparison should include 18 itself.",
          ],
          references: [
            ">= means greater than or equal to.",
            "Boundary inputs are often where logical bugs appear.",
          ],
          sampleInput: "18",
          practiceLabel: "Practice",
          mainPy: `import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("Please provide input")
        return

    age = int(sys.argv[1])
    if age > 18:
        print("adult")
    else:
        print("minor")


if __name__ == "__main__":
    main()
`,
          readmeMd: `# Lesson: Logical Expressions

Objective:
- Read one age value.
- Print adult for ages 18 and above.
- Print minor otherwise.
`,
          testMainPy: `from subprocess import run


def test_includes_the_boundary_value():
    completed = run(
        ["python3", "main.py", "18"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.stdout.strip() == "adult"
`,
        }),
        createLessonDefinition({
          sectionId: "conditionals",
          sectionTitle: "Conditionals",
          lessonId: "logical-operations",
          lessonTitle: "Logical Operations",
          summary: "Use the correct boolean operator to combine conditions.",
          objective: 'Print "weekend" for 6 or 7, otherwise print "weekday".',
          task: 'Fix main.py so python3 main.py "7" prints weekend.',
          expectedOutcome:
            "The learner understands the difference between or and and in boolean logic.",
          constraints: [
            "Treat 6 and 7 as weekend days.",
            "Print only weekend or weekday.",
          ],
          hints: [
            "A day number cannot be both 6 and 7 at the same time.",
            "Use the operator that matches either condition.",
          ],
          references: [
            "or succeeds when either side is true.",
            "and succeeds only when both sides are true.",
          ],
          sampleInput: "7",
          practiceLabel: "Practice",
          mainPy: `import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("Please provide input")
        return

    day_number = int(sys.argv[1])
    if day_number == 6 and day_number == 7:
        print("weekend")
    else:
        print("weekday")


if __name__ == "__main__":
    main()
`,
          readmeMd: `# Lesson: Logical Operations

Objective:
- Read one day number.
- Print weekend for 6 or 7.
- Print weekday otherwise.
`,
          testMainPy: `from subprocess import run


def test_uses_or_for_weekend_days():
    completed = run(
        ["python3", "main.py", "7"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.stdout.strip() == "weekend"
`,
        }),
        createLessonDefinition({
          sectionId: "conditionals",
          sectionTitle: "Conditionals",
          lessonId: "conditional-statements",
          lessonTitle: "Conditional Statements",
          summary: "Order chained conditions from most specific to most general.",
          objective:
            'Print "Distinction" for scores >= 80, "Pass" for scores >= 50, otherwise "Retry".',
          task: 'Fix main.py so python3 main.py "83" prints Distinction.',
          expectedOutcome:
            "The learner understands how if/elif order affects which branch runs.",
          constraints: [
            "Check the highest threshold first.",
            "Print only Distinction, Pass, or Retry.",
          ],
          hints: [
            "The first matching branch wins.",
            "If a broader condition appears first, the stricter one never runs.",
          ],
          references: [
            "if/elif chains stop at the first true condition.",
            "Order the checks from narrowest or highest threshold to broadest.",
          ],
          sampleInput: "83",
          practiceLabel: "Practice",
          mainPy: `import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("Please provide input")
        return

    score = int(sys.argv[1])
    if score >= 50:
        print("Pass")
    elif score >= 80:
        print("Distinction")
    else:
        print("Retry")


if __name__ == "__main__":
    main()
`,
          readmeMd: `# Lesson: Conditional Statements

Objective:
- Read one score.
- Print Distinction, Pass, or Retry based on the thresholds.
`,
          testMainPy: `from subprocess import run


def test_checks_the_highest_threshold_first():
    completed = run(
        ["python3", "main.py", "83"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.stdout.strip() == "Distinction"
`,
        }),
      ],
    },
  ],
};

export const COURSE_TOPIC_ORDER = PYTHON_FOUNDATIONS_COURSE.sections.flatMap(
  (section) => section.topics.map((topic) => topic.lesson.lessonId),
);

export const DEFAULT_LESSON_ID = COURSE_TOPIC_ORDER[0] ?? "code-snippets";

export const getLessonDefinitionById = (lessonId: string) =>
  PYTHON_FOUNDATIONS_COURSE.sections
    .flatMap((section) => section.topics)
    .find((topic) => topic.lesson.lessonId === lessonId);

export const getNextLessonId = (lessonId: string) => {
  const currentIndex = COURSE_TOPIC_ORDER.indexOf(lessonId);
  if (currentIndex < 0) {
    return null;
  }

  return COURSE_TOPIC_ORDER[currentIndex + 1] ?? null;
};

export const getLessonContextById = (lessonId: string) =>
  getLessonDefinitionById(lessonId)?.lesson ?? null;
