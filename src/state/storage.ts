// Thin persistence layer over AsyncStorage. Stores progress and per-exercise
// saved code so the learner's work survives app restarts — all on-device.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyProgress, ProgressState } from './progress';

const PROGRESS_KEY = '@coding-learner/progress/v1';
const CODE_PREFIX = '@coding-learner/code/v1/';

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { ...emptyProgress(), ...parsed };
  } catch {
    return emptyProgress();
  }
}

export async function saveProgress(state: ProgressState): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal: progress is best-effort persisted.
  }
}

export async function loadCode(exerciseId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CODE_PREFIX + exerciseId);
  } catch {
    return null;
  }
}

export async function saveCode(exerciseId: string, code: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CODE_PREFIX + exerciseId, code);
  } catch {
    // ignore
  }
}

export async function resetAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith('@coding-learner/'));
    await AsyncStorage.multiRemove(ours);
  } catch {
    // ignore
  }
}
