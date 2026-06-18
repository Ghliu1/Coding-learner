import {
  analyzeWeaknesses,
  emptyProgress,
  recommendResources,
  recordExercise,
  recordQuiz,
  summarizeCourse,
} from '../progress';
import { Course } from '../../content/types';

const course: Course = {
  language: 'typescript',
  name: 'Test',
  tagline: '',
  description: '',
  accent: '#000',
  concepts: [
    { id: 'a', name: 'Concept A', blurb: 'a' },
    { id: 'b', name: 'Concept B', blurb: 'b' },
  ],
  resources: [{ id: 'r1', title: 'Fix A', body: [], concepts: ['a'] }],
  commonErrors: [],
  libraries: [],
  modules: [
    {
      id: 'm', title: '', description: '',
      lessons: [
        {
          id: 'l1', title: '', summary: '', estimatedMinutes: 1, concepts: ['a'], content: [],
          exercises: [
            { id: 'e1', title: '', prompt: '', language: 'typescript', starterCode: 'x', solution: 'x', checks: [], hints: [{ text: 'h' }], concepts: ['a'] },
          ],
          quiz: [
            { id: 'q1', prompt: '', options: ['x', 'y'], answerIndex: 0, explanation: 'e', concepts: ['a'] },
          ],
        },
      ],
    },
  ],
};

describe('progress recording', () => {
  it('records a completed exercise once and awards points', () => {
    let p = emptyProgress();
    p = recordExercise(p, 'e1', ['a'], true);
    p = recordExercise(p, 'e1', ['a'], true);
    expect(p.exercisesCompleted['e1']).toBe(true);
    expect(p.points).toBe(25); // only awarded once
    expect(p.concepts['a'].total).toBe(2);
    expect(p.concepts['a'].correct).toBe(2);
  });

  it('tracks failed attempts in concept stats', () => {
    let p = emptyProgress();
    p = recordExercise(p, 'e1', ['a'], false);
    expect(p.concepts['a']).toEqual({ correct: 0, total: 1 });
    expect(p.exercisesCompleted['e1']).toBeUndefined();
  });

  it('immutably returns new state', () => {
    const p = emptyProgress();
    const p2 = recordQuiz(p, 'q1', ['a'], true);
    expect(p2).not.toBe(p);
    expect(p.concepts['a']).toBeUndefined();
  });
});

describe('weakness analysis', () => {
  it('flags concepts below threshold with enough attempts', () => {
    let p = emptyProgress();
    p = recordQuiz(p, 'q1', ['a'], false);
    p = recordQuiz(p, 'q1', ['a'], false);
    p = recordQuiz(p, 'q1', ['a'], true);
    const weak = analyzeWeaknesses(p, course);
    expect(weak).toHaveLength(1);
    expect(weak[0].concept).toBe('a');
    expect(weak[0].mastery).toBeCloseTo(1 / 3);
  });

  it('ignores concepts with too few attempts', () => {
    let p = emptyProgress();
    p = recordQuiz(p, 'q1', ['a'], false);
    expect(analyzeWeaknesses(p, course)).toHaveLength(0);
  });

  it('recommends resources targeting weak concepts', () => {
    let p = emptyProgress();
    p = recordExercise(p, 'e1', ['a'], false);
    p = recordExercise(p, 'e1', ['a'], false);
    const recs = recommendResources(p, course);
    expect(recs).toHaveLength(1);
    expect(recs[0].resourceId).toBe('r1');
  });
});

describe('summary', () => {
  it('counts totals and computes percent', () => {
    let p = emptyProgress();
    const before = summarizeCourse(p, course);
    expect(before.percent).toBe(0);
    expect(before.exercisesTotal).toBe(1);
    p = recordExercise(p, 'e1', ['a'], true);
    p = recordQuiz(p, 'q1', ['a'], true);
    p.lessonsViewed['l1'] = true;
    const after = summarizeCourse(p, course);
    expect(after.percent).toBe(100);
  });
});
