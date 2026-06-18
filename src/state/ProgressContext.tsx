// React context that holds progress state, persists it, and exposes recording
// actions to the rest of the app.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ConceptId } from '../content/types';
import {
  emptyProgress,
  ProgressState,
  recordExercise,
  recordLessonView,
  recordQuiz,
} from './progress';
import { loadProgress, resetAll, saveProgress } from './storage';

interface ProgressContextValue {
  progress: ProgressState;
  ready: boolean;
  onLessonViewed: (lessonId: string) => void;
  onExerciseAttempt: (exerciseId: string, concepts: ConceptId[], passed: boolean) => void;
  onQuizAnswer: (questionId: string, concepts: ConceptId[], correct: boolean) => void;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressState>(emptyProgress());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadProgress().then((p) => {
      if (active) {
        setProgress(p);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist whenever progress changes (after initial load).
  useEffect(() => {
    if (ready) saveProgress(progress);
  }, [progress, ready]);

  const onLessonViewed = useCallback((lessonId: string) => {
    setProgress((p) => recordLessonView(p, lessonId));
  }, []);

  const onExerciseAttempt = useCallback(
    (exerciseId: string, concepts: ConceptId[], passed: boolean) => {
      setProgress((p) => recordExercise(p, exerciseId, concepts, passed));
    },
    [],
  );

  const onQuizAnswer = useCallback(
    (questionId: string, concepts: ConceptId[], correct: boolean) => {
      setProgress((p) => recordQuiz(p, questionId, concepts, correct));
    },
    [],
  );

  const reset = useCallback(() => {
    resetAll().then(() => setProgress(emptyProgress()));
  }, []);

  const value = useMemo(
    () => ({ progress, ready, onLessonViewed, onExerciseAttempt, onQuizAnswer, reset }),
    [progress, ready, onLessonViewed, onExerciseAttempt, onQuizAnswer, reset],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
