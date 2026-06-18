import { Concept, LibraryGuide, Resource, SyntaxErrorGuide } from '../types';

export const goConcepts: Concept[] = [
  { id: 'go-packages', name: 'Packages & main', blurb: 'package main, imports, and func main as the entry point.' },
  { id: 'go-fmt', name: 'Printing with fmt', blurb: 'Println, Print, and Printf format verbs.' },
  { id: 'go-variables', name: 'Variables (var & :=)', blurb: 'Declaring values, short declarations, and zero values.' },
  { id: 'go-types', name: 'Basic types & conversion', blurb: 'int, float64, bool, string and explicit conversions.' },
  { id: 'go-constants', name: 'Constants & iota', blurb: 'Compile-time const values and iota enums.' },
  { id: 'go-functions', name: 'Functions', blurb: 'Parameters, return types, and multiple return values.' },
  { id: 'go-controlflow', name: 'Control flow', blurb: 'if, the single for loop, and switch.' },
  { id: 'go-errors', name: 'Error handling', blurb: 'The error return value and if err != nil convention.' },
  { id: 'go-defer', name: 'defer', blurb: 'Scheduling cleanup that runs when a function returns.' },
  { id: 'go-slices', name: 'Arrays & slices', blurb: 'Growable slices, append, and slicing.' },
  { id: 'go-maps', name: 'Maps', blurb: 'Keyed collections, make, and the comma-ok idiom.' },
  { id: 'go-structs', name: 'Structs & methods', blurb: 'Custom record types and methods with receivers.' },
  { id: 'go-pointers', name: 'Pointers', blurb: 'Addresses, dereferencing, and pointer receivers.' },
  { id: 'go-interfaces', name: 'Interfaces', blurb: 'Implicitly-satisfied method sets and polymorphism.' },
  { id: 'go-goroutines', name: 'Goroutines', blurb: 'Lightweight concurrency with the go keyword and WaitGroups.' },
  { id: 'go-channels', name: 'Channels', blurb: 'Typed conduits for communicating between goroutines.' },
];

export const goResources: Resource[] = [
  {
    id: 'go-r-vars',
    title: 'var vs := and Zero Values',
    concepts: ['go-variables', 'go-types'],
    body: [
      { kind: 'paragraph', text: 'Go gives you two declaration forms, and choosing the right one removes most beginner confusion. Think of `:=` as "declare and infer, inside a function" and `var` as "works everywhere, type optional".' },
      { kind: 'list', items: [
        '`:=` only works inside functions and always declares at least one NEW variable.',
        '`var x T` works at package scope too and gives x its zero value.',
        'Plain `=` reassigns an existing variable — never declares.',
      ] },
      { kind: 'code', language: 'go', code: 'var total int      // 0, package or function scope\ncount := 0         // function scope only\ntotal = count + 1  // reassignment with =' },
      { kind: 'callout', tone: 'tip', text: 'Because every type has a zero value (0, false, "", or nil), you never deal with "undefined". Declaring a variable is always safe to read immediately.' },
    ],
  },
  {
    id: 'go-r-errors',
    title: 'The Go Error Convention',
    concepts: ['go-errors', 'go-functions'],
    body: [
      { kind: 'paragraph', text: 'Errors in Go are ordinary values, returned as the last result of a function. There is no try/catch for normal failures — the failure path is right there in the code, which is the whole point.' },
      { kind: 'code', language: 'go', code: 'f, err := os.Open("data.txt")\nif err != nil {\n\treturn fmt.Errorf("opening data: %w", err)\n}\ndefer f.Close()' },
      { kind: 'list', ordered: true, items: [
        'Check the error immediately after the call with `if err != nil`.',
        'Add context as it bubbles up using fmt.Errorf with the %w verb.',
        'Inspect specific errors with errors.Is and errors.As.',
      ] },
      { kind: 'callout', tone: 'pitfall', text: 'Reserve panic for truly unrecoverable bugs (a violated invariant), not for expected failures like a missing file or bad user input.' },
    ],
  },
  {
    id: 'go-r-slices',
    title: 'Slices Demystified',
    concepts: ['go-slices'],
    body: [
      { kind: 'paragraph', text: 'A slice is a small header — a pointer, a length, and a capacity — that views an underlying array. Copying a slice copies the header, not the data, so two slices can share the same backing array.' },
      { kind: 'code', language: 'go', code: 'nums := []int{1, 2, 3, 4}\nview := nums[1:3]   // shares backing array: [2 3]\nview[0] = 99        // also changes nums[1]!' },
      { kind: 'paragraph', text: '`append` adds elements; when capacity runs out it allocates a bigger array and copies, returning a new header. That is why you always reassign the result.' },
      { kind: 'callout', tone: 'tip', text: 'Pre-size a slice you will fill in a loop with make([]T, 0, n) to avoid repeated reallocation: it reserves capacity up front.' },
    ],
  },
  {
    id: 'go-r-pointers',
    title: 'Value vs Pointer Receivers',
    concepts: ['go-pointers', 'go-structs'],
    body: [
      { kind: 'paragraph', text: 'A method receiver is just a parameter. A value receiver gets a copy of the struct; a pointer receiver gets the address, so it can modify the original.' },
      { kind: 'code', language: 'go', code: 'func (c Counter) Read() int  { return c.N }   // copy: read-only\nfunc (c *Counter) Inc()      { c.N++ }        // pointer: mutates' },
      { kind: 'list', items: [
        'Use a pointer receiver when the method mutates the receiver.',
        'Use a pointer receiver for large structs to avoid copying.',
        'Be consistent: if any method needs a pointer receiver, use pointer receivers for all of them.',
      ] },
      { kind: 'callout', tone: 'pitfall', text: 'A value-receiver method that assigns to a field changes only the local copy — the change silently disappears. This is the #1 pointer-receiver bug.' },
    ],
  },
  {
    id: 'go-r-concurrency',
    title: 'Goroutines & Channels Without Deadlocks',
    concepts: ['go-goroutines', 'go-channels'],
    body: [
      { kind: 'paragraph', text: 'Start concurrent work with `go f()`. Coordinate it with channels (to pass values) or a sync.WaitGroup (to wait for completion). The golden rule: every send needs a receiver, and main must not exit before the goroutines finish.' },
      { kind: 'code', language: 'go', code: 'results := make(chan int)\nfor _, job := range jobs {\n\tgo func(j int) { results <- work(j) }(job)\n}\nfor range jobs {\n\tfmt.Println(<-results) // one receive per send\n}' },
      { kind: 'callout', tone: 'warning', text: 'A "all goroutines are asleep - deadlock!" panic means everyone is blocked on a channel that will never be served. Count your sends and receives.' },
      { kind: 'callout', tone: 'tip', text: 'Always pass the loop variable as an argument to the goroutine (the j above). Otherwise every goroutine may capture the same final value.' },
    ],
  },
];

export const goErrors: SyntaxErrorGuide[] = [
  {
    id: 'go-err-unused-var',
    message: 'declared and not used',
    cause: 'You declared a local variable but never read it. Go treats this as a compile error to keep code clean.',
    fix: 'Use the variable, remove it, or assign it to the blank identifier _ if you truly need to discard it.',
    example: { language: 'go', bad: 'func main() {\n\tx := 10\n\tfmt.Println("hi")\n}', good: 'func main() {\n\tx := 10\n\tfmt.Println(x)\n}' },
    concepts: ['go-variables'],
  },
  {
    id: 'go-err-unused-import',
    message: 'imported and not used: "fmt"',
    cause: 'You imported a package but never referenced anything from it.',
    fix: 'Remove the unused import, or use the package. (goimports/gofmt tooling can fix this automatically.)',
    example: { language: 'go', bad: 'import (\n\t"fmt"\n\t"os"\n)\n\nfunc main() { fmt.Println("hi") }', good: 'import "fmt"\n\nfunc main() { fmt.Println("hi") }' },
    concepts: ['go-packages'],
  },
  {
    id: 'go-err-no-new-vars',
    message: 'no new variables on left side of :=',
    cause: 'You used := where every variable on the left already exists, so nothing new is being declared.',
    fix: 'Switch to plain = to reassign, or introduce at least one new variable on the left.',
    example: { language: 'go', bad: 'x := 1\nx := 2', good: 'x := 1\nx = 2' },
    concepts: ['go-variables'],
  },
  {
    id: 'go-err-undefined',
    message: 'undefined: foo',
    cause: 'You referenced a name that is not declared — often a typo, a missing import, or a function defined in another unimported package.',
    fix: 'Check the spelling and capitalization, declare it, or import the package that provides it.',
    example: { language: 'go', bad: 'func main() { Println("hi") }', good: 'import "fmt"\n\nfunc main() { fmt.Println("hi") }' },
    concepts: ['go-packages', 'go-functions'],
  },
  {
    id: 'go-err-missing-return',
    message: 'missing return at end of function',
    cause: 'A function declared to return a value has a path that does not return one.',
    fix: 'Ensure every code path returns a value — add a final return after the conditionals.',
    example: { language: 'go', bad: 'func sign(n int) string {\n\tif n > 0 {\n\t\treturn "pos"\n\t}\n}', good: 'func sign(n int) string {\n\tif n > 0 {\n\t\treturn "pos"\n\t}\n\treturn "non-pos"\n}' },
    concepts: ['go-functions', 'go-controlflow'],
  },
  {
    id: 'go-err-nil-map',
    message: 'panic: assignment to entry in nil map',
    cause: 'You wrote to a map that was declared but never initialized (its value is nil).',
    fix: 'Initialize the map with make or a literal before assigning keys.',
    example: { language: 'go', bad: 'var m map[string]int\nm["a"] = 1', good: 'm := make(map[string]int)\nm["a"] = 1' },
    concepts: ['go-maps'],
  },
  {
    id: 'go-err-mismatched-types',
    message: 'invalid operation: i + f (mismatched types int and float64)',
    cause: 'Go never converts numeric types implicitly, so you cannot mix int and float64 in one expression.',
    fix: 'Convert one operand explicitly so both sides share a type.',
    example: { language: 'go', bad: 'i := 3\nf := 2.0\nx := i + f', good: 'i := 3\nf := 2.0\nx := float64(i) + f' },
    concepts: ['go-types'],
  },
];

export const goLibraries: LibraryGuide[] = [
  {
    id: 'go-lib-fmt',
    name: 'fmt',
    importPath: 'fmt',
    description: 'Formatted I/O: printing to stdout and building formatted strings.',
    examples: [
      { title: 'Println vs Printf', code: 'fmt.Println("x =", 3)          // x = 3\nfmt.Printf("x = %d\\n", 3)      // x = 3', explanation: 'Println space-separates and adds a newline; Printf uses verbs and needs an explicit \\n.' },
      { title: 'Build a string with Sprintf', code: 'msg := fmt.Sprintf("%s:%d", host, port)', explanation: 'Sprintf returns the formatted string instead of printing it.' },
      { title: 'Common verbs', code: 'fmt.Printf("%d %s %v %t %.2f\\n", 5, "hi", []int{1}, true, 3.14159)', explanation: '%d int, %s string, %v default format, %t bool, %.2f float with 2 decimals.' },
    ],
  },
  {
    id: 'go-lib-strings',
    name: 'strings',
    importPath: 'strings',
    description: 'Helpers for searching, splitting, and transforming UTF-8 text.',
    examples: [
      { title: 'Contains / HasPrefix', code: 'strings.Contains("golang", "lang") // true\nstrings.HasPrefix("main.go", "main") // true', explanation: 'Membership and prefix/suffix tests on strings.' },
      { title: 'Split / Join', code: 'parts := strings.Split("a,b,c", ",") // ["a" "b" "c"]\njoined := strings.Join(parts, "-")    // "a-b-c"', explanation: 'Convert between a string and a slice of substrings.' },
      { title: 'ToUpper / TrimSpace / ReplaceAll', code: 'strings.ToUpper("hi")           // "HI"\nstrings.TrimSpace("  hi  ")     // "hi"\nstrings.ReplaceAll("a-a", "-", "+") // "a+a"', explanation: 'Case folding, trimming whitespace, and substitution.' },
    ],
  },
  {
    id: 'go-lib-strconv',
    name: 'strconv',
    importPath: 'strconv',
    description: 'Conversions between strings and numeric/boolean types.',
    examples: [
      { title: 'Atoi / Itoa', code: 'n, err := strconv.Atoi("42") // 42, nil\ns := strconv.Itoa(42)         // "42"', explanation: 'Atoi parses a string to int (returning an error); Itoa formats an int to string.' },
      { title: 'ParseFloat / ParseBool', code: 'f, _ := strconv.ParseFloat("3.14", 64)\nb, _ := strconv.ParseBool("true")', explanation: 'Parse floats (with a bit size) and booleans from text.' },
      { title: 'Handle the error', code: 'n, err := strconv.Atoi(input)\nif err != nil {\n\treturn fmt.Errorf("bad number %q: %w", input, err)\n}', explanation: 'Always check the error — invalid input is reported, not silently zeroed.' },
    ],
  },
  {
    id: 'go-lib-errors',
    name: 'errors',
    importPath: 'errors',
    description: 'Creating, wrapping, and inspecting error values.',
    examples: [
      { title: 'Create a simple error', code: 'return errors.New("not found")', explanation: 'errors.New builds a basic error with a fixed message.' },
      { title: 'Sentinel errors with Is', code: 'var ErrNotFound = errors.New("not found")\n// later:\nif errors.Is(err, ErrNotFound) { /* handle */ }', explanation: 'Compare against a known sentinel even through wrapping with errors.Is.' },
      { title: 'Wrap with context', code: 'return fmt.Errorf("loading user %d: %w", id, err)', explanation: 'The %w verb wraps the original error so errors.Is/As can still find it.' },
    ],
  },
  {
    id: 'go-lib-sort',
    name: 'sort',
    importPath: 'sort',
    description: 'Sorting slices in place, including by a custom comparison.',
    examples: [
      { title: 'Sort ints and strings', code: 'sort.Ints([]int{3, 1, 2})          // [1 2 3]\nsort.Strings([]string{"b", "a"})    // ["a" "b"]', explanation: 'Convenience functions for the common element types.' },
      { title: 'Custom order with Slice', code: 'sort.Slice(people, func(i, j int) bool {\n\treturn people[i].Age < people[j].Age\n})', explanation: 'sort.Slice sorts by any comparison; the callback returns true if i should come before j.' },
      { title: 'Stable sort map keys', code: 'keys := make([]string, 0, len(m))\nfor k := range m {\n\tkeys = append(keys, k)\n}\nsort.Strings(keys)', explanation: 'Map iteration order is random — collect keys and sort them for deterministic output.' },
    ],
  },
];
