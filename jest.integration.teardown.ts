/**
 * Jest Integration Test Teardown
 * Handles database cleanup after all integration tests complete
 */

import { DatabaseClient } from './src/database/client';
import { MigrationRunner } from './src/database/migrate';

// Teardown grace period to allow async operations to complete
const TEARDOWN_GRACE_PERIOD_MS = 2000;

/**
 * Global teardown - runs once after all tests complete
 */
export default async function teardown() {
  console.log('\n=== Integration Test Teardown ===');
  
  const db = new DatabaseClient();
  
  try {
    // Optional: Clean up test data
    // This can be disabled if you want to inspect data after tests
    const shouldCleanup = process.env.KEEP_TEST_DATA !== 'true';
    
    if (shouldCleanup) {
      console.log('Cleaning up test database...');
      const migrationRunner = new MigrationRunner(db);
      
      try {
        await migrationRunner.down();
        console.log('✓ Test database cleaned up');
      } catch (error) {
        console.error('✗ Cleanup failed:', error);
        // Don't fail the tests if cleanup fails
      }
    } else {
      console.log('Skipping cleanup (KEEP_TEST_DATA=true)');
    }

    // Close database connections
    await db.close();
    console.log('✓ Database connections closed');
  } catch (error) {
    console.error('Error during teardown:', error);
  }

  // Wait for any pending async operations
  await new Promise(resolve => setTimeout(resolve, TEARDOWN_GRACE_PERIOD_MS));
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  console.log('=== Integration Test Teardown Complete ===\n');
}
