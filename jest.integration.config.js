module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // Only run integration tests
  testMatch: ['**/__tests__/integration/**/*.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globalTeardown: '<rootDir>/jest.globalTeardown.ts',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ],
  // Longer timeout for integration tests
  testTimeout: 30000
};
