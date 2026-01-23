/**
 * Unit tests for Knowledge Base module
 */
import { ArweaveClient } from './arweave-client';
import { MemoryExtractor } from './memory-extractor';
import { KnowledgeBaseMigration } from './migration';
import { DatabaseClient } from '../database/client';
import { AgentRepository } from '../database/repository';

describe('Knowledge Base Module', () => {
  describe('ArweaveClient', () => {
    it('should be instantiable', () => {
      const client = new ArweaveClient();
      expect(client).toBeInstanceOf(ArweaveClient);
    });

    it('should have required methods', () => {
      const client = new ArweaveClient();
      expect(typeof client.storeData).toBe('function');
      expect(typeof client.retrieveData).toBe('function');
      expect(typeof client.testConnection).toBe('function');
      expect(typeof client.getBalance).toBe('function');
      expect(typeof client.estimateStorageCost).toBe('function');
    });
  });

  describe('MemoryExtractor', () => {
    it('should be instantiable', () => {
      const db = new DatabaseClient();
      const repo = new AgentRepository(db);
      const extractor = new MemoryExtractor(db, repo);
      expect(extractor).toBeInstanceOf(MemoryExtractor);
    });

    it('should have required methods', () => {
      const db = new DatabaseClient();
      const repo = new AgentRepository(db);
      const extractor = new MemoryExtractor(db, repo);
      expect(typeof extractor.extractAgentMemories).toBe('function');
      expect(typeof extractor.extractEmotionalMemories).toBe('function');
      expect(typeof extractor.extractKnowledgeBase).toBe('function');
      expect(typeof extractor.getMemoryStats).toBe('function');
    });
  });

  describe('KnowledgeBaseMigration', () => {
    it('should be instantiable', () => {
      const db = new DatabaseClient();
      const migration = new KnowledgeBaseMigration(db);
      expect(migration).toBeInstanceOf(KnowledgeBaseMigration);
    });

    it('should have required methods', () => {
      const db = new DatabaseClient();
      const migration = new KnowledgeBaseMigration(db);
      expect(typeof migration.prepareKnowledgeBase).toBe('function');
      expect(typeof migration.migrateToArweave).toBe('function');
      expect(typeof migration.retrieveFromArweave).toBe('function');
      expect(typeof migration.transferCapabilities).toBe('function');
      expect(typeof migration.testConnection).toBe('function');
    });

    it('should provide access to sub-components', () => {
      const db = new DatabaseClient();
      const migration = new KnowledgeBaseMigration(db);
      expect(migration.getMemoryExtractor()).toBeInstanceOf(MemoryExtractor);
      expect(migration.getArweaveClient()).toBeInstanceOf(ArweaveClient);
      expect(migration.getAgentRepository()).toBeInstanceOf(AgentRepository);
    });
  });

  describe('Module Exports', () => {
    it('should export ArweaveClient', () => {
      const { ArweaveClient: ExportedClient } = require('./index');
      expect(ExportedClient).toBeDefined();
    });

    it('should export MemoryExtractor', () => {
      const { MemoryExtractor: ExportedExtractor } = require('./index');
      expect(ExportedExtractor).toBeDefined();
    });

    it('should export KnowledgeBaseMigration', () => {
      const { KnowledgeBaseMigration: ExportedMigration } = require('./index');
      expect(ExportedMigration).toBeDefined();
    });

    it('should export MigrationConfig', () => {
      const exports = require('./index');
      // MigrationConfig is a type, so we just check the module loads
      expect(exports).toBeDefined();
    });
  });
});
