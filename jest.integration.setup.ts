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
      console.error('Required environment variables:');
      console.error('  - DATABASE_HOST (default: localhost)');
      console.error('  - DATABASE_PORT (default: 5432)');
      console.error('  - DATABASE_NAME (default: vexel)');
      console.error('  - DATABASE_USER (default: vexel_user)');
      console.error('  - DATABASE_PASSWORD (required)');
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
