import { Pool, PoolConfig, QueryResult } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Database client for PostgreSQL
 */
export class DatabaseClient {
  private pool: Pool;

  constructor(config?: PoolConfig) {
    const defaultConfig: PoolConfig = {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'vexel',
      user: process.env.DATABASE_USER || 'vexel_user',
      password: process.env.DATABASE_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(config || defaultConfig);

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }

  /**
   * Execute a query
   */
  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('Query error:', { text, error });
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT NOW()');
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await this.pool.end();
    console.log('Database connections closed');
  }

  /**
   * Get pool statistics
   */
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

// Export a singleton instance
export const db = new DatabaseClient();
