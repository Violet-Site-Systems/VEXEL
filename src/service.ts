// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { DatabaseClient } from './database/client';
import { AgentRepository } from './database/repository';
import { IPFSClient } from './ipfs/client';
import { AgentMetadata, CreateAgentInput, RuntimeStatus } from './types';

/**
 * Service layer for managing agents with IPFS integration
 */
export class AgentService {
  private repository: AgentRepository;
  private ipfsClient: IPFSClient;

  constructor(db: DatabaseClient, ipfs: IPFSClient) {
    this.repository = new AgentRepository(db);
    this.ipfsClient = ipfs;
  }

  /**
   * Create a new agent with metadata stored on IPFS
   */
  async createAgent(input: CreateAgentInput): Promise<any> {
    // Create metadata object
    const metadata: AgentMetadata = {
      name: input.name,
      description: input.description || '',
      did: input.did,
      owner_address: input.owner_address,
      capabilities: [],
      version: '1.0.0',
      created_at: new Date().toISOString(),
    };

    // Store metadata on IPFS
    const ipfsHash = await this.ipfsClient.storeMetadata(metadata);

    // Store agent in database with IPFS hash
    const agent = await this.repository.createAgent({
      ...input,
      ipfs_metadata_hash: ipfsHash,
    });

    return {
      agent,
      ipfsHash,
    };
  }

  /**
   * Get agent with metadata from IPFS
   */
  async getAgentWithMetadata(agentId: string) {
    const agent = await this.repository.getAgentById(agentId);
    if (!agent) {
      return null;
    }

    let metadata: AgentMetadata | null = null;
    if (agent.ipfs_metadata_hash) {
      try {
        metadata = await this.ipfsClient.retrieveMetadata(agent.ipfs_metadata_hash);
      } catch (error) {
        console.error('Failed to retrieve metadata from IPFS:', error);
      }
    }

    return {
      agent,
      metadata,
    };
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentId: string, status: RuntimeStatus, reason?: string) {
    return this.repository.updateAgentStatus(agentId, status, reason);
  }

  /**
   * Get agent capabilities
   */
  async getAgentCapabilities(agentId: string) {
    return this.repository.getAgentCapabilities(agentId);
  }

  /**
   * Add capability to agent
   */
  async addCapability(agentId: string, capabilityName: string, capabilityValue: Record<string, any>) {
    return this.repository.createCapability({
      agent_id: agentId,
      capability_name: capabilityName,
      capability_value: capabilityValue,
    });
  }

  /**
   * Get agent status history
   */
  async getAgentStatusHistory(agentId: string) {
    return this.repository.getAgentStatusHistory(agentId);
  }
}
