/**
 * Unit tests for IPFS module
 */
import { IPFSClient } from './client';

describe('IPFS Module', () => {
  describe('IPFSClient', () => {
    it('should be instantiable', () => {
      const client = new IPFSClient();
      expect(client).toBeInstanceOf(IPFSClient);
    });

    it('should have required methods', () => {
      const client = new IPFSClient();
      expect(typeof client.storeMetadata).toBe('function');
      expect(typeof client.retrieveMetadata).toBe('function');
      expect(typeof client.pinMetadata).toBe('function');
      expect(typeof client.unpinMetadata).toBe('function');
      expect(typeof client.testConnection).toBe('function');
    });

    it('should have static computeHash method', () => {
      expect(typeof IPFSClient.computeHash).toBe('function');
    });

    it('should compute hash from metadata', () => {
      const metadata = {
        name: 'Test Agent',
        did: 'did:test:123',
        capabilities: []
      };
      const hash = IPFSClient.computeHash(metadata);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('Module Exports', () => {
    it('should export IPFSClient', () => {
      const { IPFSClient: ExportedClient } = require('./index');
      expect(ExportedClient).toBeDefined();
    });

    it('should export singleton ipfsClient', () => {
      const { ipfsClient } = require('./index');
      expect(ipfsClient).toBeDefined();
      expect(ipfsClient).toBeInstanceOf(IPFSClient);
    });
  });
});
