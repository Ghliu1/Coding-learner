// Progress + weakness analysis. Pure functions so they can be unit-tested and
// reused by the UI. Persistence lives in storage.ts; this module only computes.

import { ConceptId, Course } from '../content/types';

export interface ConceptStat {
  /** Number of correct attempts attributed to this concept. */
  correct: number;
  /** Total attempts attributed to this concept. */
  total: number;
}

export interface ProgressState {
  /** Lesson ids the learner has opened/read. */
  lessonsViewed: Record<string, boolean>;
  /** Exercise ids the learner has completed (all checks passed). */
  exercisesCompleted: Record<string, boolean>;
  /** Quiz question ids answered correctly at least once. */
  quizCorrect: Record<string, boolean>;
  /** Per-concept rolling stats across exercises + quizzes. */
  concepts: Record<ConceptId, ConceptStat>;
  /** Streak tracking. */
  lastActiveDate: string | null;
  streak: number;
  /** Total XP-ish points for motivation. */
  points: number;
}

export const emptyProgress = (): ProgressState => ({
  lessonsViewed: {},
  exercisesCompleted: {},
  quizCorrect: {},
  concepts: {},
  lastActiveDate: null,
  streak: 0,
  points: 0,
});

function bumpConcept(state: ProgressState, concept: ConceptId, correct: boolean): void {
  const cur = state.concepts[concept] ?? { correct: 0, total: 0 };
  state.concepts[concept] = {
    correct: cur.correct + (correct ? 1 : 0),
    total: cur.total + 1,
  };
}

/** Record an exercise attempt. Returns a new state (immutably). */
export function recordExercise(
  prev: ProgressState,
  exerciseId: string,
  concepts: ConceptId[],
  passed: boolean,
): ProgressState {
  const state: ProgressState = clone(prev);
  for (const c of concepts) bumpConcept(state, c, passed);
  if (passed && !state.exercisesCompleted[exerciseId]) {
    state.exercisesCompleted[exerciseId] = true;
    state.points += 25;
  }
  return touchStreak(state);
}

/** Record a quiz answer. */
export function recordQuiz(
  prev: ProgressState,
  questionId: string,
  concepts: ConceptId[],
  correct: boolean,
): ProgressState {
  const state: ProgressState = clone(prev);
  for (const c of concepts) bumpConcept(state, c, correct);
  if (correct && !state.quizCorrect[questionId]) {
    state.quizCorrect[questionId] = true;
    state.points += 10;
  }
  return touchStreak(state);
}

export function recordLessonView(prev: ProgressState, lessonId: string): ProgressState {
  if (prev.lessonsViewed[lessonId]) return prev;
  const state = clone(prev);
  state.lessonsViewed[lessonId] = true;
  state.points += 5;
  return touchStreak(state);
}

function touchStreak(state: ProgressState): ProgressState {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastActiveDate === today) return state;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  state.streak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
  state.lastActiveDate = today;
  return state;
}

export interface Weakness {
  concept: ConceptId;
  name: string;
  blurb: string;
  /** 0..1 success rate. */
  mastery: number;
  total: number;
}

/**
 * Identify weak concepts: those attempted at least `minAttempts` times with a
 * success rate below `threshold`, sorted weakest-first. Concepts that have been
 * seen but never practiced enough are surfaced as "needs practice" separately.
 */
export function analyzeWeaknesses(
  state: ProgressState,
  course: Course,
  opts: { threshold?: number; minAttempts?: number } = {},
): Weakness[] {
  const threshold = opts.threshold ?? 0.7;
  const minAttempts = opts.minAttempts ?? 2;
  const out: Weakness[] = [];
  for (const concept of course.concepts) {
    const stat = state.concepts[concept.id];
    if (!stat || stat.total < minAttempts) continue;
    const mastery = stat.correct / stat.total;
    if (mastery < threshold) {
      out.push({
        concept: concept.id,
        name: concept.name,
        blurb: concept.blurb,
        mastery,
        total: stat.total,
      });
    }
  }
  return out.sort((a, b) => a.mastery - b.mastery);
}

/** Concepts in the course that the learner hasn't practiced yet at all. */
export function unpracticedConcepts(state: ProgressState, course: Course): ConceptId[] {
  return course.concepts
    .filter((c) => !state.concepts[c.id] || state.concepts[c.id].total === 0)
    .map((c) => c.id);
}

/** Recommend resources that target the learner's weakest concepts. */
export function recommendResources(
  state: ProgressState,
  course: Course,
): { resourceId: string; title: string; reason: string }[] {
  const weaknesses = analyzeWeaknesses(state, course);
  const weakSet = new Set(weaknesses.map((w) => w.concept));
  const recs: { resourceId: string; title: string; reason: string }[] = [];
  for (const res of course.resources) {
    const hit = res.concepts.find((c) => weakSet.has(c));
    if (hit) {
      const w = weaknesses.find((x) => x.concept === hit)!;
      recs.push({
        resourceId: res.id,
        title: res.title,
        reason: `Reinforces "${w.name}" (you're at ${Math.round(w.mastery * 100)}%)`,
      });
    }
  }
  return recs;
}

export interface CourseProgressSummary {
  lessonsTotal: number;
  lessonsViewed: number;
  exercisesTotal: number;
  exercisesDone: number;
  quizTotal: number;
  quizDone: number;
  percent: number;
}

export function summarizeCourse(state: ProgressState, course: Course): CourseProgressSummary {
  let lessonsTotal = 0;
  let exercisesTotal = 0;
  let quizTotal = 0;
  let lessonsViewed = 0;
  let exercisesDone = 0;
  let quizDone = 0;
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      lessonsTotal++;
      if (state.lessonsViewed[lesson.id]) lessonsViewed++;
      for (const ex of lesson.exercises) {
        exercisesTotal++;
        if (state.exercisesCompleted[ex.id]) exercisesDone++;
      }
      for (const q of lesson.quiz) {
        quizTotal++;
        if (state.quizCorrect[q.id]) quizDone++;
      }
    }
  }
  const totalItems = lessonsTotal + exercisesTotal + quizTotal;
  const doneItems = lessonsViewed + exercisesDone + quizDone;
  return {
    lessonsTotal,
    lessonsViewed,
    exercisesTotal,
    exercisesDone,
    quizTotal,
    quizDone,
    percent: totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100),
  };
}

function clone(s: ProgressState): ProgressState {
  return {
    lessonsViewed: { ...s.lessonsViewed },
    exercisesCompleted: { ...s.exercisesCompleted },
    quizCorrect: { ...s.quizCorrect },
    concepts: Object.fromEntries(Object.entries(s.concepts).map(([k, v]) => [k, { ...v }])),
    lastActiveDate: s.lastActiveDate,
    streak: s.streak,
    points: s.points,
  };
}
