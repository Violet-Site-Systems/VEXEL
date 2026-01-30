module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globalTeardown: '<rootDir>/jest.globalTeardown.ts',
  // Exclude integration tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/integration/',
    '/dist/'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!src/database/**',
    '!src/ipfs/**',
    '!src/knowledge-base/**',
    '!src/example.ts',
    '!src/service.ts'
  ],
  coverageThreshold: {
    global: {
      // Current thresholds - gradually increase toward 80% goal
      branches: 35,    // Current: 37.67%
      functions: 45,   // Current: 46.47%
      lines: 45,       // Current: 47.35%
      statements: 45   // Current: 46.4%
    }
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ],
  // Force exit after tests complete to avoid hanging workers
  forceExit: true
};
