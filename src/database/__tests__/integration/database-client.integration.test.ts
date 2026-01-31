/**
 * Database Client Integration Tests
 * Tests real database operations with PostgreSQL
 */

import { DatabaseClient } from '../../client';
import { TestDataSeeder } from '../../test-seeder';
import { RuntimeStatus } from '../../../types';

describe('DatabaseClient Integration Tests', () => {
  let db: DatabaseClient;
  let seeder: TestDataSeeder;

  beforeAll(() => {
    db = new DatabaseClient();
    seeder = new TestDataSeeder(db);
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await seeder.cleanAll();
  });

  describe('Connection', () => {
    it('should connect to the database', async () => {
      const isConnected = await db.testConnection();
      expect(isConnected).toBe(true);
    });

    it('should execute a simple query', async () => {
      const result = await db.query('SELECT NOW() as current_time');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].current_time).toBeDefined();
    });
  });

  describe('Agent Operations', () => {
    it('should create and retrieve an agent', async () => {
      const agent = await seeder.createTestAgent({
        name: 'Integration Test Agent',
        did: 'did:vexel:integration:test-001'
      });

      expect(agent).toBeDefined();
      expect(agent.name).toBe('Integration Test Agent');
      expect(agent.runtime_status).toBe(RuntimeStatus.ACTIVE);
    });

    it('should clean up test data', async () => {
      await seeder.createTestAgent();
      let count = await seeder.getAgentCount();
      expect(count).toBe(1);

      await seeder.cleanAll();
      count = await seeder.getAgentCount();
      expect(count).toBe(0);
    });
  });

  describe('Transactions', () => {
    it('should commit a successful transaction', async () => {
      await db.transaction(async (client) => {
        await client.query(
          'INSERT INTO agents (did, name, owner_address, runtime_status) VALUES ($1, $2, $3, $4)',
          ['did:vexel:tx:test-001', 'Transaction Test', '0x1234567890123456789012345678901234567890', RuntimeStatus.ACTIVE]
        );
      });

      const count = await seeder.getAgentCount();
      expect(count).toBe(1);
    });

    it('should rollback a failed transaction', async () => {
      try {
        await db.transaction(async (client) => {
          await client.query(
            'INSERT INTO agents (did, name, owner_address, runtime_status) VALUES ($1, $2, $3, $4)',
            ['did:vexel:tx:test-002', 'Transaction Test 2', '0x1234567890123456789012345678901234567890', RuntimeStatus.ACTIVE]
          );
          // Force an error
          throw new Error('Simulated transaction failure');
        });
      } catch (error) {
        expect(error).toBeDefined();
      }

      const count = await seeder.getAgentCount();
      expect(count).toBe(0);
    });
  });
});
