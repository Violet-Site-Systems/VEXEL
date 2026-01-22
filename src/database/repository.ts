// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { DatabaseClient } from './client';
import {
  Agent,
  CreateAgentInput,
  UpdateAgentInput,
  RuntimeStatus,
  CapabilityVector,
  CreateCapabilityInput,
  UpdateCapabilityInput,
  AgentStatusHistory,
} from '../types';

/**
 * Repository for agent-related database operations
 */
export class AgentRepository {
  constructor(private db: DatabaseClient) {}

  /**
   * Create a new agent
   */
  async createAgent(input: CreateAgentInput): Promise<Agent> {
    const query = `
      INSERT INTO agents (did, name, description, owner_address, ipfs_metadata_hash, runtime_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      input.did,
      input.name,
      input.description || null,
      input.owner_address,
      input.ipfs_metadata_hash || null,
      input.runtime_status || RuntimeStatus.ACTIVE,
    ];

    const result = await this.db.query<Agent>(query, values);
    return result.rows[0];
  }

  /**
   * Get agent by ID
   */
  async getAgentById(id: string): Promise<Agent | null> {
    const query = 'SELECT * FROM agents WHERE id = $1';
    const result = await this.db.query<Agent>(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get agent by DID
   */
  async getAgentByDid(did: string): Promise<Agent | null> {
    const query = 'SELECT * FROM agents WHERE did = $1';
    const result = await this.db.query<Agent>(query, [did]);
    return result.rows[0] || null;
  }

  /**
   * Get all agents by owner address
   */
  async getAgentsByOwner(ownerAddress: string): Promise<Agent[]> {
    const query = 'SELECT * FROM agents WHERE owner_address = $1 ORDER BY created_at DESC';
    const result = await this.db.query<Agent>(query, [ownerAddress]);
    return result.rows;
  }

  /**
   * Get agents by status
   */
  async getAgentsByStatus(status: RuntimeStatus): Promise<Agent[]> {
    const query = 'SELECT * FROM agents WHERE runtime_status = $1 ORDER BY created_at DESC';
    const result = await this.db.query<Agent>(query, [status]);
    return result.rows;
  }

  /**
   * Update agent
   */
  async updateAgent(id: string, input: UpdateAgentInput): Promise<Agent | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(input.name);
    }
    if (input.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(input.description);
    }
    if (input.ipfs_metadata_hash !== undefined) {
      fields.push(`ipfs_metadata_hash = $${paramCount++}`);
      values.push(input.ipfs_metadata_hash);
    }
    if (input.runtime_status !== undefined) {
      fields.push(`runtime_status = $${paramCount++}`);
      values.push(input.runtime_status);
    }

    if (fields.length === 0) {
      return this.getAgentById(id);
    }

    values.push(id);
    const query = `
      UPDATE agents 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query<Agent>(query, values);
    return result.rows[0] || null;
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(
    id: string,
    status: RuntimeStatus,
    reason?: string
  ): Promise<Agent | null> {
    return this.updateAgent(id, { runtime_status: status });
  }

  /**
   * Delete agent
   */
  async deleteAgent(id: string): Promise<boolean> {
    const query = 'DELETE FROM agents WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Get agent status history
   */
  async getAgentStatusHistory(agentId: string): Promise<AgentStatusHistory[]> {
    const query = `
      SELECT * FROM agent_status_history 
      WHERE agent_id = $1 
      ORDER BY changed_at DESC
    `;
    const result = await this.db.query<AgentStatusHistory>(query, [agentId]);
    return result.rows;
  }

  /**
   * Create capability for agent
   */
  async createCapability(input: CreateCapabilityInput): Promise<CapabilityVector> {
    const query = `
      INSERT INTO capability_vectors (agent_id, capability_name, capability_value)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [input.agent_id, input.capability_name, JSON.stringify(input.capability_value)];

    const result = await this.db.query<CapabilityVector>(query, values);
    return result.rows[0];
  }

  /**
   * Get capabilities for agent
   */
  async getAgentCapabilities(agentId: string): Promise<CapabilityVector[]> {
    const query = 'SELECT * FROM capability_vectors WHERE agent_id = $1 ORDER BY capability_name';
    const result = await this.db.query<CapabilityVector>(query, [agentId]);
    return result.rows;
  }

  /**
   * Get specific capability for agent
   */
  async getAgentCapability(
    agentId: string,
    capabilityName: string
  ): Promise<CapabilityVector | null> {
    const query = `
      SELECT * FROM capability_vectors 
      WHERE agent_id = $1 AND capability_name = $2
    `;
    const result = await this.db.query<CapabilityVector>(query, [agentId, capabilityName]);
    return result.rows[0] || null;
  }

  /**
   * Update capability
   */
  async updateCapability(
    agentId: string,
    capabilityName: string,
    input: UpdateCapabilityInput
  ): Promise<CapabilityVector | null> {
    const query = `
      UPDATE capability_vectors 
      SET capability_value = $3, version = version + 1
      WHERE agent_id = $1 AND capability_name = $2
      RETURNING *
    `;
    const values = [agentId, capabilityName, JSON.stringify(input.capability_value)];

    const result = await this.db.query<CapabilityVector>(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete capability
   */
  async deleteCapability(agentId: string, capabilityName: string): Promise<boolean> {
    const query = 'DELETE FROM capability_vectors WHERE agent_id = $1 AND capability_name = $2';
    const result = await this.db.query(query, [agentId, capabilityName]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Get active agents count
   */
  async getActiveAgentsCount(): Promise<number> {
    const query = "SELECT COUNT(*) as count FROM agents WHERE runtime_status = 'ACTIVE'";
    const result = await this.db.query<{ count: string }>(query);
    return parseInt(result.rows[0]?.count || '0');
  }

  /**
   * Get all agents with pagination
   */
  async getAllAgents(limit: number = 50, offset: number = 0): Promise<Agent[]> {
    const query = `
      SELECT * FROM agents 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await this.db.query<Agent>(query, [limit, offset]);
    return result.rows;
  }
}
