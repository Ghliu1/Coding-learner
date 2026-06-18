// Core content model for the Coding Learner curriculum.
// Everything here is bundled with the app so it works fully offline.

export type LanguageId = 'typescript' | 'go';

/** A tag identifying a discrete skill/concept. Used for weakness tracking. */
export type ConceptId = string;

/** A rich-text content block inside a lesson. Rendered by the lesson screen. */
export type ContentBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'code'; language: LanguageId | 'text'; code: string; caption?: string }
  | { kind: 'callout'; tone: 'info' | 'tip' | 'warning' | 'pitfall'; title?: string; text: string }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | {
      kind: 'table';
      headers: string[];
      rows: string[][];
    };

/**
 * A single validation check for an exercise.
 * - `runOutput`: execute the user's code (JS/TS) and compare stdout.
 * - `runExpression`: execute and assert a boolean expression over the result.
 * - `contains` / `notContains`: literal substring checks on source.
 * - `regex` / `notRegex`: pattern checks on source.
 */
export type Check =
  | { type: 'runOutput'; expected: string; trim?: boolean; description: string }
  | { type: 'runExpression'; expression: string; description: string }
  | { type: 'contains'; value: string; description: string }
  | { type: 'notContains'; value: string; description: string }
  | { type: 'regex'; pattern: string; flags?: string; description: string }
  | { type: 'notRegex'; pattern: string; flags?: string; description: string };

export interface Hint {
  text: string;
}

export interface Exercise {
  id: string;
  title: string;
  prompt: string;
  language: LanguageId;
  /** Code pre-filled in the editor. */
  starterCode: string;
  /** A known-good solution, revealed on demand. */
  solution: string;
  /** Ordered checks; all must pass for the exercise to be complete. */
  checks: Check[];
  hints: Hint[];
  /** Concepts exercised here — drives weakness analysis. */
  concepts: ConceptId[];
  /**
   * For languages we can't execute on-device (Go), an expected output to show
   * the learner so they can self-verify behaviour.
   */
  expectedOutput?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  /** Optional code snippet shown with the question. */
  code?: { language: LanguageId | 'text'; code: string };
  options: string[];
  /** Index into `options`. */
  answerIndex: number;
  explanation: string;
  concepts: ConceptId[];
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  /** Estimated minutes to complete. */
  estimatedMinutes: number;
  concepts: ConceptId[];
  content: ContentBlock[];
  exercises: Exercise[];
  quiz: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Concept {
  id: ConceptId;
  name: string;
  /** Short description shown in the weakness report. */
  blurb: string;
}

export interface Resource {
  id: string;
  title: string;
  /** Offline explainer body shown in-app (no internet needed). */
  body: ContentBlock[];
  /** Concepts this resource helps remediate. */
  concepts: ConceptId[];
}

export interface Course {
  language: LanguageId;
  name: string;
  /** One-line tagline. */
  tagline: string;
  description: string;
  /** Color used for the language accent in the UI. */
  accent: string;
  modules: Module[];
  concepts: Concept[];
  resources: Resource[];
  /** Reference: common syntax errors and how to fix them. */
  commonErrors: SyntaxErrorGuide[];
  /** Reference: standard library / common packages. */
  libraries: LibraryGuide[];
}

export interface SyntaxErrorGuide {
  id: string;
  /** The error message or symptom as the learner sees it. */
  message: string;
  cause: string;
  fix: string;
  example: { bad: string; good: string; language: LanguageId };
  concepts: ConceptId[];
}

export interface LibraryGuide {
  id: string;
  name: string;
  /** Import path / package name. */
  importPath: string;
  description: string;
  /** Real-world usage examples. */
  examples: { title: string; code: string; explanation: string }[];
}
