/**
 * Global setup for integration tests
 * Runs once before all integration tests
 */

import { DatabaseClient } from './src/database/client';

export default async function globalSetup() {
  console.log('\n🔧 Setting up integration test environment...\n');

  try {
    // Test database connection
    const db = new DatabaseClient();
    const isConnected = await db.testConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to the database');
      console.error('Make sure PostgreSQL is running and DATABASE_* environment variables are set');
      throw new Error('Database connection failed');
    }

    console.log('✅ Database connection verified');
    await db.close();

    console.log('\n✅ Integration test environment ready\n');
  } catch (error) {
    console.error('❌ Failed to setup integration test environment:', error);
    throw error;
  }
}
