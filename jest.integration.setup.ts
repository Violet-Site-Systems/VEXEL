/**
 * Jest Integration Test Setup
 * Handles database initialization and cleanup for integration tests
 */

import { DatabaseClient } from './src/database/client';
import { MigrationRunner } from './src/database/migrate';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Global database client for setup/teardown
let globalDb: DatabaseClient;

/**
 * Global setup - runs once before all tests
 */
export default async function setup() {
  console.log('=== Integration Test Setup ===');
  
  // Ensure we're using test database
  const dbName = process.env.DATABASE_NAME;
  if (!dbName?.includes('test')) {
    console.warn(`⚠️  Warning: DATABASE_NAME is "${dbName}" - should include "test"`);
  }

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
    throw error;
  }

  console.log('=== Integration Test Setup Complete ===\n');
}

/**
 * Global teardown - runs once after all tests
 * Note: This is handled by jest.integration.teardown.ts
 */
