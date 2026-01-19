/**
 * Type definitions for VEXEL agent system
 */

export enum RuntimeStatus {
  ACTIVE = 'ACTIVE',
  SLEEP = 'SLEEP',
  TERMINATED = 'TERMINATED',
}

export interface Agent {
  id: string;
  did: string;
  name: string;
  description?: string;
  owner_address: string;
  ipfs_metadata_hash?: string;
  created_at: Date;
  updated_at: Date;
  runtime_status: RuntimeStatus;
  last_active_at: Date;
}

export interface CreateAgentInput {
  did: string;
  name: string;
  description?: string;
  owner_address: string;
  ipfs_metadata_hash?: string;
  runtime_status?: RuntimeStatus;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  ipfs_metadata_hash?: string;
  runtime_status?: RuntimeStatus;
}

export interface CapabilityVector {
  id: string;
  agent_id: string;
  capability_name: string;
  capability_value: Record<string, any>;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCapabilityInput {
  agent_id: string;
  capability_name: string;
  capability_value: Record<string, any>;
}

export interface UpdateCapabilityInput {
  capability_value: Record<string, any>;
}

export interface AgentStatusHistory {
  id: string;
  agent_id: string;
  previous_status?: RuntimeStatus;
  new_status: RuntimeStatus;
  changed_at: Date;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface IPFSMetadata {
  id: string;
  agent_id: string;
  ipfs_hash: string;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface AgentMetadata {
  name: string;
  description?: string;
  did: string;
  owner_address: string;
  capabilities: Array<{
    name: string;
    value: Record<string, any>;
  }>;
  version: string;
  created_at: string;
}

/**
 * Knowledge base and memory types for Arweave migration
 */

export interface AgentMemory {
  agent_id: string;
  memory_type: 'conversation' | 'skill' | 'emotional' | 'capability';
  content: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface EmotionalMemory {
  agent_id: string;
  emotion_type: string;
  intensity: number;
  context: string;
  timestamp: Date;
  associated_memories?: string[];
}

export interface KnowledgeBase {
  agent_id: string;
  agent_did: string;
  memories: AgentMemory[];
  emotional_memories: EmotionalMemory[];
  capabilities: CapabilityVector[];
  extracted_at: Date;
  version: string;
}

export interface ArweaveMigrationResult {
  transaction_id: string;
  arweave_url: string;
  agent_id: string;
  data_size: number;
  compressed_size: number;
  timestamp: Date;
  cost_estimate?: string;
}

export interface MigrationMetadata {
  agent_id: string;
  agent_did: string;
  migration_type: 'full' | 'incremental';
  data_hash: string;
  arweave_tx_id: string;
  created_at: Date;
}
