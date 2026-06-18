/** Tests target the pure logic (engine, progress, content integrity) in Node. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { jsx: 'react', esModuleInterop: true } }],
  },
};
