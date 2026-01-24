/**
 * Jest Global Setup
 * Ensures proper cleanup after all tests
 */

// Global teardown to wait for any pending async operations
afterAll(async () => {
  // Wait for any pending async operations to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Set longer timeout for async operations
jest.setTimeout(30000);
