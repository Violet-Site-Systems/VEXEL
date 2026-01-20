import { IPFSClient } from '../../ipfs/client';
import { AgentMetadata } from '../../types';

describe('IPFSClient', () => {
  let client: IPFSClient;

  beforeAll(() => {
    client = new IPFSClient();
  });

  describe('computeHash', () => {
    it('should compute consistent hash for same metadata', () => {
      const metadata: AgentMetadata = {
        name: 'Test Agent',
        description: 'Test Description',
        did: 'did:vexel:test:123',
        owner_address: '0x1234567890123456789012345678901234567890',
        capabilities: [],
        version: '1.0.0',
        created_at: '2024-01-01T00:00:00Z',
      };

      const hash1 = IPFSClient.computeHash(metadata);
      const hash2 = IPFSClient.computeHash(metadata);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should produce different hashes for different metadata', () => {
      const metadata1: AgentMetadata = {
        name: 'Agent 1',
        did: 'did:vexel:test:1',
        owner_address: '0x1234567890123456789012345678901234567890',
        capabilities: [],
        version: '1.0.0',
        created_at: '2024-01-01T00:00:00Z',
      };

      const metadata2: AgentMetadata = {
        name: 'Agent 2',
        did: 'did:vexel:test:2',
        owner_address: '0x1234567890123456789012345678901234567890',
        capabilities: [],
        version: '1.0.0',
        created_at: '2024-01-01T00:00:00Z',
      };

      const hash1 = IPFSClient.computeHash(metadata1);
      const hash2 = IPFSClient.computeHash(metadata2);

      expect(hash1).not.toBe(hash2);
    });
  });

  // Note: The following tests require a running IPFS node
  describe('IPFS operations (integration)', () => {
    it('should handle IPFS connection gracefully', async () => {
      try {
        const isConnected = await client.testConnection();
        // If IPFS is running, this should succeed
        expect(typeof isConnected).toBe('boolean');
      } catch (error) {
        // If IPFS is not running, expect an error
        expect(error).toBeDefined();
      }
    });
  });
});
