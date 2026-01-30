/**
 * Test Data Seeding Utility
 * Provides helper functions to seed test data for integration tests
 */

import { DatabaseClient } from './client';
import { RuntimeStatus } from '../types';

export interface TestAgent {
  id?: string;
  did: string;
  name: string;
  description?: string;
  owner_address: string;
  runtime_status?: RuntimeStatus;
  ipfs_metadata_hash?: string;
}

export interface TestCapability {
  agent_id: string;
  capability_name: string;
  capability_value: Record<string, any>;
  version?: number;
}

/**
 * Test data seeding helpers
 */
export class TestDataSeeder {
  constructor(private db: DatabaseClient) {}

  /**
   * Clean all test data from the database
   * Uses TRUNCATE CASCADE for efficient cleanup
   */
  async cleanAll(): Promise<void> {
    // Use TRUNCATE with CASCADE to efficiently clear agents and all dependent tables
    await this.db.query('TRUNCATE TABLE agents RESTART IDENTITY CASCADE');
  }

  /**
   * Seed test agents
   */
  async seedAgents(agents: TestAgent[]): Promise<any[]> {
    const results = [];
    
    for (const agent of agents) {
      const result = await this.db.query(
        `INSERT INTO agents (did, name, description, owner_address, runtime_status, ipfs_metadata_hash)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          agent.did,
          agent.name,
          agent.description || null,
          agent.owner_address,
          agent.runtime_status || RuntimeStatus.ACTIVE,
          agent.ipfs_metadata_hash || null,
        ]
      );
      
      results.push(result.rows[0]);
    }
    
    return results;
  }

  /**
   * Seed test capabilities
   */
  async seedCapabilities(capabilities: TestCapability[]): Promise<any[]> {
    const results = [];
    
    for (const capability of capabilities) {
      const result = await this.db.query(
        `INSERT INTO capability_vectors (agent_id, capability_name, capability_value, version)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          capability.agent_id,
          capability.capability_name,
          JSON.stringify(capability.capability_value),
          capability.version || 1,
        ]
      );
      
      results.push(result.rows[0]);
    }
    
    return results;
  }

  /**
   * Create a test agent with default values
   */
  async createTestAgent(overrides?: Partial<TestAgent>): Promise<any> {
    // Generate unique DID with timestamp and random string to prevent collisions
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    const defaultAgent: TestAgent = {
      did: `did:vexel:test:${uniqueId}`,
      name: 'Test Agent',
      description: 'A test agent for integration testing',
      owner_address: '0x1234567890123456789012345678901234567890',
      runtime_status: RuntimeStatus.ACTIVE,
      ...overrides,
    };

    const agents = await this.seedAgents([defaultAgent]);
    return agents[0];
  }

  /**
   * Get count of agents in database
   */
  async getAgentCount(): Promise<number> {
    const result = await this.db.query('SELECT COUNT(*) as count FROM agents');
    return parseInt(result.rows[0].count);
  }

  /**
   * Get count of capabilities in database
   */
  async getCapabilityCount(): Promise<number> {
    const result = await this.db.query('SELECT COUNT(*) as count FROM capability_vectors');
    return parseInt(result.rows[0].count);
  }
}

/**
 * Create a test database client with seeder
 */
export function createTestDatabase(): { db: DatabaseClient; seeder: TestDataSeeder } {
  const db = new DatabaseClient();
  const seeder = new TestDataSeeder(db);
  return { db, seeder };
}
