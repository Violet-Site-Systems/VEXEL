/**
 * Test Data Seeder
 * Utilities for creating and cleaning test data in integration tests
 */

import { DatabaseClient } from './client';
import { RuntimeStatus, Agent, CapabilityVector } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface TestAgentOptions {
  name?: string;
  did?: string;
  description?: string;
  owner_address?: string;
  runtime_status?: RuntimeStatus;
}

export class TestDataSeeder {
  constructor(private db: DatabaseClient) {}

  /**
   * Create a test agent with default or custom properties
   */
  async createTestAgent(options: TestAgentOptions = {}): Promise<Agent> {
    const defaultAgent = {
      did: `did:vexel:test:${uuidv4()}`,
      name: `Test Agent ${Date.now()}`,
      description: 'Test agent created by seeder',
      owner_address: '0x' + '1'.repeat(40),
      runtime_status: RuntimeStatus.ACTIVE,
    };

    const agent = { ...defaultAgent, ...options };

    const result = await this.db.query(
      `INSERT INTO agents (did, name, description, owner_address, runtime_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [agent.did, agent.name, agent.description, agent.owner_address, agent.runtime_status]
    );

    return result.rows[0];
  }

  /**
   * Create multiple test agents
   */
  async createTestAgents(count: number, options: TestAgentOptions = {}): Promise<Agent[]> {
    const agents: Agent[] = [];
    for (let i = 0; i < count; i++) {
      const agent = await this.createTestAgent({
        ...options,
        name: options.name ? `${options.name} ${i + 1}` : undefined,
      });
      agents.push(agent);
    }
    return agents;
  }

  /**
   * Clean all test data from agents table
   * Wraps all delete operations in a transaction for atomicity
   */
  async cleanAll(): Promise<void> {
    await this.db.transaction(async (client) => {
      // Delete in correct order due to foreign key constraints
      await client.query('DELETE FROM agent_status_history');
      await client.query('DELETE FROM capability_vectors');
      await client.query('DELETE FROM ipfs_metadata');
      await client.query('DELETE FROM agents');
    });
  }

  /**
   * Clean specific agent by ID
   */
  async cleanAgent(agentId: string): Promise<void> {
    await this.db.query('DELETE FROM agents WHERE id = $1', [agentId]);
  }

  /**
   * Clean specific agent by DID
   */
  async cleanAgentByDid(did: string): Promise<void> {
    await this.db.query('DELETE FROM agents WHERE did = $1', [did]);
  }

  /**
   * Get count of agents in database
   */
  async getAgentCount(): Promise<number> {
    const result = await this.db.query('SELECT COUNT(*) as count FROM agents');
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get agent by DID
   */
  async getAgentByDid(did: string): Promise<Agent | null> {
    const result = await this.db.query('SELECT * FROM agents WHERE did = $1', [did]);
    return result.rows[0] || null;
  }

  /**
   * Create a test capability vector for an agent
   */
  async createTestCapability(agentId: string, name: string, value: Record<string, any> = {}): Promise<CapabilityVector> {
    const result = await this.db.query(
      `INSERT INTO capability_vectors (agent_id, capability_name, capability_value, version)
       VALUES ($1, $2, $3, 1)
       RETURNING *`,
      [agentId, name, JSON.stringify(value)]
    );
    return result.rows[0];
  }
}
