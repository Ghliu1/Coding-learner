import { Module } from '../types';

export const tsFunctions: Module = {
  id: 'ts-m2',
  title: 'Functions & Generics',
  description: 'Typed functions, optional/default params, and reusable generic code.',
  lessons: [
    {
      id: 'ts-l3',
      title: 'Typing Functions',
      summary: 'Parameter types, return types, optional and default parameters.',
      estimatedMinutes: 12,
      concepts: ['ts-functions'],
      content: [
        { kind: 'paragraph', text: 'Functions are where types pay off most: they document exactly what goes in and what comes out, and the compiler holds every caller to that contract.' },
        { kind: 'code', language: 'typescript', code: 'function add(a: number, b: number): number {\n  return a + b;\n}\n\n// Arrow function form:\nconst multiply = (a: number, b: number): number => a * b;' },
        { kind: 'paragraph', text: 'The return type (`: number`) is usually inferred, but writing it explicitly on exported functions documents intent and catches accidental wrong returns.' },
        { kind: 'heading', text: 'Optional & default parameters' },
        { kind: 'paragraph', text: 'A `?` marks a parameter optional (its type becomes `T | undefined`). A `=` gives a default, which also makes it optional for callers.' },
        { kind: 'code', language: 'typescript', code: 'function greet(name: string, greeting: string = "Hello"): string {\n  return `${greeting}, ${name}!`;\n}\ngreet("Ada");            // "Hello, Ada!"\ngreet("Ada", "Hi");      // "Hi, Ada!"\n\nfunction log(msg: string, prefix?: string): string {\n  return prefix ? `[${prefix}] ${msg}` : msg;\n}' },
        { kind: 'callout', tone: 'warning', text: 'Optional parameters must come *after* all required ones. `function f(a?: number, b: number)` is an error.' },
        { kind: 'heading', text: 'Rest parameters' },
        { kind: 'code', language: 'typescript', code: 'function sum(...nums: number[]): number {\n  return nums.reduce((t, n) => t + n, 0);\n}\nsum(1, 2, 3, 4); // 10', caption: 'Rest params collect any number of trailing arguments into a typed array.' },
      ],
      exercises: [
        {
          id: 'ts-e4',
          title: 'Build a formatter',
          prompt: 'Write `formatPrice(amount: number, currency: string = "USD"): string` that returns `"<amount> <currency>"` with the amount fixed to 2 decimals, e.g. `formatPrice(5)` → `"5.00 USD"`. Log `formatPrice(5)` and `formatPrice(3.5, "EUR")`.',
          language: 'typescript',
          starterCode: '// Implement formatPrice with a default currency of "USD".\n',
          solution: 'function formatPrice(amount: number, currency: string = "USD"): string {\n  return `${amount.toFixed(2)} ${currency}`;\n}\nconsole.log(formatPrice(5));\nconsole.log(formatPrice(3.5, "EUR"));',
          checks: [
            { type: 'runExpression', expression: 'formatPrice(5) === "5.00 USD"', description: 'Defaults currency to USD and formats to 2 decimals' },
            { type: 'runExpression', expression: 'formatPrice(3.5, "EUR") === "3.50 EUR"', description: 'Accepts an explicit currency' },
            { type: 'runOutput', expected: '5.00 USD\n3.50 EUR', description: 'Logs both formatted prices', trim: true },
          ],
          hints: [
            { text: 'Use amount.toFixed(2) to force two decimal places.' },
            { text: 'Give currency a default: currency: string = "USD".' },
          ],
          concepts: ['ts-functions'],
        },
      ],
      quiz: [
        {
          id: 'ts-q5',
          prompt: 'What is the type of `prefix` inside this function?',
          code: { language: 'typescript', code: 'function log(msg: string, prefix?: string) { /* ... */ }' },
          options: ['string', 'string | undefined', 'undefined', 'any'],
          answerIndex: 1,
          explanation: 'The `?` makes the parameter optional, so its type is `string | undefined` and you must handle the undefined case.',
          concepts: ['ts-functions'],
        },
      ],
    },
    {
      id: 'ts-l4',
      title: 'Generics: Reusable, Type-Safe Code',
      summary: 'Write functions and types that work over any type without losing safety.',
      estimatedMinutes: 15,
      concepts: ['ts-generics'],
      content: [
        { kind: 'paragraph', text: 'Generics let you write code that works with *any* type while preserving the relationship between inputs and outputs. The classic example: a function that returns its argument unchanged.' },
        { kind: 'code', language: 'typescript', code: 'function identity<T>(value: T): T {\n  return value;\n}\nconst a = identity<number>(5);   // a: number\nconst b = identity("hi");        // T inferred as string', caption: '<T> is a type parameter — a placeholder filled in per call.' },
        { kind: 'paragraph', text: 'Without generics you would either lose type information (using `any`) or write one copy per type. Generics give you one implementation that stays fully typed.' },
        { kind: 'heading', text: 'Generic constraints' },
        { kind: 'paragraph', text: 'Use `extends` to require that a type parameter has certain members.' },
        { kind: 'code', language: 'typescript', code: 'function longest<T extends { length: number }>(a: T, b: T): T {\n  return a.length >= b.length ? a : b;\n}\nlongest("hello", "hi");      // works: strings have length\nlongest([1, 2, 3], [1]);     // works: arrays have length\n// longest(10, 20);          // Error: number has no length' },
        { kind: 'callout', tone: 'tip', text: 'A constraint like `<T extends { length: number }>` says "T can be anything, as long as it has a numeric length".' },
        { kind: 'heading', text: 'Generic types & interfaces' },
        { kind: 'code', language: 'typescript', code: 'interface Box<T> {\n  value: T;\n}\nconst numBox: Box<number> = { value: 42 };\nconst strBox: Box<string> = { value: "hi" };\n\ntype Result<T> = { ok: true; data: T } | { ok: false; error: string };' },
      ],
      exercises: [
        {
          id: 'ts-e5',
          title: 'A generic first()',
          prompt: 'Write a generic function `first<T>(items: T[]): T | undefined` that returns the first element of an array, or `undefined` if empty. Log `first([10, 20])` and `first<string>([])`.',
          language: 'typescript',
          starterCode: '// Implement a generic first() that preserves the element type.\n',
          solution: 'function first<T>(items: T[]): T | undefined {\n  return items.length > 0 ? items[0] : undefined;\n}\nconsole.log(first([10, 20]));\nconsole.log(first<string>([]));',
          checks: [
            { type: 'regex', pattern: 'function\\s+first\\s*<', description: 'Declares a generic type parameter' },
            { type: 'runExpression', expression: 'first([10,20]) === 10 && first([]) === undefined', description: 'Returns the first element or undefined' },
            { type: 'runOutput', expected: '10\nundefined', description: 'Logs 10 then undefined', trim: true },
          ],
          hints: [
            { text: 'Declare the type parameter after the name: function first<T>(items: T[])' },
            { text: 'Return undefined when items.length === 0.' },
          ],
          concepts: ['ts-generics'],
        },
      ],
      quiz: [
        {
          id: 'ts-q6',
          prompt: 'Why use a generic instead of the `any` type for a reusable container?',
          options: ['Generics run faster', '`any` is not valid TypeScript', 'Generics preserve the specific type so callers keep autocomplete and checks', 'There is no difference'],
          answerIndex: 2,
          explanation: '`any` discards all type information. Generics remember the exact type used at each call site, keeping the rest of your code type-safe.',
          concepts: ['ts-generics'],
        },
        {
          id: 'ts-q7',
          prompt: 'What does `<T extends { length: number }>` mean?',
          options: ['T must be an array', 'T can be any type that has a numeric `length` property', 'T extends a class named length', 'T must be a string'],
          answerIndex: 1,
          explanation: 'It constrains T to types that have a `length: number` member — strings, arrays, and any object with that shape.',
          concepts: ['ts-generics'],
        },
      ],
    },
  ],
};
