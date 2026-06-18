import { Module } from '../types';

// Capstone module: integrative, real-world exercises that combine arrays,
// interfaces, generics, narrowing and error handling — the kind of code you
// actually write day to day.

export const tsProjects: Module = {
  id: 'ts-m5',
  title: 'Real-World Projects',
  description: 'Tie everything together: data pipelines, grouping, and a tiny state reducer.',
  lessons: [
    {
      id: 'ts-l9',
      title: 'Project: An Orders Data Pipeline',
      summary: 'Filter, transform, and aggregate a list of records — the bread and butter of real apps.',
      estimatedMinutes: 18,
      concepts: ['ts-arrays', 'ts-interfaces', 'ts-functions'],
      content: [
        { kind: 'paragraph', text: 'Almost every real application boils down to *moving data through stages*: take some records, keep the relevant ones, reshape them, then summarize. This is a **data pipeline**, and TypeScript makes each stage safe by typing the data as it flows.' },
        { kind: 'heading', text: 'The shape of our data' },
        { kind: 'code', language: 'typescript', code: 'interface Order {\n  id: string;\n  customer: string;\n  amount: number;\n  status: "paid" | "pending" | "refunded";\n}' },
        { kind: 'paragraph', text: 'A typical report: *total revenue from paid orders*. We chain `filter` → `map` → `reduce`. Each step returns a new array, so nothing is mutated.' },
        { kind: 'code', language: 'typescript', code: 'function paidRevenue(orders: Order[]): number {\n  return orders\n    .filter((o) => o.status === "paid")   // keep paid only\n    .map((o) => o.amount)                  // pull out the number\n    .reduce((sum, amt) => sum + amt, 0);   // total it\n}', caption: 'Read top-to-bottom: each line is one transformation stage.' },
        { kind: 'callout', tone: 'tip', text: 'Prefer this declarative chain over a manual `for` loop with a running total — it reads like the requirement ("sum the amounts of paid orders") and there is no index to get wrong.' },
        { kind: 'callout', tone: 'pitfall', title: 'Floating point money', text: 'Summing currency as floats can drift (0.1 + 0.2 !== 0.3). For real money, work in integer cents or use a decimal library. We keep whole numbers here to stay focused.' },
      ],
      exercises: [
        {
          id: 'ts-e11',
          title: 'Revenue report',
          prompt: 'Given the `orders` array, write `paidRevenue(orders)` that returns the sum of `amount` for orders whose status is "paid". Use filter/map/reduce (no manual loop). Log the result.',
          language: 'typescript',
          starterCode: 'interface Order {\n  id: string;\n  customer: string;\n  amount: number;\n  status: "paid" | "pending" | "refunded";\n}\n\nconst orders: Order[] = [\n  { id: "a", customer: "Ada", amount: 100, status: "paid" },\n  { id: "b", customer: "Lin", amount: 50, status: "pending" },\n  { id: "c", customer: "Ada", amount: 30, status: "paid" },\n  { id: "d", customer: "Sam", amount: 80, status: "refunded" },\n];\n\n// Implement paidRevenue and log paidRevenue(orders).\n',
          solution: 'interface Order {\n  id: string;\n  customer: string;\n  amount: number;\n  status: "paid" | "pending" | "refunded";\n}\n\nconst orders: Order[] = [\n  { id: "a", customer: "Ada", amount: 100, status: "paid" },\n  { id: "b", customer: "Lin", amount: 50, status: "pending" },\n  { id: "c", customer: "Ada", amount: 30, status: "paid" },\n  { id: "d", customer: "Sam", amount: 80, status: "refunded" },\n];\n\nfunction paidRevenue(items: Order[]): number {\n  return items\n    .filter((o) => o.status === "paid")\n    .map((o) => o.amount)\n    .reduce((sum, amt) => sum + amt, 0);\n}\nconsole.log(paidRevenue(orders));',
          checks: [
            { type: 'contains', value: 'filter', description: 'Uses filter to keep paid orders' },
            { type: 'contains', value: 'reduce', description: 'Uses reduce to total the amounts' },
            { type: 'runExpression', expression: 'paidRevenue(orders) === 130', description: 'Returns 130 (100 + 30)' },
            { type: 'runOutput', expected: '130', description: 'Logs 130', trim: true },
          ],
          hints: [
            { text: 'Chain: items.filter(...).map(...).reduce(...).' },
            { text: 'Only "paid" orders count: 100 + 30 = 130. Pending and refunded are excluded.' },
          ],
          concepts: ['ts-arrays', 'ts-interfaces'],
        },
        {
          id: 'ts-e12',
          title: 'Group revenue by customer',
          prompt: 'Write `revenueByCustomer(orders): Record<string, number>` that sums each customer\'s paid amounts into an object keyed by customer name. Log JSON.stringify of the result for the given orders.',
          language: 'typescript',
          starterCode: 'interface Order { id: string; customer: string; amount: number; status: "paid" | "pending" | "refunded"; }\nconst orders: Order[] = [\n  { id: "a", customer: "Ada", amount: 100, status: "paid" },\n  { id: "b", customer: "Lin", amount: 50, status: "pending" },\n  { id: "c", customer: "Ada", amount: 30, status: "paid" },\n];\n// Implement revenueByCustomer and log JSON.stringify(revenueByCustomer(orders)).\n',
          solution: 'interface Order { id: string; customer: string; amount: number; status: "paid" | "pending" | "refunded"; }\nconst orders: Order[] = [\n  { id: "a", customer: "Ada", amount: 100, status: "paid" },\n  { id: "b", customer: "Lin", amount: 50, status: "pending" },\n  { id: "c", customer: "Ada", amount: 30, status: "paid" },\n];\nfunction revenueByCustomer(items: Order[]): Record<string, number> {\n  const acc: Record<string, number> = {};\n  for (const o of items) {\n    if (o.status !== "paid") continue;\n    acc[o.customer] = (acc[o.customer] ?? 0) + o.amount;\n  }\n  return acc;\n}\nconsole.log(JSON.stringify(revenueByCustomer(orders)));',
          checks: [
            { type: 'runExpression', expression: 'revenueByCustomer(orders).Ada === 130', description: 'Ada\'s paid total is 130' },
            { type: 'runExpression', expression: 'revenueByCustomer(orders).Lin === undefined', description: 'Customers with no paid orders are absent' },
            { type: 'runOutput', expected: '{"Ada":130}', description: 'Logs the grouped totals as JSON', trim: true },
          ],
          hints: [
            { text: 'Accumulate into an object: acc[name] = (acc[name] ?? 0) + amount.' },
            { text: 'Skip non-paid orders with `if (o.status !== "paid") continue;`.' },
          ],
          concepts: ['ts-arrays', 'ts-narrowing'],
        },
      ],
      quiz: [
        {
          id: 'ts-q15',
          prompt: 'In a `filter(...).map(...).reduce(...)` chain, how many times is the original array mutated?',
          options: ['Once', 'Three times', 'Zero — each step returns a new array/value', 'Depends on the data'],
          answerIndex: 2,
          explanation: 'filter and map each return a brand-new array; reduce returns a single value. The source array is never modified.',
          concepts: ['ts-arrays'],
        },
        {
          id: 'ts-q16',
          prompt: 'What does `acc[key] ?? 0` accomplish when grouping?',
          options: ['Resets the accumulator', 'Provides a starting total of 0 the first time a key is seen', 'Deletes the key', 'Throws if the key is missing'],
          answerIndex: 1,
          explanation: 'The first time a customer appears, `acc[key]` is undefined, so `?? 0` supplies the initial total before adding.',
          concepts: ['ts-narrowing'],
        },
      ],
    },
    {
      id: 'ts-l10',
      title: 'Project: A Tiny State Reducer',
      summary: 'Model state transitions with a discriminated union — the pattern behind Redux & useReducer.',
      estimatedMinutes: 16,
      concepts: ['ts-narrowing', 'ts-functions'],
      content: [
        { kind: 'paragraph', text: 'A *reducer* is a pure function `(state, action) => newState`. It powers state management in React, mobile apps, and game loops. The key TypeScript tool is the **discriminated union**: actions share a common `type` field the compiler uses to narrow.' },
        { kind: 'code', language: 'typescript', code: 'interface State { count: number }\n\ntype Action =\n  | { type: "increment" }\n  | { type: "decrement" }\n  | { type: "add"; by: number };\n\nfunction reducer(state: State, action: Action): State {\n  switch (action.type) {\n    case "increment": return { count: state.count + 1 };\n    case "decrement": return { count: state.count - 1 };\n    case "add":       return { count: state.count + action.by };\n  }\n}', caption: 'Inside `case "add"`, TypeScript knows `action.by` exists.' },
        { kind: 'callout', tone: 'tip', text: 'Because every case returns a new object, state is never mutated — the same discipline real frameworks require so they can detect changes.' },
        { kind: 'callout', tone: 'info', title: 'Exhaustiveness', text: 'If you add a new action variant and forget a case, you can make TypeScript flag it with a `default: const _x: never = action;` — a compile-time guarantee you handled every action.' },
      ],
      exercises: [
        {
          id: 'ts-e13',
          title: 'Implement the reducer',
          prompt: 'Implement `reducer(state, action)` for the actions "increment", "decrement", and { type: "add"; by: number }. Starting from { count: 0 }, apply increment, then add 5, and log the final count.',
          language: 'typescript',
          starterCode: 'interface State { count: number }\ntype Action =\n  | { type: "increment" }\n  | { type: "decrement" }\n  | { type: "add"; by: number };\n\n// Implement reducer, then apply increment and add 5 starting from { count: 0 }.\n',
          solution: 'interface State { count: number }\ntype Action =\n  | { type: "increment" }\n  | { type: "decrement" }\n  | { type: "add"; by: number };\n\nfunction reducer(state: State, action: Action): State {\n  switch (action.type) {\n    case "increment": return { count: state.count + 1 };\n    case "decrement": return { count: state.count - 1 };\n    case "add": return { count: state.count + action.by };\n  }\n}\n\nlet state: State = { count: 0 };\nstate = reducer(state, { type: "increment" });\nstate = reducer(state, { type: "add", by: 5 });\nconsole.log(state.count);',
          checks: [
            { type: 'contains', value: 'switch', description: 'Switches on the action type' },
            { type: 'runExpression', expression: 'reducer({count: 10}, {type: "decrement"}).count === 9', description: 'decrement lowers the count' },
            { type: 'runExpression', expression: 'reducer({count: 1}, {type: "add", by: 4}).count === 5', description: 'add uses action.by' },
            { type: 'runOutput', expected: '6', description: 'Logs 6 (0 + 1 + 5)', trim: true },
          ],
          hints: [
            { text: 'A switch on action.type narrows the action so action.by is available in the "add" case.' },
            { text: 'Return a NEW object each time: { count: state.count + 1 } — do not mutate state.' },
          ],
          concepts: ['ts-narrowing', 'ts-functions'],
        },
      ],
      quiz: [
        {
          id: 'ts-q17',
          prompt: 'What makes `{ type: "add"; by: number }` part of a *discriminated* union?',
          options: ['It has the most fields', 'A shared literal field (`type`) the compiler uses to tell variants apart', 'It uses numbers', 'It is listed last'],
          answerIndex: 1,
          explanation: 'A common literal property (here `type`) lets TypeScript narrow the union in a switch/if and reveal the variant-specific fields.',
          concepts: ['ts-narrowing'],
        },
        {
          id: 'ts-q18',
          prompt: 'Why should a reducer return a new object instead of mutating `state`?',
          options: ['It is faster', 'Frameworks detect changes by comparing references, and purity avoids subtle bugs', 'TypeScript forbids mutation', 'To use more memory'],
          answerIndex: 1,
          explanation: 'Returning new state keeps the function pure and lets change-detection (e.g. React) compare old vs new references reliably.',
          concepts: ['ts-functions'],
        },
      ],
    },
  ],
};
