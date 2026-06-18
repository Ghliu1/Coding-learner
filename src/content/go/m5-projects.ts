import { Module } from '../types';

// Capstone module for Go: integrative, real-world programs combining slices,
// maps, structs, and error handling. Go can't run on-device, so exercises use
// static source checks plus a shown expected output.

export const goProjects: Module = {
  id: 'go-m5',
  title: 'Real-World Projects',
  description: 'Put it together: a word-frequency counter and a small inventory service.',
  lessons: [
    {
      id: 'go-l9',
      title: 'Project: Word-Frequency Counter',
      summary: 'Count how often each word appears — slices, maps, and the strings package in concert.',
      estimatedMinutes: 18,
      concepts: ['go-slices', 'go-maps'],
      content: [
        { kind: 'paragraph', text: 'Counting occurrences is a classic real-world task — log analysis, search indexing, analytics all start here. In Go you reach for `strings.Fields` to split text and a `map[string]int` to tally.' },
        { kind: 'code', language: 'go', code: 'package main\n\nimport (\n\t"fmt"\n\t"strings"\n)\n\nfunc wordCount(text string) map[string]int {\n\tcounts := make(map[string]int)\n\tfor _, w := range strings.Fields(text) {\n\t\tcounts[strings.ToLower(w)]++\n\t}\n\treturn counts\n}\n\nfunc main() {\n\tc := wordCount("the cat the dog The")\n\tfmt.Println(c["the"]) // 3\n}', caption: 'strings.Fields splits on any whitespace; map zero-values make ++ work on first sight.' },
        { kind: 'callout', tone: 'tip', title: 'Zero values save you', text: 'Reading a missing map key returns the value type\'s zero (0 for int), so `counts[w]++` works even the first time a word appears — no "if exists" check needed.' },
        { kind: 'callout', tone: 'pitfall', title: 'Map iteration order is random', text: 'Ranging over a map yields keys in a *random* order each run. If you need stable output, collect the keys into a slice and `sort.Strings` them first.' },
      ],
      exercises: [
        {
          id: 'go-e16',
          title: 'Count the words',
          prompt: 'Write `wordCount(text string) map[string]int` that lower-cases and tallies each whitespace-separated word using strings.Fields and a map. In main, print the count of "the" for the text "the cat the dog The".',
          language: 'go',
          starterCode: 'package main\n\nimport (\n\t"fmt"\n\t"strings"\n)\n\n// Implement wordCount, then print c["the"] in main.\n',
          solution: 'package main\n\nimport (\n\t"fmt"\n\t"strings"\n)\n\nfunc wordCount(text string) map[string]int {\n\tcounts := make(map[string]int)\n\tfor _, w := range strings.Fields(text) {\n\t\tcounts[strings.ToLower(w)]++\n\t}\n\treturn counts\n}\n\nfunc main() {\n\tc := wordCount("the cat the dog The")\n\tfmt.Println(c["the"])\n}',
          checks: [
            { type: 'contains', value: 'strings.Fields', description: 'Splits with strings.Fields' },
            { type: 'contains', value: 'make(map[string]int)', description: 'Creates a string->int map' },
            { type: 'regex', pattern: 'strings\\.ToLower', description: 'Lower-cases words so "The" and "the" merge' },
            { type: 'regex', pattern: '\\]\\+\\+', description: 'Increments the map counter' },
          ],
          hints: [
            { text: 'Range over strings.Fields(text); the loop variable is each word.' },
            { text: 'counts[strings.ToLower(w)]++ tallies case-insensitively.' },
          ],
          concepts: ['go-slices', 'go-maps'],
          expectedOutput: '3',
        },
      ],
      quiz: [
        {
          id: 'go-q17',
          prompt: 'Why does `counts[word]++` work even before the word has been seen?',
          options: ['Go pre-fills all keys', 'A missing map key reads as the zero value (0 for int)', 'It panics and recovers', 'strings.Fields adds the key'],
          answerIndex: 1,
          explanation: 'Reading an absent key returns the value type\'s zero value, so the first ++ goes 0 -> 1.',
          concepts: ['go-maps'],
        },
        {
          id: 'go-q18',
          prompt: 'You need the word counts printed in alphabetical order. What must you do?',
          options: ['Nothing, maps are sorted', 'Collect keys into a slice and sort.Strings them', 'Use a bigger map', 'Range twice'],
          answerIndex: 1,
          explanation: 'Map iteration order is randomized; sort the keys in a slice for deterministic output.',
          concepts: ['go-maps', 'go-slices'],
        },
      ],
    },
    {
      id: 'go-l10',
      title: 'Project: A Small Inventory Service',
      summary: 'Structs, methods, and the error convention in a realistic mini-service.',
      estimatedMinutes: 18,
      concepts: ['go-structs', 'go-errors'],
      content: [
        { kind: 'paragraph', text: 'Real services bundle data and behavior and report failures explicitly. We model an inventory with a struct, attach methods with a pointer receiver (so they can mutate), and return an `error` when an operation is invalid.' },
        { kind: 'code', language: 'go', code: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\ntype Inventory struct {\n\tstock map[string]int\n}\n\nfunc NewInventory() *Inventory {\n\treturn &Inventory{stock: make(map[string]int)}\n}\n\nfunc (inv *Inventory) Add(item string, n int) {\n\tinv.stock[item] += n\n}\n\nfunc (inv *Inventory) Remove(item string, n int) error {\n\tif inv.stock[item] < n {\n\t\treturn errors.New("not enough stock")\n\t}\n\tinv.stock[item] -= n\n\treturn nil\n}', caption: 'A pointer receiver (inv *Inventory) lets methods modify the struct.' },
        { kind: 'callout', tone: 'tip', title: 'Constructor convention', text: 'Go has no constructors; the idiom is a `NewX()` function that returns an initialized `*X` — here it makes the map so callers never hit a nil map.' },
        { kind: 'callout', tone: 'pitfall', title: 'Nil maps panic on write', text: 'A struct field `map[string]int` defaults to nil. Writing to a nil map panics. Always initialize it (in NewInventory) before use.' },
      ],
      exercises: [
        {
          id: 'go-e17',
          title: 'Remove with an error',
          prompt: 'Add a method `Remove(item string, n int) error` on *Inventory that returns errors.New("not enough stock") when stock is insufficient, otherwise subtracts n and returns nil. In main, Add 5 apples, Remove 3, and print the remaining count and the error from removing 10.',
          language: 'go',
          starterCode: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\ntype Inventory struct{ stock map[string]int }\n\nfunc NewInventory() *Inventory { return &Inventory{stock: make(map[string]int)} }\nfunc (inv *Inventory) Add(item string, n int) { inv.stock[item] += n }\n\n// Add the Remove method, then exercise it in main.\n',
          solution: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\ntype Inventory struct{ stock map[string]int }\n\nfunc NewInventory() *Inventory { return &Inventory{stock: make(map[string]int)} }\nfunc (inv *Inventory) Add(item string, n int) { inv.stock[item] += n }\n\nfunc (inv *Inventory) Remove(item string, n int) error {\n\tif inv.stock[item] < n {\n\t\treturn errors.New("not enough stock")\n\t}\n\tinv.stock[item] -= n\n\treturn nil\n}\n\nfunc main() {\n\tinv := NewInventory()\n\tinv.Add("apple", 5)\n\tinv.Remove("apple", 3)\n\tfmt.Println(inv.stock["apple"])\n\tfmt.Println(inv.Remove("apple", 10))\n}',
          checks: [
            { type: 'regex', pattern: 'func\\s*\\(\\s*inv\\s*\\*Inventory\\s*\\)\\s*Remove', description: 'Defines Remove on a pointer receiver' },
            { type: 'contains', value: 'errors.New("not enough stock")', description: 'Returns the not-enough-stock error' },
            { type: 'regex', pattern: 'return\\s+nil', description: 'Returns nil on success' },
            { type: 'regex', pattern: 'inv\\.stock\\[item\\]\\s*-=\\s*n', description: 'Subtracts the removed quantity' },
          ],
          hints: [
            { text: 'Guard first: if inv.stock[item] < n, return errors.New(...).' },
            { text: 'On success, subtract with -= and return nil.' },
          ],
          concepts: ['go-structs', 'go-errors'],
          expectedOutput: '2\nnot enough stock',
        },
      ],
      quiz: [
        {
          id: 'go-q19',
          prompt: 'Why is the receiver `(inv *Inventory)` a pointer rather than a value?',
          options: ['Pointers are required for all methods', 'So the method can modify the struct\'s fields', 'It is faster to type', 'Value receivers cannot read fields'],
          answerIndex: 1,
          explanation: 'A pointer receiver operates on the original struct, so mutations (changing stock) persist. A value receiver works on a copy.',
          concepts: ['go-structs'],
        },
        {
          id: 'go-q20',
          prompt: 'What happens if you write to the `stock` map without initializing it via NewInventory?',
          options: ['It silently creates the map', 'A runtime panic: assignment to entry in nil map', 'It returns an error', 'The write is ignored'],
          answerIndex: 1,
          explanation: 'A nil map can be read but not written; writing panics. The NewInventory constructor makes the map to prevent this.',
          concepts: ['go-maps', 'go-structs'],
        },
      ],
    },
  ],
};
