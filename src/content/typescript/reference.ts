import { Concept, LibraryGuide, Resource, SyntaxErrorGuide } from '../types';

export const tsConcepts: Concept[] = [
  { id: 'ts-variables', name: 'Variables & const/let', blurb: 'Declaring values and choosing const vs let.' },
  { id: 'ts-types', name: 'Type system basics', blurb: 'Primitives, unions, literals, and type aliases.' },
  { id: 'ts-arrays', name: 'Arrays & tuples', blurb: 'Typed collections and fixed-shape tuples.' },
  { id: 'ts-functions', name: 'Functions', blurb: 'Parameter/return types, optional and default params.' },
  { id: 'ts-generics', name: 'Generics', blurb: 'Reusable, type-safe code with type parameters.' },
  { id: 'ts-interfaces', name: 'Interfaces & object types', blurb: 'Describing the shape of data.' },
  { id: 'ts-classes', name: 'Classes', blurb: 'State, methods, access modifiers, inheritance.' },
  { id: 'ts-narrowing', name: 'Narrowing & null safety', blurb: 'Guards, optional chaining, nullish coalescing.' },
  { id: 'ts-errors', name: 'Error handling', blurb: 'throw/try/catch and result types.' },
  { id: 'ts-async', name: 'Async & Promises', blurb: 'async/await and Promise<T>.' },
];

export const tsResources: Resource[] = [
  {
    id: 'ts-r-types',
    title: 'Deep Dive: Thinking in Types',
    concepts: ['ts-types', 'ts-arrays'],
    body: [
      { kind: 'paragraph', text: 'A type is a *set of allowed values*. `number` is the set of all numbers; `"on" | "off"` is a set of exactly two strings. Type-checking asks one question: is this value a member of the expected set?' },
      { kind: 'heading', text: 'Union and intersection' },
      { kind: 'list', items: [
        '`A | B` (union): a value that is either an A **or** a B. Widening — more values allowed.',
        '`A & B` (intersection): a value that satisfies **both** A and B. Narrowing — fewer values allowed.',
      ] },
      { kind: 'code', language: 'typescript', code: 'type Id = number | string;          // union\ntype Named = { name: string };\ntype Aged = { age: number };\ntype Person = Named & Aged;          // must have both' },
      { kind: 'callout', tone: 'tip', text: 'When stuck, ask: "what is the *set* of values this type allows?" Most confusion melts away once you think in sets.' },
    ],
  },
  {
    id: 'ts-r-generics',
    title: 'Generics, Demystified',
    concepts: ['ts-generics'],
    body: [
      { kind: 'paragraph', text: 'A generic is a function for *types*. Just as `add(a, b)` takes value arguments, `Array<T>` takes a type argument. The angle brackets are the type call.' },
      { kind: 'code', language: 'typescript', code: 'function wrap<T>(x: T): T[] { return [x]; }\nwrap(3);      // T = number  -> number[]\nwrap("hi");   // T = string  -> string[]' },
      { kind: 'paragraph', text: 'Read `<T>` as "for any type T". The compiler picks T from the arguments so you rarely write it explicitly.' },
      { kind: 'callout', tone: 'pitfall', text: 'If you find yourself reaching for `any`, ask whether a generic would keep the type instead. `any` switches off checking; generics keep it on.' },
    ],
  },
  {
    id: 'ts-r-null',
    title: 'Banishing "undefined is not a function"',
    concepts: ['ts-narrowing', 'ts-errors'],
    body: [
      { kind: 'paragraph', text: 'Most crashes come from using a value that was secretly missing. TypeScript turns these into compile errors — if you let it, by enabling `strict` mode and modeling absence explicitly.' },
      { kind: 'list', ordered: true, items: [
        'Model optional data as `T | undefined` (or `?`), never pretend it is always there.',
        'Narrow with a guard (`if (x)`, `typeof`, `instanceof`) before using it.',
        'Use `?.` to read through possibly-missing links and `??` for fallbacks.',
      ] },
      { kind: 'code', language: 'typescript', code: 'const len = user.profile?.bio?.length ?? 0;' },
    ],
  },
  {
    id: 'ts-r-async',
    title: 'Async Without Tears',
    concepts: ['ts-async'],
    body: [
      { kind: 'paragraph', text: 'A Promise is a box that will *eventually* contain a value (or an error). `await` opens the box, pausing the function until it is ready.' },
      { kind: 'list', items: [
        'Always `await` (or `.then`) a Promise — an un-awaited Promise is a silent bug.',
        'Wrap awaits that can fail in `try/catch`.',
        'Run independent work in parallel with `Promise.all([...])` instead of awaiting one-by-one.',
      ] },
      { kind: 'code', language: 'typescript', code: 'const [a, b] = await Promise.all([fetchA(), fetchB()]); // concurrent' },
    ],
  },
];

export const tsErrors: SyntaxErrorGuide[] = [
  {
    id: 'ts-err-assign',
    message: "Type 'string' is not assignable to type 'number'.",
    cause: 'You assigned a value whose type does not match the declared/inferred type of the target.',
    fix: 'Convert the value (e.g. Number(x)) or fix the declared type so they agree.',
    example: { language: 'typescript', bad: 'let age: number = "30";', good: 'let age: number = Number("30"); // 30' },
    concepts: ['ts-types', 'ts-variables'],
  },
  {
    id: 'ts-err-possibly-undefined',
    message: "Object is possibly 'undefined'.",
    cause: 'You used a value that the type says might be undefined/null without checking first.',
    fix: 'Narrow with a guard or use optional chaining / a default before accessing members.',
    example: { language: 'typescript', bad: 'function f(s?: string) { return s.length; }', good: 'function f(s?: string) { return s?.length ?? 0; }' },
    concepts: ['ts-narrowing'],
  },
  {
    id: 'ts-err-missing-prop',
    message: "Property 'email' is missing in type ... but required in type 'User'.",
    cause: 'An object literal is missing a property the interface requires.',
    fix: 'Add the property, or make it optional in the interface with `?` if it truly can be absent.',
    example: { language: 'typescript', bad: 'const u: User = { id: 1, name: "A" };', good: 'const u: User = { id: 1, name: "A", email: "a@x.com" };' },
    concepts: ['ts-interfaces'],
  },
  {
    id: 'ts-err-implicit-any',
    message: "Parameter 'x' implicitly has an 'any' type.",
    cause: 'In strict mode every parameter needs a type; the compiler will not silently use `any`.',
    fix: 'Add an explicit type annotation to the parameter.',
    example: { language: 'typescript', bad: 'function sq(x) { return x * x; }', good: 'function sq(x: number) { return x * x; }' },
    concepts: ['ts-functions'],
  },
  {
    id: 'ts-err-await-nonasync',
    message: "'await' expressions are only allowed within async functions.",
    cause: 'You used await inside a function not marked async.',
    fix: 'Mark the enclosing function `async`.',
    example: { language: 'typescript', bad: 'function load() { const x = await get(); }', good: 'async function load() { const x = await get(); }' },
    concepts: ['ts-async'],
  },
];

export const tsLibraries: LibraryGuide[] = [
  {
    id: 'ts-lib-array',
    name: 'Array methods',
    importPath: '(built-in)',
    description: 'The functional toolkit you reach for daily: transform, filter, and reduce data without manual loops.',
    examples: [
      { title: 'map: transform each element', code: 'const prices = [10, 20, 30];\nconst withTax = prices.map((p) => p * 1.2); // [12, 24, 36]', explanation: 'map returns a new array of the same length with each element transformed.' },
      { title: 'filter: keep some elements', code: 'const nums = [1, 2, 3, 4, 5];\nconst evens = nums.filter((n) => n % 2 === 0); // [2, 4]', explanation: 'filter keeps only elements for which the callback returns true.' },
      { title: 'reduce: fold to a single value', code: 'const total = [1, 2, 3].reduce((sum, n) => sum + n, 0); // 6', explanation: 'reduce accumulates a result; the second argument is the starting value.' },
      { title: 'find / some / every', code: 'users.find((u) => u.id === 7);   // first match or undefined\nnums.some((n) => n < 0);         // any negative?\nnums.every((n) => n > 0);        // all positive?', explanation: 'Search and test helpers that read like English.' },
    ],
  },
  {
    id: 'ts-lib-string',
    name: 'String methods',
    importPath: '(built-in)',
    description: 'Slicing, searching, and reshaping text.',
    examples: [
      { title: 'split / join', code: '"a,b,c".split(",");       // ["a","b","c"]\n["a","b"].join("-");      // "a-b"', explanation: 'Convert between strings and arrays.' },
      { title: 'includes / startsWith / trim', code: '"hello".includes("ell"); // true\n"  hi  ".trim();          // "hi"', explanation: 'Common membership and cleanup operations.' },
      { title: 'template literals', code: 'const name = "Ada";\nconst msg = `Hi ${name}, you have ${1 + 2} messages`;', explanation: 'Backticks interpolate expressions with ${...}.' },
    ],
  },
  {
    id: 'ts-lib-map',
    name: 'Map & Set',
    importPath: '(built-in)',
    description: 'Keyed collections (Map) and unique collections (Set) — better than plain objects for dynamic keys.',
    examples: [
      { title: 'Map: key/value store', code: 'const counts = new Map<string, number>();\ncounts.set("a", 1);\ncounts.get("a");        // 1\ncounts.has("b");        // false', explanation: 'Map keeps insertion order and allows any key type.' },
      { title: 'Set: unique values', code: 'const unique = new Set([1, 1, 2, 3]);\nunique.size;            // 3\n[...unique];            // [1, 2, 3]', explanation: 'A Set automatically de-duplicates and supports fast membership tests.' },
    ],
  },
  {
    id: 'ts-lib-json',
    name: 'JSON',
    importPath: '(built-in)',
    description: 'Serialize to and from the universal data-interchange format.',
    examples: [
      { title: 'stringify / parse', code: 'const obj = { id: 1, tags: ["a", "b"] };\nconst text = JSON.stringify(obj);   // \'{"id":1,"tags":["a","b"]}\'\nconst back = JSON.parse(text);      // object again', explanation: 'stringify turns data into text for storage/transport; parse reverses it.' },
      { title: 'pretty printing', code: 'JSON.stringify(obj, null, 2); // indented with 2 spaces', explanation: 'The third argument controls indentation for human-readable output.' },
    ],
  },
];
