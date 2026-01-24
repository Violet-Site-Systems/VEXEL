/**
 * Jest Global Setup
 * Ensures proper cleanup after all tests
 */

// Global teardown to wait for any pending async operations
afterAll(async () => {
  // Wait for any pending async operations to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
});

// Set longer timeout for async operations
jest.setTimeout(30000);
