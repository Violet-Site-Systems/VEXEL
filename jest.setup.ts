/**
 * Jest Global Setup
 * Ensures proper cleanup after all tests
 */

// Configurable cleanup delay
const CLEANUP_DELAY_MS = process.env.JEST_CLEANUP_DELAY 
  ? parseInt(process.env.JEST_CLEANUP_DELAY, 10) 
  : 2000;

// Global teardown to wait for any pending async operations
afterAll(async () => {
  // Wait for any pending async operations to complete
  await new Promise(resolve => setTimeout(resolve, CLEANUP_DELAY_MS));
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Set longer timeout for async operations
jest.setTimeout(30000);
