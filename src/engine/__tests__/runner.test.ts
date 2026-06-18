import { runJs, evaluateCheck } from '../runner';
import { transpileTs } from '../transpile';

describe('transpileTs', () => {
  it('strips simple type annotations', () => {
    const js = transpileTs('const x: number = 41; console.log(x + 1);');
    const r = runJs(js);
    expect(r.error).toBeNull();
  });

  it('handles interfaces, functions, generics', () => {
    const src = `
      interface User { name: string; age: number }
      function greet<T>(u: User, extra: T): string {
        return "Hi " + u.name + " (" + String(extra) + ")";
      }
      const u: User = { name: "Ada", age: 36 };
      console.log(greet(u, 1));
    `;
    const r = runJs(src);
    expect(r.error).toBeNull();
    expect(r.output).toBe('Hi Ada (1)');
  });

  it('handles enums and as casts', () => {
    const src = `
      enum Color { Red, Green, Blue }
      const c = Color.Green as number;
      console.log(c);
    `;
    const r = runJs(src);
    expect(r.error).toBeNull();
    expect(r.output).toBe('1');
  });
});

describe('runJs', () => {
  it('captures multiple console.log lines', () => {
    const r = runJs('console.log("a"); console.log("b", 2);');
    expect(r.output).toBe('a\nb 2');
  });

  it('reports runtime errors without crashing', () => {
    const r = runJs('throw new Error("boom");');
    expect(r.error).toContain('boom');
  });

  it('formats objects via JSON', () => {
    const r = runJs('console.log({ a: 1, b: [2,3] });');
    expect(r.output).toBe('{"a":1,"b":[2,3]}');
  });
});

describe('evaluateCheck', () => {
  it('runOutput compares trimmed output', () => {
    const src = 'console.log("hello");';
    const run = runJs(src);
    const res = evaluateCheck(
      { type: 'runOutput', expected: 'hello', description: 'prints hello' },
      src,
      run,
    );
    expect(res.passed).toBe(true);
  });

  it('runExpression asserts over declarations', () => {
    const src = 'function add(a: number, b: number): number { return a + b; }';
    const run = runJs(src);
    const res = evaluateCheck(
      { type: 'runExpression', expression: 'add(2,3) === 5', description: 'add works' },
      src,
      run,
    );
    expect(res.passed).toBe(true);
  });

  it('regex check inspects source', () => {
    const res = evaluateCheck(
      { type: 'regex', pattern: 'const\\s+\\w+', description: 'uses const' },
      'const x = 1;',
      runJs('const x = 1;'),
    );
    expect(res.passed).toBe(true);
  });
});
