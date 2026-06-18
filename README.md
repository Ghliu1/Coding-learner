# Coding Learner

An **offline-first mobile app** for learning to code. It bundles an IDE-like
editor, a full curriculum (lessons, exercises, mini-tests), a reference of
common syntax errors and standard libraries, and progress tracking that spots
your weak areas and recommends targeted material — all working **without an
internet connection**. Ships with **TypeScript** and **Go** courses.

Built with **Expo / React Native** so it runs on iOS and Android (and the web).

## Features

- **IDE-like editor** — syntax highlighting, a line-number gutter, and a
  caret that lines up with the highlighted text (`src/components/CodeEditor.tsx`).
- **Runnable exercises** — TypeScript is transpiled (via a bundled, offline
  `sucrase`) and executed *on-device* with captured console output, then graded
  against real checks (output comparison, expression assertions, source
  patterns). Async/await exercises are graded after async output settles.
- **Lessons** — rich content blocks (prose, code, callouts, tables, lists)
  teaching the language, syntax, pitfalls, and real-world usage.
- **Mini-tests / quizzes** — per-lesson and mixed quizzes with explanations.
- **Weakness tracking** — every exercise/quiz attempt updates per-concept
  mastery; the app surfaces your weakest concepts and recommends remediation
  **resources** for them (`src/state/progress.ts`).
- **Reference** — common compiler/runtime errors (cause + fix + good/bad
  examples) and standard-library guides with real-world snippets.
- **Playground** — a free scratchpad to run TypeScript live.
- **100% offline & on-device** — all content is bundled; progress is saved
  with AsyncStorage. No accounts, no network.

> Go can't be executed on a phone, so Go exercises are graded with static
> (source-pattern) checks and show an **expected output** for self-verification.
> TypeScript exercises run for real.

## Project layout

```
App.tsx                     App root (providers + navigation)
index.ts                    Expo entry point
src/
  components/               CodeEditor, syntax highlighter, content renderer, UI kit
  content/
    types.ts               The curriculum data model
    typescript/            TypeScript course (4 modules) + reference
    go/                    Go course (4 modules) + reference
    index.ts               Course registry & lookups
  engine/
    transpile.ts           TS -> JS (sucrase, with a built-in fallback stripper)
    runner.ts              Sandboxed execution + check evaluation
  state/
    progress.ts            Pure progress + weakness-analysis logic
    storage.ts             AsyncStorage persistence
    ProgressContext.tsx    React context wiring it together
  navigation/              Stack navigator + route types
  screens/                 Home, Course, Lesson, Exercise, Quiz, Playground,
                           Reference, Resource, Progress
  theme/                   Dark theme + syntax palette
```

## Running it

```bash
npm install
npm start          # then press a/i, or scan the QR with Expo Go
# npm run android  / npm run ios / npm run web
```

## Tests

The pure logic is fully unit-tested in Node (no device needed):

```bash
npm test           # engine, progress analysis, and content integrity
npm run typecheck  # tsc --noEmit across the whole app
```

The **content-integrity** suite is the safety net for the curriculum: it runs
every TypeScript exercise's reference solution and asserts it passes all of that
exercise's checks, verifies every referenced concept exists, that ids are
unique, quiz answers are in range, and that every Go exercise ships an expected
output.

## Adding content

Courses are plain typed data under `src/content/<language>/`. Add a `Lesson`
(with `content`, `exercises`, `quiz`) to a `Module`, tag everything with
`concepts`, and the home screen, progress tracking, and weakness analysis pick
it up automatically. Keep each new exercise's `solution` passing its `checks` —
`npm test` will tell you if it doesn't.
