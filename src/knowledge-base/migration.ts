// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { ArweaveClient } from './arweave-client';
import { MemoryExtractor } from './memory-extractor';
import { DatabaseClient } from '../database/client';
import { AgentRepository } from '../database/repository';
import {
  KnowledgeBase,
  ArweaveMigrationResult,
  MigrationMetadata,
} from '../types';
import { JWKInterface } from 'arweave/node/lib/wallet';

/**
 * Estimated compression ratio for gzip compression
 * Typically achieves 70% reduction in size
 */
const ESTIMATED_COMPRESSION_RATIO = 0.3;

export interface MigrationConfig {
  arweaveWallet?: JWKInterface;
  compressionEnabled?: boolean;
  includeEmotionalMemories?: boolean;
  includeCapabilities?: boolean;
}

/**
 * Service for migrating agent knowledge bases to Arweave
 */
export class KnowledgeBaseMigration {
  private arweaveClient: ArweaveClient;
  private memoryExtractor: MemoryExtractor;
  private db: DatabaseClient;
  private agentRepo: AgentRepository;

  constructor(db: DatabaseClient, config?: MigrationConfig) {
    this.db = db;
    this.agentRepo = new AgentRepository(db);
    this.memoryExtractor = new MemoryExtractor(db, this.agentRepo);
    this.arweaveClient = new ArweaveClient(config?.arweaveWallet);
  }

  /**
   * Set Arweave wallet for transactions
   */
  setArweaveWallet(wallet: JWKInterface): void {
    this.arweaveClient.setWallet(wallet);
  }

  /**
   * Generate a new Arweave wallet
   */
  async generateArweaveWallet(): Promise<JWKInterface> {
    return await this.arweaveClient.generateWallet();
  }

  /**
   * Get memory extractor instance
   */
  getMemoryExtractor(): MemoryExtractor {
    return this.memoryExtractor;
  }

  /**
   * Get Arweave client instance
   */
  getArweaveClient(): ArweaveClient {
    return this.arweaveClient;
  }

  /**
   * Get agent repository instance (for testing)
   */
  getAgentRepository(): AgentRepository {
    return this.agentRepo;
  }

  /**
   * Extract and prepare knowledge base for migration
   */
  async prepareKnowledgeBase(
    agentId: string,
    config?: MigrationConfig
  ): Promise<KnowledgeBase> {
    const knowledgeBase = await this.memoryExtractor.extractKnowledgeBase(agentId);

    // Filter based on configuration
    if (config?.includeEmotionalMemories === false) {
      knowledgeBase.emotional_memories = [];
    }

    if (config?.includeCapabilities === false) {
      knowledgeBase.capabilities = [];
    }

    return knowledgeBase;
  }

  /**
   * Migrate agent knowledge base to Arweave
   */
  async migrateToArweave(
    agentId: string,
    config?: MigrationConfig
  ): Promise<ArweaveMigrationResult> {
    // Get agent information
    const agent = await this.agentRepo.getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Extract knowledge base
    console.log(`Extracting knowledge base for agent: ${agentId}`);
    const knowledgeBase = await this.prepareKnowledgeBase(agentId, config);

    // Get memory statistics
    const stats = await this.memoryExtractor.getMemoryStats(agentId);
    console.log('Memory statistics:', stats);

    // Prepare tags for Arweave
    const tags = [
      { name: 'Agent-ID', value: agentId },
      { name: 'Agent-DID', value: agent.did },
      { name: 'Migration-Type', value: 'full' },
      { name: 'Migration-Date', value: new Date().toISOString() },
      { name: 'Total-Memories', value: stats.total_memories.toString() },
      { name: 'Emotional-Memories', value: stats.emotional_memories.toString() },
      { name: 'Capabilities', value: stats.capabilities.toString() },
    ];

    // Store on Arweave with compression
    const compressionEnabled = config?.compressionEnabled !== false;
    console.log(`Storing knowledge base on Arweave (compression: ${compressionEnabled})...`);
    const result = await this.arweaveClient.storeData(
      knowledgeBase,
      tags,
      compressionEnabled
    );

    // Estimate cost
    const costEstimate = await this.arweaveClient.estimateStorageCost(
      result.compressedSize
    );

    const migrationResult: ArweaveMigrationResult = {
      transaction_id: result.txId,
      arweave_url: this.arweaveClient.getTransactionUrl(result.txId),
      agent_id: agentId,
      data_size: result.dataSize,
      compressed_size: result.compressedSize,
      timestamp: new Date(),
      cost_estimate: `${costEstimate} AR`,
    };

    // Store migration metadata in database
    await this.storeMigrationMetadata({
      agent_id: agentId,
      agent_did: agent.did,
      migration_type: 'full',
      data_hash: result.dataHash,
      arweave_tx_id: result.txId,
      created_at: new Date(),
    });

    console.log('Migration completed successfully!');
    console.log('Transaction ID:', result.txId);
    console.log('Arweave URL:', migrationResult.arweave_url);
    console.log('Cost estimate:', migrationResult.cost_estimate);

    return migrationResult;
  }

  /**
   * Retrieve knowledge base from Arweave
   */
  async retrieveFromArweave(transactionId: string): Promise<KnowledgeBase> {
    console.log(`Retrieving knowledge base from Arweave: ${transactionId}`);
    const data = await this.arweaveClient.retrieveData(transactionId);
    return data as KnowledgeBase;
  }

  /**
   * Transfer capabilities from one agent to another using Arweave backup
   */
  async transferCapabilities(
    sourceTransactionId: string,
    targetAgentId: string
  ): Promise<void> {
    console.log('Starting capability transfer...');

    // Retrieve source knowledge base
    const sourceKnowledgeBase = await this.retrieveFromArweave(sourceTransactionId);

    // Verify target agent exists
    const targetAgent = await this.agentRepo.getAgentById(targetAgentId);
    if (!targetAgent) {
      throw new Error(`Target agent not found: ${targetAgentId}`);
    }

    // Transfer capabilities
    console.log(`Transferring ${sourceKnowledgeBase.capabilities.length} capabilities...`);
    for (const capability of sourceKnowledgeBase.capabilities) {
      // Check if capability already exists
      const existing = await this.agentRepo.getAgentCapability(
        targetAgentId,
        capability.capability_name
      );

      if (existing) {
        // Update existing capability
        await this.agentRepo.updateCapability(targetAgentId, capability.capability_name, {
          capability_value: capability.capability_value,
        });
        console.log(`Updated capability: ${capability.capability_name}`);
      } else {
        // Create new capability
        await this.agentRepo.createCapability({
          agent_id: targetAgentId,
          capability_name: capability.capability_name,
          capability_value: capability.capability_value,
        });
        console.log(`Created capability: ${capability.capability_name}`);
      }
    }

    console.log('Capability transfer completed successfully!');
  }

  /**
   * Store migration metadata
   */
  private async storeMigrationMetadata(metadata: MigrationMetadata): Promise<void> {
    const query = `
      INSERT INTO arweave_migrations (
        agent_id,
        agent_did,
        migration_type,
        data_hash,
        arweave_tx_id,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (agent_id, arweave_tx_id) 
      DO UPDATE SET 
        data_hash = EXCLUDED.data_hash,
        created_at = EXCLUDED.created_at
    `;

    try {
      await this.db.query(query, [
        metadata.agent_id,
        metadata.agent_did,
        metadata.migration_type,
        metadata.data_hash,
        metadata.arweave_tx_id,
        metadata.created_at,
      ]);
      console.log('Migration metadata stored in database');
    } catch (error) {
      console.warn('Failed to store migration metadata, table may not exist:', error);
    }
  }

  /**
   * Get migration history for an agent
   */
  async getMigrationHistory(agentId: string): Promise<MigrationMetadata[]> {
    const query = `
      SELECT * FROM arweave_migrations
      WHERE agent_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await this.db.query<MigrationMetadata>(query, [agentId]);
      return result.rows;
    } catch (error) {
      console.warn('Failed to get migration history, table may not exist');
      return [];
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txId: string): Promise<{
    confirmed: boolean;
    confirmations?: number;
    blockHeight?: number;
  }> {
    return await this.arweaveClient.getTransactionStatus(txId);
  }

  /**
   * Test Arweave connection
   */
  async testConnection(): Promise<boolean> {
    return await this.arweaveClient.testConnection();
  }

  /**
   * Get Arweave wallet balance
   */
  async getWalletBalance(address?: string): Promise<string> {
    return await this.arweaveClient.getBalance(address);
  }

  /**
   * Estimate migration cost
   */
  async estimateMigrationCost(agentId: string): Promise<string> {
    const knowledgeBase = await this.prepareKnowledgeBase(agentId);
    const jsonString = JSON.stringify(knowledgeBase);
    const dataSize = Buffer.byteLength(jsonString, 'utf-8');

    // Estimate with compression
    const compressedSize = Math.floor(dataSize * ESTIMATED_COMPRESSION_RATIO);

    return await this.arweaveClient.estimateStorageCost(compressedSize);
  }
}
