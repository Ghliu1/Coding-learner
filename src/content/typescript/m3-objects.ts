import { Module } from '../types';

export const tsObjects: Module = {
  id: 'ts-m3',
  title: 'Objects, Interfaces & Classes',
  description: 'Modeling structured data and behavior with interfaces and classes.',
  lessons: [
    {
      id: 'ts-l5',
      title: 'Interfaces & Object Types',
      summary: 'Describe the shape of objects and enforce it everywhere.',
      estimatedMinutes: 14,
      concepts: ['ts-interfaces', 'ts-types'],
      content: [
        { kind: 'paragraph', text: 'An *interface* describes the shape of an object: which properties it has and their types. It is the most common way to model data in TypeScript.' },
        { kind: 'code', language: 'typescript', code: 'interface User {\n  id: number;\n  name: string;\n  email?: string;        // optional\n  readonly createdAt: number; // can\'t be reassigned\n}\n\nconst u: User = { id: 1, name: "Ada", createdAt: Date.now() };\n// u.createdAt = 0; // Error: readonly' },
        { kind: 'callout', tone: 'info', text: '`?` marks a property optional; `readonly` prevents reassignment after creation. Both are compile-time only.' },
        { kind: 'heading', text: 'Nested and function members' },
        { kind: 'code', language: 'typescript', code: 'interface Order {\n  id: string;\n  items: { sku: string; qty: number }[];\n  total(): number;        // method signature\n}' },
        { kind: 'heading', text: 'Extending & combining' },
        { kind: 'paragraph', text: 'Interfaces compose with `extends`. The `&` (intersection) operator merges types.' },
        { kind: 'code', language: 'typescript', code: 'interface Animal { name: string; }\ninterface Dog extends Animal { breed: string; }\n\ntype Timestamped = { createdAt: number };\ntype TimestampedUser = User & Timestamped;' },
        { kind: 'callout', tone: 'pitfall', title: 'interface vs type', text: 'Both can describe object shapes. Use `interface` for objects/classes you may extend, and `type` for unions, tuples, and aliases. Pick one style and stay consistent.' },
      ],
      exercises: [
        {
          id: 'ts-e6',
          title: 'Describe and total a cart',
          prompt: 'Define an interface `CartItem` with `name: string` and `price: number`. Write `cartTotal(items: CartItem[]): number` summing the prices. Log the total of two items priced 4 and 6.',
          language: 'typescript',
          starterCode: '// Define CartItem and cartTotal, then log a sample total.\n',
          solution: 'interface CartItem {\n  name: string;\n  price: number;\n}\nfunction cartTotal(items: CartItem[]): number {\n  return items.reduce((t, i) => t + i.price, 0);\n}\nconsole.log(cartTotal([{ name: "a", price: 4 }, { name: "b", price: 6 }]));',
          checks: [
            { type: 'regex', pattern: 'interface\\s+CartItem', description: 'Defines a CartItem interface' },
            { type: 'runExpression', expression: 'cartTotal([{name:"a",price:4},{name:"b",price:6}]) === 10', description: 'cartTotal sums prices to 10' },
            { type: 'runOutput', expected: '10', description: 'Logs the total 10', trim: true },
          ],
          hints: [
            { text: 'Reduce over items adding i.price each step.' },
            { text: 'Start the reduce accumulator at 0.' },
          ],
          concepts: ['ts-interfaces'],
        },
      ],
      quiz: [
        {
          id: 'ts-q8',
          prompt: 'What does `readonly` on an interface property do?',
          options: ['Hides it from other files', 'Prevents reassignment after the object is created', 'Makes it optional', 'Forces it to be a string'],
          answerIndex: 1,
          explanation: '`readonly` allows reading but blocks reassignment at compile time. It does not affect runtime behavior.',
          concepts: ['ts-interfaces'],
        },
      ],
    },
    {
      id: 'ts-l6',
      title: 'Classes & Encapsulation',
      summary: 'Bundling state and behavior with constructors, methods, and access modifiers.',
      estimatedMinutes: 14,
      concepts: ['ts-classes'],
      content: [
        { kind: 'paragraph', text: 'Classes bundle data (fields) with behavior (methods). TypeScript adds access modifiers — `public`, `private`, `protected` — and a shorthand for declaring fields directly in the constructor.' },
        { kind: 'code', language: 'typescript', code: 'class BankAccount {\n  // Constructor parameter properties: declares + assigns in one step.\n  constructor(private balance: number = 0) {}\n\n  deposit(amount: number): void {\n    this.balance += amount;\n  }\n  withdraw(amount: number): boolean {\n    if (amount > this.balance) return false;\n    this.balance -= amount;\n    return true;\n  }\n  getBalance(): number {\n    return this.balance;\n  }\n}\n\nconst acct = new BankAccount(100);\nacct.deposit(50);\nconsole.log(acct.getBalance()); // 150\n// acct.balance;  // Error: balance is private' },
        { kind: 'callout', tone: 'tip', text: 'Putting `private`/`public` on a constructor parameter declares the field *and* assigns it — no separate `this.balance = balance` needed.' },
        { kind: 'heading', text: 'Inheritance' },
        { kind: 'code', language: 'typescript', code: 'class Shape {\n  constructor(public name: string) {}\n  area(): number { return 0; }\n}\nclass Circle extends Shape {\n  constructor(private radius: number) {\n    super("circle");\n  }\n  area(): number {\n    return Math.PI * this.radius ** 2;\n  }\n}', caption: 'Call super() before using `this` in a subclass constructor.' },
      ],
      exercises: [
        {
          id: 'ts-e7',
          title: 'A counter class',
          prompt: 'Write a class `Counter` with a private `count` starting at 0, an `increment()` method, and a `value()` method returning the count. Create one, increment twice, and log its value.',
          language: 'typescript',
          starterCode: '// Implement the Counter class and demonstrate it.\n',
          solution: 'class Counter {\n  private count = 0;\n  increment(): void {\n    this.count += 1;\n  }\n  value(): number {\n    return this.count;\n  }\n}\nconst c = new Counter();\nc.increment();\nc.increment();\nconsole.log(c.value());',
          checks: [
            { type: 'regex', pattern: 'class\\s+Counter', description: 'Defines a Counter class' },
            { type: 'runExpression', expression: '(() => { const c = new Counter(); c.increment(); c.increment(); c.increment(); return c.value(); })() === 3', description: 'Three increments yield 3' },
            { type: 'runOutput', expected: '2', description: 'Logs 2 after two increments', trim: true },
          ],
          hints: [
            { text: 'Initialize the field: private count = 0;' },
            { text: 'increment() should do this.count += 1.' },
          ],
          concepts: ['ts-classes'],
        },
      ],
      quiz: [
        {
          id: 'ts-q9',
          prompt: 'In `constructor(private balance: number)`, what does `private` accomplish?',
          options: ['Nothing, it is decorative', 'Declares a private field and assigns the argument to it automatically', 'Makes the whole class private', 'Prevents the class from being instantiated'],
          answerIndex: 1,
          explanation: 'A parameter property both declares the field and assigns the constructor argument, with the given visibility.',
          concepts: ['ts-classes'],
        },
        {
          id: 'ts-q10',
          prompt: 'Before using `this` in a subclass constructor, you must call…',
          options: ['this.init()', 'super()', 'new Parent()', 'nothing special'],
          answerIndex: 1,
          explanation: 'A subclass must call `super(...)` (the parent constructor) before accessing `this`.',
          concepts: ['ts-classes'],
        },
      ],
    },
  ],
};
