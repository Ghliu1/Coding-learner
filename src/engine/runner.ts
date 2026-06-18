// Executes learner code in a sandbox and evaluates exercise checks.
// Works offline: TS is transpiled in-process, then run via the Function
// constructor with a captured `console`. Go can't run on-device, so Go
// exercises rely on static (source pattern) checks plus a shown expected output.

import { Check, Exercise } from '../content/types';
import { transpileTs } from './transpile';

export interface RunResult {
  /** Combined stdout from console.log/info/warn/error and thrown errors. */
  output: string;
  /** The value of the last expression / explicit `__result`, if any. */
  returnValue: unknown;
  error: string | null;
  /** Whether execution actually happened (false for non-runnable languages). */
  executed: boolean;
}

export interface CheckResult {
  description: string;
  passed: boolean;
  detail?: string;
}

export interface Evaluation {
  run: RunResult;
  checks: CheckResult[];
  allPassed: boolean;
}

const MAX_OUTPUT = 8000;

interface Execution {
  logs: string[];
  returnValue: unknown;
  error: string | null;
  transpileFailed: boolean;
}

/** Transpile + invoke the source synchronously, capturing console output. */
function execute(source: string): Execution {
  const logs: string[] = [];
  const capture = (...args: unknown[]) => {
    logs.push(args.map(formatValue).join(' '));
  };
  const sandboxConsole = {
    log: capture,
    info: capture,
    warn: capture,
    error: capture,
    debug: capture,
  };

  let js: string;
  try {
    js = transpileTs(source);
  } catch (e) {
    return { logs, returnValue: undefined, error: `Transpile error: ${errMsg(e)}`, transpileFailed: true };
  }

  try {
    // `__result` lets exercises expose a value for runExpression checks.
    const fn = new Function(
      'console',
      `"use strict";\nlet __result;\n${js}\n;return typeof __result !== 'undefined' ? __result : undefined;`,
    );
    const returnValue = fn(sandboxConsole);
    return { logs, returnValue, error: null, transpileFailed: false };
  } catch (e) {
    return { logs, returnValue: undefined, error: errMsg(e), transpileFailed: false };
  }
}

/** Run JS/TS source, capturing synchronous console output. */
export function runJs(source: string): RunResult {
  const ex = execute(source);
  return {
    output: clip(ex.logs.join('\n')),
    returnValue: ex.returnValue,
    error: ex.error,
    executed: !ex.transpileFailed,
  };
}

/**
 * Run JS/TS and also wait for asynchronous output (Promises and short timers)
 * to settle before reading the console — so async/await exercises work.
 */
export async function runJsAsync(source: string): Promise<RunResult> {
  const ex = execute(source);
  if (!ex.transpileFailed) await flushAsync();
  return {
    output: clip(ex.logs.join('\n')),
    returnValue: ex.returnValue,
    error: ex.error,
    executed: !ex.transpileFailed,
  };
}

/** Drain microtasks and give short setTimeout-based work a chance to run. */
async function flushAsync(): Promise<void> {
  for (let i = 0; i < 5; i++) await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 30));
  for (let i = 0; i < 5; i++) await Promise.resolve();
}

function clip(s: string): string {
  return s.length > MAX_OUTPUT ? s.slice(0, MAX_OUTPUT) + '\n…(truncated)' : s;
}

function errMsg(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  return String(e);
}

export function formatValue(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'function') return `[Function: ${v.name || 'anonymous'}]`;
  try {
    return JSON.stringify(v, (_k, val) =>
      typeof val === 'bigint' ? `${val}n` : val,
    ) ?? String(v);
  } catch {
    return String(v);
  }
}

/** Evaluate one check against source + a prior run. */
export function evaluateCheck(check: Check, source: string, run: RunResult): CheckResult {
  switch (check.type) {
    case 'contains':
      return {
        description: check.description,
        passed: source.includes(check.value),
      };
    case 'notContains':
      return {
        description: check.description,
        passed: !source.includes(check.value),
      };
    case 'regex':
      return {
        description: check.description,
        passed: new RegExp(check.pattern, check.flags).test(source),
      };
    case 'notRegex':
      return {
        description: check.description,
        passed: !new RegExp(check.pattern, check.flags).test(source),
      };
    case 'runOutput': {
      if (!run.executed) {
        return { description: check.description, passed: false, detail: run.error ?? 'did not run' };
      }
      const actual = check.trim === false ? run.output : run.output.trim();
      const expected = check.trim === false ? check.expected : check.expected.trim();
      const passed = actual === expected;
      return {
        description: check.description,
        passed,
        detail: passed ? undefined : `expected:\n${expected}\n\ngot:\n${actual || '(no output)'}` +
          (run.error ? `\n\nerror: ${run.error}` : ''),
      };
    }
    case 'runExpression': {
      if (!run.executed) {
        return { description: check.description, passed: false, detail: run.error ?? 'did not run' };
      }
      try {
        // Re-run with the assertion appended so it can see declarations.
        const probe = runJs(`${source}\n__result = (${check.expression});`);
        const passed = probe.returnValue === true;
        return {
          description: check.description,
          passed,
          detail: passed ? undefined : `expression \`${check.expression}\` was ${formatValue(probe.returnValue)}` +
            (probe.error ? ` (error: ${probe.error})` : ''),
        };
      } catch (e) {
        return { description: check.description, passed: false, detail: errMsg(e) };
      }
    }
  }
}

const NOT_RUN: RunResult = { output: '', returnValue: undefined, error: null, executed: false };

/** Synchronous evaluation of an exercise submission. */
export function evaluateExercise(exercise: Exercise, source: string): Evaluation {
  const run = exercise.language === 'typescript' ? runJs(source) : NOT_RUN;
  const checks = exercise.checks.map((c) => evaluateCheck(c, source, run));
  return { run, checks, allPassed: checks.length > 0 && checks.every((c) => c.passed) };
}

/**
 * Async evaluation: waits for asynchronous output before checking, so
 * async/await exercises are graded correctly. Used by the UI and tests.
 */
export async function evaluateExerciseAsync(exercise: Exercise, source: string): Promise<Evaluation> {
  const run = exercise.language === 'typescript' ? await runJsAsync(source) : NOT_RUN;
  const checks = exercise.checks.map((c) => evaluateCheck(c, source, run));
  return { run, checks, allPassed: checks.length > 0 && checks.every((c) => c.passed) };
}
