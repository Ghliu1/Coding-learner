// Registry of all bundled courses. Everything here ships inside the app.

import { Course, Exercise, Lesson, LanguageId, QuizQuestion } from './types';
import { typescriptCourse } from './typescript';
import { goCourse } from './go';

export const courses: Course[] = [typescriptCourse, goCourse];

export function getCourse(language: LanguageId): Course {
  const c = courses.find((x) => x.language === language);
  if (!c) throw new Error(`No course for ${language}`);
  return c;
}

export function findLesson(language: LanguageId, lessonId: string): Lesson | undefined {
  for (const mod of getCourse(language).modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function allExercises(language: LanguageId): Exercise[] {
  const out: Exercise[] = [];
  for (const mod of getCourse(language).modules) {
    for (const lesson of mod.lessons) out.push(...lesson.exercises);
  }
  return out;
}

export function findExercise(exerciseId: string): { exercise: Exercise; lessonId: string; language: LanguageId } | undefined {
  for (const course of courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        const ex = lesson.exercises.find((e) => e.id === exerciseId);
        if (ex) return { exercise: ex, lessonId: lesson.id, language: course.language };
      }
    }
  }
  return undefined;
}

export function allQuiz(language: LanguageId): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  for (const mod of getCourse(language).modules) {
    for (const lesson of mod.lessons) out.push(...lesson.quiz);
  }
  return out;
}
