// A small, allocation-light tokenizer for syntax highlighting TS and Go.
// Returns an array of {text, color} spans the editor renders as <Text> runs.
// Not a parser — a lexer good enough for readable highlighting on-device.

import { LanguageId } from '../content/types';
import { theme } from '../theme/theme';

export interface Span {
  text: string;
  color: string;
}

const TS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'class', 'extends', 'implements', 'interface',
  'type', 'enum', 'import', 'export', 'from', 'as', 'new', 'this', 'super', 'typeof',
  'instanceof', 'in', 'of', 'await', 'async', 'yield', 'try', 'catch', 'finally',
  'throw', 'void', 'delete', 'public', 'private', 'protected', 'readonly', 'static',
  'get', 'set', 'default', 'null', 'undefined', 'true', 'false', 'namespace', 'declare',
]);

const TS_BUILTINS = new Set([
  'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean',
  'Promise', 'Map', 'Set', 'Date', 'Error', 'Symbol', 'RegExp', 'parseInt',
  'parseFloat', 'isNaN', 'Infinity', 'NaN', 'globalThis',
]);

const GO_KEYWORDS = new Set([
  'package', 'import', 'func', 'return', 'if', 'else', 'for', 'range', 'switch',
  'case', 'default', 'break', 'continue', 'var', 'const', 'type', 'struct', 'interface',
  'map', 'chan', 'go', 'defer', 'select', 'fallthrough', 'goto', 'nil', 'true', 'false',
  'iota',
]);

const GO_BUILTINS = new Set([
  'fmt', 'len', 'cap', 'make', 'new', 'append', 'copy', 'delete', 'panic', 'recover',
  'print', 'println', 'close', 'string', 'int', 'int32', 'int64', 'float64', 'float32',
  'bool', 'byte', 'rune', 'error', 'uint', 'uint8', 'uint32', 'uint64', 'errors',
  'strings', 'strconv', 'os', 'time', 'sort', 'math', 'bytes', 'io', 'bufio', 'sync',
]);

export function tokenize(code: string, language: LanguageId): Span[] {
  const keywords = language === 'go' ? GO_KEYWORDS : TS_KEYWORDS;
  const builtins = language === 'go' ? GO_BUILTINS : TS_BUILTINS;
  const c = theme.colors;
  const spans: Span[] = [];
  const n = code.length;
  let i = 0;

  const push = (text: string, color: string) => {
    if (text.length === 0) return;
    const last = spans[spans.length - 1];
    if (last && last.color === color) last.text += text;
    else spans.push({ text, color });
  };

  while (i < n) {
    const ch = code[i];

    // Line comment.
    if (ch === '/' && code[i + 1] === '/') {
      const end = indexOrEnd(code, '\n', i);
      push(code.slice(i, end), c.synComment);
      i = end;
      continue;
    }
    // Block comment.
    if (ch === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const e = end === -1 ? n : end + 2;
      push(code.slice(i, e), c.synComment);
      i = e;
      continue;
    }
    // Strings (incl. Go raw strings with backticks, TS templates).
    if (ch === '"' || ch === "'" || ch === '`') {
      const end = scanString(code, i);
      push(code.slice(i, end), c.synString);
      i = end;
      continue;
    }
    // Numbers.
    if (isDigit(ch) || (ch === '.' && isDigit(code[i + 1]))) {
      let j = i + 1;
      while (j < n && /[0-9a-fA-FxXbBoO._]/.test(code[j])) j++;
      push(code.slice(i, j), c.synNumber);
      i = j;
      continue;
    }
    // Identifiers / keywords.
    if (isIdentStart(ch)) {
      let j = i + 1;
      while (j < n && isIdentPart(code[j])) j++;
      const word = code.slice(i, j);
      let next = j;
      while (next < n && code[next] === ' ') next++;
      const isCall = code[next] === '(';
      if (keywords.has(word)) push(word, c.synKeyword);
      else if (builtins.has(word)) push(word, c.synBuiltin);
      else if (isCall) push(word, c.synFunction);
      else if (/^[A-Z]/.test(word)) push(word, c.synType);
      else push(word, c.synPunctuation);
      i = j;
      continue;
    }
    // Punctuation / whitespace.
    if (/[{}()[\];,.<>:?!&|+\-*/%=~^]/.test(ch)) {
      push(ch, c.synPunctuation);
      i++;
      continue;
    }
    push(ch, c.synPunctuation);
    i++;
  }
  return spans;
}

function scanString(code: string, start: number): number {
  const quote = code[start];
  let i = start + 1;
  const n = code.length;
  while (i < n) {
    if (code[i] === '\\' && quote !== '`') {
      i += 2;
      continue;
    }
    if (code[i] === quote) return i + 1;
    i++;
  }
  return n;
}

function indexOrEnd(code: string, target: string, from: number): number {
  const idx = code.indexOf(target, from);
  return idx === -1 ? code.length : idx;
}

const isDigit = (c: string) => c >= '0' && c <= '9';
const isIdentStart = (c: string) => /[A-Za-z_$]/.test(c);
const isIdentPart = (c: string) => /[A-Za-z0-9_$]/.test(c);
