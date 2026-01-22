// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { DatabaseClient } from '../database/client';
import { AgentRepository } from '../database/repository';
import {
  Agent,
  AgentMemory,
  EmotionalMemory,
  KnowledgeBase,
  CapabilityVector,
} from '../types';

/**
 * Service for extracting agent memory for migration
 */
export class MemoryExtractor {
  constructor(
    private db: DatabaseClient,
    private agentRepo: AgentRepository
  ) {}

  /**
   * Extract all memories for an agent
   */
  async extractAgentMemories(agentId: string): Promise<AgentMemory[]> {
    const query = `
      SELECT 
        agent_id,
        memory_type,
        content,
        timestamp,
        metadata
      FROM agent_memories
      WHERE agent_id = $1
      ORDER BY timestamp DESC
    `;

    try {
      const result = await this.db.query<AgentMemory>(query, [agentId]);
      return result.rows;
    } catch (error) {
      // If table doesn't exist, return empty array
      console.warn('Agent memories table not found, returning empty array');
      return [];
    }
  }

  /**
   * Extract emotional memories for an agent
   */
  async extractEmotionalMemories(agentId: string): Promise<EmotionalMemory[]> {
    const query = `
      SELECT 
        agent_id,
        emotion_type,
        intensity,
        context,
        timestamp,
        associated_memories
      FROM emotional_memories
      WHERE agent_id = $1
      ORDER BY timestamp DESC
    `;

    try {
      const result = await this.db.query<EmotionalMemory>(query, [agentId]);
      return result.rows;
    } catch (error) {
      // If table doesn't exist, return empty array
      console.warn('Emotional memories table not found, returning empty array');
      return [];
    }
  }

  /**
   * Extract complete knowledge base for an agent
   */
  async extractKnowledgeBase(agentId: string): Promise<KnowledgeBase> {
    // Get agent information
    const agent = await this.agentRepo.getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Extract all components
    const [memories, emotionalMemories, capabilities] = await Promise.all([
      this.extractAgentMemories(agentId),
      this.extractEmotionalMemories(agentId),
      this.agentRepo.getAgentCapabilities(agentId),
    ]);

    return {
      agent_id: agentId,
      agent_did: agent.did,
      memories,
      emotional_memories: emotionalMemories,
      capabilities,
      extracted_at: new Date(),
      version: '1.0.0',
    };
  }

  /**
   * Store agent memory (for testing/demo purposes)
   */
  async storeAgentMemory(memory: Omit<AgentMemory, 'timestamp'>): Promise<void> {
    const query = `
      INSERT INTO agent_memories (agent_id, memory_type, content, metadata, timestamp)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT DO NOTHING
    `;

    try {
      await this.db.query(query, [
        memory.agent_id,
        memory.memory_type,
        JSON.stringify(memory.content),
        memory.metadata ? JSON.stringify(memory.metadata) : null,
      ]);
    } catch (error) {
      console.warn('Failed to store agent memory, table may not exist:', error);
    }
  }

  /**
   * Store emotional memory (for testing/demo purposes)
   */
  async storeEmotionalMemory(
    memory: Omit<EmotionalMemory, 'timestamp'>
  ): Promise<void> {
    const query = `
      INSERT INTO emotional_memories (
        agent_id, 
        emotion_type, 
        intensity, 
        context, 
        associated_memories,
        timestamp
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT DO NOTHING
    `;

    try {
      await this.db.query(query, [
        memory.agent_id,
        memory.emotion_type,
        memory.intensity,
        memory.context,
        memory.associated_memories ? JSON.stringify(memory.associated_memories) : null,
      ]);
    } catch (error) {
      console.warn('Failed to store emotional memory, table may not exist:', error);
    }
  }

  /**
   * Get memory statistics for an agent
   */
  async getMemoryStats(agentId: string): Promise<{
    total_memories: number;
    emotional_memories: number;
    capabilities: number;
    oldest_memory?: Date;
    newest_memory?: Date;
  }> {
    const [memories, emotionalMemories, capabilities] = await Promise.all([
      this.extractAgentMemories(agentId),
      this.extractEmotionalMemories(agentId),
      this.agentRepo.getAgentCapabilities(agentId),
    ]);

    const allTimestamps = memories
      .map((m) => m.timestamp)
      .concat(emotionalMemories.map((em) => em.timestamp))
      .filter(Boolean);

    return {
      total_memories: memories.length,
      emotional_memories: emotionalMemories.length,
      capabilities: capabilities.length,
      oldest_memory: allTimestamps.length > 0 ? new Date(Math.min(...allTimestamps.map(d => d.getTime()))) : undefined,
      newest_memory: allTimestamps.length > 0 ? new Date(Math.max(...allTimestamps.map(d => d.getTime()))) : undefined,
    };
  }
}
