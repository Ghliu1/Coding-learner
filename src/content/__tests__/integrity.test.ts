import { courses } from '../index';
import { evaluateExerciseAsync } from '../../engine/runner';
import { Course } from '../types';

describe('content integrity', () => {
  it('has both TypeScript and Go courses', () => {
    expect(courses.map((c) => c.language).sort()).toEqual(['go', 'typescript']);
  });

  for (const course of courses) {
    describe(`${course.name} course`, () => {
      const conceptIds = new Set(course.concepts.map((c) => c.id));

      it('declares all referenced concepts', () => {
        const missing: string[] = [];
        const check = (ids: string[], where: string) => {
          for (const id of ids) if (!conceptIds.has(id)) missing.push(`${where}: ${id}`);
        };
        for (const mod of course.modules) {
          for (const lesson of mod.lessons) {
            check(lesson.concepts, `lesson ${lesson.id}`);
            for (const ex of lesson.exercises) check(ex.concepts, `exercise ${ex.id}`);
            for (const q of lesson.quiz) check(q.concepts, `quiz ${q.id}`);
          }
        }
        for (const r of course.resources) check(r.concepts, `resource ${r.id}`);
        for (const e of course.commonErrors) check(e.concepts, `error ${e.id}`);
        expect(missing).toEqual([]);
      });

      it('has unique ids', () => {
        const ids: string[] = [];
        for (const mod of course.modules) {
          ids.push(mod.id);
          for (const lesson of mod.lessons) {
            ids.push(lesson.id);
            for (const ex of lesson.exercises) ids.push(ex.id);
            for (const q of lesson.quiz) ids.push(q.id);
          }
        }
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        expect(dupes).toEqual([]);
      });

      it('has valid quiz answer indices and explanations', () => {
        for (const mod of course.modules) {
          for (const lesson of mod.lessons) {
            for (const q of lesson.quiz) {
              expect(q.answerIndex).toBeGreaterThanOrEqual(0);
              expect(q.answerIndex).toBeLessThan(q.options.length);
              expect(q.options.length).toBeGreaterThanOrEqual(2);
              expect(q.explanation.length).toBeGreaterThan(0);
            }
          }
        }
      });

      it('every exercise has checks, hints, a solution, and starter code', () => {
        for (const mod of course.modules) {
          for (const lesson of mod.lessons) {
            for (const ex of lesson.exercises) {
              expect(ex.checks.length).toBeGreaterThan(0);
              expect(ex.solution.length).toBeGreaterThan(0);
              expect(ex.starterCode.length).toBeGreaterThan(0);
              expect(ex.hints.length).toBeGreaterThan(0);
              // Go can't run on-device, so it must provide an expected output.
              if (ex.language === 'go') {
                expect(ex.expectedOutput && ex.expectedOutput.length).toBeTruthy();
              }
            }
          }
        }
      });
    });
  }

  // The strongest guarantee: the reference solution for every runnable
  // (TypeScript) exercise must pass all of its own checks.
  const tsCourse = courses.find((c) => c.language === 'typescript') as Course;
  for (const mod of tsCourse.modules) {
    for (const lesson of mod.lessons) {
      for (const ex of lesson.exercises) {
        it(`solution passes checks: ${ex.id} (${ex.title})`, async () => {
          const evalResult = await evaluateExerciseAsync(ex, ex.solution);
          const failed = evalResult.checks.filter((c) => !c.passed);
          if (failed.length > 0) {
            throw new Error(
              `Failed checks for ${ex.id}:\n` +
                failed.map((f) => `  - ${f.description}${f.detail ? `\n    ${f.detail}` : ''}`).join('\n'),
            );
          }
          expect(evalResult.allPassed).toBe(true);
        });
      }
    }
  }
});
