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
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ]
};
