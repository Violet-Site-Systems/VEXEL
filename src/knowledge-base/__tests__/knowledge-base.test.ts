/**
 * Tests for Knowledge Base Migration to Arweave
 */

import { ArweaveClient } from '../arweave-client';
import { MemoryExtractor } from '../memory-extractor';
import { KnowledgeBaseMigration } from '../migration';
import { DatabaseClient } from '../../database/client';
import { AgentRepository } from '../../database/repository';
import {
  AgentMemory,
  EmotionalMemory,
  RuntimeStatus,
} from '../../types';

// Mock dependencies
jest.mock('arweave');
jest.mock('../../database/client');

describe('ArweaveClient', () => {
  let arweaveClient: ArweaveClient;

  beforeEach(() => {
    arweaveClient = new ArweaveClient();
  });

  describe('initialization', () => {
    it('should initialize Arweave client', () => {
      expect(arweaveClient).toBeDefined();
    });

    it('should allow setting a wallet', async () => {
      const mockWallet = { kty: 'RSA' } as any;
      arweaveClient.setWallet(mockWallet);
      expect(arweaveClient).toBeDefined();
    });
  });

  describe('data operations', () => {
    it('should get transaction URL', () => {
      const txId = 'test-tx-id-123';
      const url = arweaveClient.getTransactionUrl(txId);
      expect(url).toBe('https://arweave.net/test-tx-id-123');
    });
  });
});

describe('MemoryExtractor', () => {
  let memoryExtractor: MemoryExtractor;
  let mockDb: jest.Mocked<DatabaseClient>;
  let mockAgentRepo: jest.Mocked<AgentRepository>;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    mockAgentRepo = {
      getAgentById: jest.fn(),
      getAgentCapabilities: jest.fn(),
    } as any;

    memoryExtractor = new MemoryExtractor(mockDb, mockAgentRepo);
  });

  describe('extractAgentMemories', () => {
    it('should return empty array when table does not exist', async () => {
      mockDb.query.mockRejectedValue(new Error('Table does not exist'));

      const memories = await memoryExtractor.extractAgentMemories('agent-1');
      expect(memories).toEqual([]);
    });

    it('should extract agent memories successfully', async () => {
      const mockMemories: AgentMemory[] = [
        {
          agent_id: 'agent-1',
          memory_type: 'conversation',
          content: { message: 'test' },
          timestamp: new Date(),
        },
      ];

      mockDb.query.mockResolvedValue({ rows: mockMemories } as any);

      const memories = await memoryExtractor.extractAgentMemories('agent-1');
      expect(memories).toEqual(mockMemories);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['agent-1']
      );
    });
  });

  describe('extractEmotionalMemories', () => {
    it('should return empty array when table does not exist', async () => {
      mockDb.query.mockRejectedValue(new Error('Table does not exist'));

      const memories = await memoryExtractor.extractEmotionalMemories('agent-1');
      expect(memories).toEqual([]);
    });

    it('should extract emotional memories successfully', async () => {
      const mockMemories: EmotionalMemory[] = [
        {
          agent_id: 'agent-1',
          emotion_type: 'joy',
          intensity: 0.8,
          context: 'successful task completion',
          timestamp: new Date(),
        },
      ];

      mockDb.query.mockResolvedValue({ rows: mockMemories } as any);

      const memories = await memoryExtractor.extractEmotionalMemories('agent-1');
      expect(memories).toEqual(mockMemories);
    });
  });

  describe('extractKnowledgeBase', () => {
    it('should throw error if agent not found', async () => {
      mockAgentRepo.getAgentById.mockResolvedValue(null);

      await expect(
        memoryExtractor.extractKnowledgeBase('non-existent-agent')
      ).rejects.toThrow('Agent not found');
    });

    it('should extract complete knowledge base', async () => {
      const mockAgent = {
        id: 'agent-1',
        did: 'did:vexel:0x123',
        name: 'Test Agent',
        owner_address: '0x123',
        runtime_status: RuntimeStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
        last_active_at: new Date(),
      };

      mockAgentRepo.getAgentById.mockResolvedValue(mockAgent);
      mockDb.query.mockResolvedValue({ rows: [] } as any);
      mockAgentRepo.getAgentCapabilities.mockResolvedValue([]);

      const knowledgeBase = await memoryExtractor.extractKnowledgeBase('agent-1');

      expect(knowledgeBase).toBeDefined();
      expect(knowledgeBase.agent_id).toBe('agent-1');
      expect(knowledgeBase.agent_did).toBe('did:vexel:0x123');
      expect(knowledgeBase.memories).toEqual([]);
      expect(knowledgeBase.emotional_memories).toEqual([]);
      expect(knowledgeBase.capabilities).toEqual([]);
      expect(knowledgeBase.version).toBe('1.0.0');
    });
  });

  describe('getMemoryStats', () => {
    it('should return correct statistics', async () => {
      const mockMemories: AgentMemory[] = [
        {
          agent_id: 'agent-1',
          memory_type: 'conversation',
          content: { message: 'test' },
          timestamp: new Date('2024-01-01'),
        },
        {
          agent_id: 'agent-1',
          memory_type: 'skill',
          content: { skill: 'coding' },
          timestamp: new Date('2024-01-02'),
        },
      ];

      const mockEmotionalMemories: EmotionalMemory[] = [
        {
          agent_id: 'agent-1',
          emotion_type: 'joy',
          intensity: 0.8,
          context: 'test',
          timestamp: new Date('2024-01-01'),
        },
      ];

      mockDb.query
        .mockResolvedValueOnce({ rows: mockMemories } as any)
        .mockResolvedValueOnce({ rows: mockEmotionalMemories } as any);

      mockAgentRepo.getAgentCapabilities.mockResolvedValue([
        {
          id: '1',
          agent_id: 'agent-1',
          capability_name: 'test',
          capability_value: {},
          version: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      const stats = await memoryExtractor.getMemoryStats('agent-1');

      expect(stats.total_memories).toBe(2);
      expect(stats.emotional_memories).toBe(1);
      expect(stats.capabilities).toBe(1);
      expect(stats.oldest_memory).toBeDefined();
      expect(stats.newest_memory).toBeDefined();
    });
  });
});

describe('KnowledgeBaseMigration', () => {
  let migration: KnowledgeBaseMigration;
  let mockDb: jest.Mocked<DatabaseClient>;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    migration = new KnowledgeBaseMigration(mockDb);
  });

  describe('initialization', () => {
    it('should initialize migration service', () => {
      expect(migration).toBeDefined();
      expect(migration.getMemoryExtractor()).toBeDefined();
      expect(migration.getArweaveClient()).toBeDefined();
    });

    it('should allow setting Arweave wallet', () => {
      const mockWallet = { kty: 'RSA' } as any;
      migration.setArweaveWallet(mockWallet);
      expect(migration).toBeDefined();
    });
  });

  describe('prepareKnowledgeBase', () => {
    it('should filter emotional memories when configured', async () => {
      const mockAgent = {
        id: 'agent-1',
        did: 'did:vexel:0x123',
        name: 'Test Agent',
        owner_address: '0x123',
        runtime_status: RuntimeStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
        last_active_at: new Date(),
      };

      const mockAgentRepo = migration.getMemoryExtractor()['agentRepo'];
      jest.spyOn(mockAgentRepo, 'getAgentById').mockResolvedValue(mockAgent);
      jest.spyOn(mockAgentRepo, 'getAgentCapabilities').mockResolvedValue([]);

      mockDb.query.mockResolvedValue({ rows: [] } as any);

      const knowledgeBase = await migration.prepareKnowledgeBase('agent-1', {
        includeEmotionalMemories: false,
      });

      expect(knowledgeBase.emotional_memories).toEqual([]);
    });

    it('should filter capabilities when configured', async () => {
      const mockAgent = {
        id: 'agent-1',
        did: 'did:vexel:0x123',
        name: 'Test Agent',
        owner_address: '0x123',
        runtime_status: RuntimeStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
        last_active_at: new Date(),
      };

      const mockAgentRepo = migration.getMemoryExtractor()['agentRepo'];
      jest.spyOn(mockAgentRepo, 'getAgentById').mockResolvedValue(mockAgent);
      jest.spyOn(mockAgentRepo, 'getAgentCapabilities').mockResolvedValue([]);

      mockDb.query.mockResolvedValue({ rows: [] } as any);

      const knowledgeBase = await migration.prepareKnowledgeBase('agent-1', {
        includeCapabilities: false,
      });

      expect(knowledgeBase.capabilities).toEqual([]);
    });
  });

  describe('getMigrationHistory', () => {
    it('should return empty array when table does not exist', async () => {
      mockDb.query.mockRejectedValue(new Error('Table does not exist'));

      const history = await migration.getMigrationHistory('agent-1');
      expect(history).toEqual([]);
    });

    it('should return migration history', async () => {
      const mockHistory = [
        {
          agent_id: 'agent-1',
          agent_did: 'did:vexel:0x123',
          migration_type: 'full' as const,
          data_hash: 'hash123',
          arweave_tx_id: 'tx123',
          created_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValue({ rows: mockHistory } as any);

      const history = await migration.getMigrationHistory('agent-1');
      expect(history).toEqual(mockHistory);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['agent-1']
      );
    });
  });
});
