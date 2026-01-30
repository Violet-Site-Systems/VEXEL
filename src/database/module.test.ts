/**
 * Unit tests for Database module
 */
import { DatabaseClient } from './client';
import { AgentRepository } from './repository';

describe('Database Module', () => {
  let testClient: DatabaseClient | null = null;

  afterAll(async () => {
    // Close any test client that was created
    if (testClient) {
      await testClient.close();
      testClient = null;
    }
  });

  describe('DatabaseClient', () => {
    it('should be instantiable', () => {
      const client = new DatabaseClient({
        host: 'localhost',
        port: 5432,
        database: 'test',
        user: 'test',
        password: 'test'
      });
      testClient = client;
      expect(client).toBeInstanceOf(DatabaseClient);
    });

    it('should have required methods', () => {
      const client = new DatabaseClient();
      expect(typeof client.query).toBe('function');
      expect(typeof client.transaction).toBe('function');
      expect(typeof client.testConnection).toBe('function');
      expect(typeof client.close).toBe('function');
      expect(typeof client.getPoolStats).toBe('function');
    });
  });

  describe('AgentRepository', () => {
    it('should be instantiable with DatabaseClient', () => {
      const client = new DatabaseClient();
      testClient = client;
      const repo = new AgentRepository(client);
      expect(repo).toBeInstanceOf(AgentRepository);
    });
  });

  describe('Module Exports', () => {
    it('should export DatabaseClient', () => {
      const { DatabaseClient: ExportedClient } = require('./index');
      expect(ExportedClient).toBeDefined();
    });

    it('should export AgentRepository', () => {
      const { AgentRepository: ExportedRepo } = require('./index');
      expect(ExportedRepo).toBeDefined();
    });

    it('should export MigrationRunner', () => {
      const { MigrationRunner } = require('./index');
      expect(MigrationRunner).toBeDefined();
    });
  });
});
