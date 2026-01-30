module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globalTeardown: '<rootDir>/jest.globalTeardown.ts',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**'
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
  ]
};
