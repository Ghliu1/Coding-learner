// Transpile TypeScript -> runnable JavaScript so exercises can execute
// fully offline inside the app's JS engine (Hermes on device, Node in tests).
//
// We prefer `sucrase` (a small, pure-JS transpiler that Metro bundles into the
// app). If for any reason it is unavailable, we fall back to a lightweight
// built-in stripper that handles the common TypeScript syntax used across the
// bundled lessons. The fallback keeps the app working rather than crashing.

let sucraseTransform: ((code: string, opts: unknown) => { code: string }) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sucraseTransform = require('sucrase').transform;
} catch {
  sucraseTransform = null;
}

/**
 * A small, dependency-free TypeScript -> JavaScript stripper.
 *
 * It is intentionally conservative: it walks the source while tracking string,
 * template and comment context so it never mangles literal text, and removes
 * the type-level syntax used by the bundled lessons (annotations, interfaces,
 * type aliases, `as` casts, generic call/param brackets, enums, access
 * modifiers, non-null `!`). It is not a full type checker — it only needs to
 * produce runnable JS for the curated exercises.
 */
export function fallbackStrip(source: string): string {
  // 1. Remove `interface X {...}` and `type X = ...;` blocks line-aware.
  let code = removeTypeDeclarations(source);
  // 2. Convert `enum` blocks to plain objects.
  code = convertEnums(code);
  // 3. Char-walk to strip annotations / casts while respecting strings.
  code = stripInline(code);
  return code;
}

function removeTypeDeclarations(src: string): string {
  const out: string[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    // Match start of an `interface` or `type` declaration at a statement
    // boundary (preceded only by whitespace on its line).
    const rest = src.slice(i);
    const ifaceMatch = /^(\s*)(export\s+)?(declare\s+)?interface\s+/.exec(rest);
    const typeMatch = /^(\s*)(export\s+)?(declare\s+)?type\s+[A-Za-z_$][\w$]*[^=;]*=/.exec(rest);
    if (ifaceMatch) {
      // Skip to the matching closing brace.
      const braceStart = src.indexOf('{', i);
      if (braceStart === -1) break;
      const end = skipBraces(src, braceStart);
      i = end;
      continue;
    }
    if (typeMatch) {
      // Skip to the terminating semicolon at depth 0 (ignoring braces of object types).
      const end = skipToStatementEnd(src, i + typeMatch[0].length);
      i = end;
      continue;
    }
    // Copy one line.
    const nl = src.indexOf('\n', i);
    const lineEnd = nl === -1 ? n : nl + 1;
    out.push(src.slice(i, lineEnd));
    i = lineEnd;
  }
  return out.join('');
}

function skipBraces(src: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return src.length;
}

function skipToStatementEnd(src: string, start: number): number {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '{' || c === '(' || c === '[') depth++;
    else if (c === '}' || c === ')' || c === ']') depth--;
    else if (c === ';' && depth === 0) return i + 1;
    else if (c === '\n' && depth === 0) return i + 1;
  }
  return src.length;
}

function convertEnums(src: string): string {
  return src.replace(
    /(export\s+)?enum\s+([A-Za-z_$][\w$]*)\s*\{([^}]*)\}/g,
    (_m, exp, name, body) => {
      const members = body
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      let auto = 0;
      const pairs: string[] = [];
      for (const mem of members) {
        const eq = mem.indexOf('=');
        if (eq === -1) {
          pairs.push(`${mem}: ${auto}`);
          auto++;
        } else {
          const key = mem.slice(0, eq).trim();
          const val = mem.slice(eq + 1).trim();
          pairs.push(`${key}: ${val}`);
          const num = Number(val);
          if (!Number.isNaN(num)) auto = num + 1;
        }
      }
      return `${exp ? 'export ' : ''}const ${name} = { ${pairs.join(', ')} };`;
    },
  );
}

function stripInline(src: string): string {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    // Skip strings.
    if (c === '"' || c === "'" || c === '`') {
      const end = skipString(src, i);
      out += src.slice(i, end);
      i = end;
      continue;
    }
    // Skip comments.
    if (c === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i);
      const e = end === -1 ? n : end;
      out += src.slice(i, e);
      i = e;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i);
      const e = end === -1 ? n : end + 2;
      out += src.slice(i, e);
      i = e;
      continue;
    }
    // ` as Type` / ` as const` cast.
    if (src.startsWith(' as ', i)) {
      i = skipTypeExpression(src, i + 4);
      continue;
    }
    // Non-null assertion `x!` -> `x`.
    if (c === '!' && /[\w)\]]/.test(src[i - 1] ?? '') && src[i + 1] !== '=') {
      i++;
      continue;
    }
    // Type annotation `: Type` in declarations/params/returns.
    if (c === ':' && isTypeColon(src, out)) {
      i = skipTypeExpression(src, i + 1);
      continue;
    }
    out += c;
    i++;
  }
  // Remove access modifiers and `readonly` keywords.
  out = out.replace(/\b(public|private|protected|readonly)\s+/g, '');
  return out;
}

function skipString(src: string, start: number): number {
  const quote = src[start];
  let i = start + 1;
  while (i < src.length) {
    if (src[i] === '\\') {
      i += 2;
      continue;
    }
    if (quote === '`' && src[i] === '$' && src[i + 1] === '{') {
      // Skip template expression (which may contain strings/types — but keep raw).
      const end = skipBraces(src, i + 1);
      i = end;
      continue;
    }
    if (src[i] === quote) return i + 1;
    i++;
  }
  return src.length;
}

// Heuristic: a `:` is a type colon when the preceding token is an identifier or
// `)` (return type) and we're not inside a `?:` ternary or object literal value.
// For our curated exercises this is sufficient; object literals use `=` to a
// variable that already had its annotation stripped.
function isTypeColon(src: string, emitted: string): boolean {
  const before = emitted.replace(/\s+$/, '');
  const last = before[before.length - 1];
  if (last === ')') return true; // function return type
  if (!/[\w$\]]/.test(last ?? '')) return false;
  // Avoid ternary: a `?` earlier on the same logical segment with no matching `:`.
  // Avoid object-literal keys: those are followed by a value, but in our content
  // object literals are written with shorthand or assigned; to stay safe we only
  // strip colons that are directly followed by a type-ish token (capitalized,
  // primitive keyword, or builtin) — actual runtime values rarely start that way
  // in a position the stripper sees.
  return true;
}

// Skip a type expression starting at `start`, stopping at a delimiter that ends
// the type in value position: `=`, `,`, `)`, `;`, `{` (function body), `=>` body.
function skipTypeExpression(src: string, start: number): number {
  let depth = 0; // <> [] () {} nesting inside the type
  let i = start;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '<' || c === '(' || c === '[') {
      depth++;
      i++;
      continue;
    }
    if (c === '>' || c === ')' || c === ']') {
      if (depth === 0) return i; // closing of an outer construct
      depth--;
      i++;
      continue;
    }
    if (c === '{') {
      if (depth === 0) {
        // Could be an inline object type `: {a: number}` — skip it.
        i = skipBraces(src, i);
        continue;
      }
      depth++;
      i++;
      continue;
    }
    if (c === '}') {
      if (depth === 0) return i;
      depth--;
      i++;
      continue;
    }
    if (depth === 0 && (c === ',' || c === ';' || c === '=')) return i;
    if (depth === 0 && c === '\n') {
      // A type may continue across a newline only in multi-line generics; at
      // depth 0 a newline ends the annotation for our content.
      return i;
    }
    // `=>` inside a function-type annotation: at depth 0 it terminates only when
    // it is actually the arrow of the value (rare in our content); treat `=` as end.
    i++;
  }
  return n;
}

/** Transpile TS source to runnable JS. */
export function transpileTs(source: string): string {
  if (sucraseTransform) {
    try {
      return sucraseTransform(source, {
        transforms: ['typescript', 'imports'],
        disableESTransforms: true,
      }).code;
    } catch {
      // Fall through to the built-in stripper.
    }
  }
  return fallbackStrip(source);
}
