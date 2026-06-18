// Centralized dark theme tuned for a code-focused mobile app.

export const theme = {
  colors: {
    bg: '#0d1117',
    surface: '#161b22',
    surfaceAlt: '#1c2230',
    border: '#30363d',
    text: '#e6edf3',
    textDim: '#8b949e',
    accent: '#58a6ff',
    success: '#3fb950',
    danger: '#f85149',
    warning: '#d29922',
    // Syntax highlight palette.
    synKeyword: '#ff7b72',
    synString: '#a5d6ff',
    synNumber: '#79c0ff',
    synComment: '#8b949e',
    synFunction: '#d2a8ff',
    synType: '#7ee787',
    synPunctuation: '#c9d1d9',
    synBuiltin: '#ffa657',
  },
  typescript: '#3178c6',
  go: '#00add8',
  spacing: (n: number) => n * 8,
  radius: 10,
  mono: 'monospace' as const,
} as const;

export type Theme = typeof theme;
