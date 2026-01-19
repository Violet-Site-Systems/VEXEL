import { DatabaseClient } from './client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Database migration runner
 */
export class MigrationRunner {
  constructor(private db: DatabaseClient) {}

  /**
   * Run migrations (up)
   */
  async up(): Promise<void> {
    console.log('Running database migrations...');
    
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    try {
      await this.db.query(schema);
      console.log('✓ Migrations completed successfully');
    } catch (error) {
      console.error('✗ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Rollback migrations (down)
   */
  async down(): Promise<void> {
    console.log('Rolling back database migrations...');
    
    const rollbackPath = path.join(__dirname, '../../database/rollback.sql');
    const rollback = fs.readFileSync(rollbackPath, 'utf-8');

    try {
      await this.db.query(rollback);
      console.log('✓ Rollback completed successfully');
    } catch (error) {
      console.error('✗ Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Check if database is accessible
   */
  async checkConnection(): Promise<boolean> {
    return this.db.testConnection();
  }
}

// CLI runner
async function main() {
  const db = new DatabaseClient();
  const runner = new MigrationRunner(db);

  const command = process.argv[2] || 'up';

  try {
    const isConnected = await runner.checkConnection();
    if (!isConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    if (command === 'down') {
      await runner.down();
    } else {
      await runner.up();
    }

    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    await db.close();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default MigrationRunner;
