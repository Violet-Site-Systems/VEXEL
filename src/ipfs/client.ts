import { create, KuboRPCClient } from 'kubo-rpc-client';
import { createHash } from 'crypto';
import * as dotenv from 'dotenv';
import { AgentMetadata } from '../types';

dotenv.config();

/**
 * IPFS client for storing and retrieving agent metadata
 */
export class IPFSClient {
  private client: KuboRPCClient;

  constructor() {
    const host = process.env.IPFS_HOST || '127.0.0.1';
    const port = parseInt(process.env.IPFS_PORT || '5001');
    const protocol = process.env.IPFS_PROTOCOL || 'http';

    this.client = create({
      host,
      port,
      protocol: protocol as 'http' | 'https',
    });
  }

  /**
   * Store agent metadata on IPFS and return the hash
   */
  async storeMetadata(metadata: AgentMetadata): Promise<string> {
    try {
      const jsonString = JSON.stringify(metadata, null, 2);
      const { cid } = await this.client.add(jsonString);
      const hash = cid.toString();
      console.log('Stored metadata on IPFS:', hash);
      return hash;
    } catch (error) {
      console.error('Error storing metadata on IPFS:', error);
      throw new Error(`Failed to store metadata on IPFS: ${error}`);
    }
  }

  /**
   * Retrieve agent metadata from IPFS by hash
   */
  async retrieveMetadata(hash: string): Promise<AgentMetadata> {
    try {
      const chunks: Uint8Array[] = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const jsonString = buffer.toString('utf-8');
      const metadata = JSON.parse(jsonString) as AgentMetadata;

      console.log('Retrieved metadata from IPFS:', hash);
      return metadata;
    } catch (error) {
      console.error('Error retrieving metadata from IPFS:', error);
      throw new Error(`Failed to retrieve metadata from IPFS: ${error}`);
    }
  }

  /**
   * Pin content on IPFS to prevent garbage collection
   */
  async pinMetadata(hash: string): Promise<void> {
    try {
      await this.client.pin.add(hash);
      console.log('Pinned metadata on IPFS:', hash);
    } catch (error) {
      console.error('Error pinning metadata on IPFS:', error);
      throw new Error(`Failed to pin metadata on IPFS: ${error}`);
    }
  }

  /**
   * Unpin content from IPFS
   */
  async unpinMetadata(hash: string): Promise<void> {
    try {
      await this.client.pin.rm(hash);
      console.log('Unpinned metadata from IPFS:', hash);
    } catch (error) {
      console.error('Error unpinning metadata from IPFS:', error);
      throw new Error(`Failed to unpin metadata from IPFS: ${error}`);
    }
  }

  /**
   * Test IPFS connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const version = await this.client.version();
      console.log('IPFS connection successful, version:', version.version);
      return true;
    } catch (error) {
      console.error('IPFS connection failed:', error);
      return false;
    }
  }

  /**
   * Create a hash from metadata without storing it
   * Useful for verification purposes
   */
  static computeHash(metadata: AgentMetadata): string {
    const jsonString = JSON.stringify(metadata);
    const hash = createHash('sha256').update(jsonString).digest('hex');
    return hash;
  }
}

// Export a singleton instance
export const ipfsClient = new IPFSClient();
