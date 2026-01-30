/**
 * Jest Global Teardown
 * Runs once after all test files complete
 */

// Configurable cleanup delay - increased from 2000ms to 3000ms
const CLEANUP_DELAY_MS = process.env.JEST_CLEANUP_DELAY 
  ? parseInt(process.env.JEST_CLEANUP_DELAY, 10) 
  : 3000;

export default async function globalTeardown() {
  // Wait for any pending async operations to complete
  await new Promise(resolve => setTimeout(resolve, CLEANUP_DELAY_MS));
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
}
