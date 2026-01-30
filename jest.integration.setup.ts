/**
 * Jest Integration Test Setup
 * Handles database initialization and cleanup for integration tests
 */

import { DatabaseClient } from './src/database/client';
import { MigrationRunner } from './src/database/migrate';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Allowed test database names for safety
const ALLOWED_TEST_DB_NAMES = ['vexel_test', 'vexel_test_ci', 'test_vexel'];

// Global database client for setup/teardown
let globalDb: DatabaseClient;

/**
 * Global setup - runs once before all tests
 */
export default async function setup() {
  console.log('=== Integration Test Setup ===');
  
  // Ensure we're using test database and test environment
  const dbName = process.env.DATABASE_NAME;
  const nodeEnv = process.env.NODE_ENV;
  
  // Strict validation to prevent accidental production database usage
  if (!dbName || !ALLOWED_TEST_DB_NAMES.includes(dbName)) {
    throw new Error(
      `Invalid test database name: "${dbName}". ` +
      `Must be one of: ${ALLOWED_TEST_DB_NAMES.join(', ')}. ` +
      `Set DATABASE_NAME environment variable.`
    );
  }
  
  if (nodeEnv !== 'test') {
    console.warn(`⚠️  Warning: NODE_ENV is "${nodeEnv}" but should be "test"`);
  }

  console.log(`✓ Using test database: ${dbName}`);

  // Create database client
  globalDb = new DatabaseClient();

  // Test database connection
  console.log('Testing database connection...');
  const isConnected = await globalDb.testConnection();
  
  if (!isConnected) {
    throw new Error('Failed to connect to test database. Please ensure PostgreSQL is running.');
  }

  console.log('✓ Database connection successful');

  // Run migrations to ensure schema is up to date
  console.log('Running database migrations...');
  const migrationRunner = new MigrationRunner(globalDb);
  
  try {
    // First, clean up any existing schema
    try {
      await migrationRunner.down();
      console.log('✓ Cleaned up existing schema');
    } catch (error) {
      // Ignore errors if schema doesn't exist
      console.log('No existing schema to clean up');
    }

    // Apply fresh schema
    await migrationRunner.up();
    console.log('✓ Database schema initialized');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    await globalDb.close();
    throw error;
  }

  // Close the setup connection to prevent handle leaks
  await globalDb.close();
  console.log('✓ Setup database connection closed');

  console.log('=== Integration Test Setup Complete ===\n');
}

/**
 * Global teardown - runs once after all tests
 * Note: This is handled by jest.integration.teardown.ts
 */
