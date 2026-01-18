-- VEXEL PostgreSQL Schema
-- Phase 1.2: Agent Metadata and State Management
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Runtime Status Enum
CREATE TYPE runtime_status AS ENUM ('ACTIVE', 'SLEEP', 'TERMINATED');

-- Agent Metadata Table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    did VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_address VARCHAR(42) NOT NULL,
    ipfs_metadata_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    runtime_status runtime_status DEFAULT 'ACTIVE',
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT agents_owner_address_check CHECK (owner_address ~* '^0x[a-f0-9]{40}$')
);

-- Create indexes for common queries
CREATE INDEX idx_agents_did ON agents(did);
CREATE INDEX idx_agents_owner_address ON agents(owner_address);
CREATE INDEX idx_agents_runtime_status ON agents(runtime_status);
CREATE INDEX idx_agents_created_at ON agents(created_at);

-- Capability Vectors Table
CREATE TABLE capability_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    capability_name VARCHAR(255) NOT NULL,
    capability_value JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique capability per agent
    CONSTRAINT unique_agent_capability UNIQUE (agent_id, capability_name)
);

-- Create indexes for capability queries
CREATE INDEX idx_capability_vectors_agent_id ON capability_vectors(agent_id);
CREATE INDEX idx_capability_vectors_capability_name ON capability_vectors(capability_name);
CREATE INDEX idx_capability_vectors_value ON capability_vectors USING GIN (capability_value);

-- Agent Status History Table (for tracking status changes)
CREATE TABLE agent_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    previous_status runtime_status,
    new_status runtime_status NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    metadata JSONB
);

-- Create indexes for status history
CREATE INDEX idx_agent_status_history_agent_id ON agent_status_history(agent_id);
CREATE INDEX idx_agent_status_history_changed_at ON agent_status_history(changed_at);

-- IPFS Metadata Cache Table
CREATE TABLE ipfs_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    ipfs_hash VARCHAR(64) UNIQUE NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one-to-one relationship with current metadata
    CONSTRAINT unique_agent_current_metadata UNIQUE (agent_id)
);

-- Create indexes for IPFS metadata
CREATE INDEX idx_ipfs_metadata_agent_id ON ipfs_metadata(agent_id);
CREATE INDEX idx_ipfs_metadata_hash ON ipfs_metadata(ipfs_hash);
CREATE INDEX idx_ipfs_metadata_content ON ipfs_metadata USING GIN (metadata);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on agents table
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on capability_vectors table
CREATE TRIGGER update_capability_vectors_updated_at
    BEFORE UPDATE ON capability_vectors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to track agent status changes
CREATE OR REPLACE FUNCTION track_agent_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.runtime_status IS DISTINCT FROM NEW.runtime_status THEN
        INSERT INTO agent_status_history (agent_id, previous_status, new_status, reason)
        VALUES (NEW.id, OLD.runtime_status, NEW.runtime_status, 'Status changed');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track status changes
CREATE TRIGGER track_agent_status_changes
    AFTER UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION track_agent_status_change();

-- Function to update last_active_at when status changes to ACTIVE
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.runtime_status = 'ACTIVE' THEN
        NEW.last_active_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active_at
CREATE TRIGGER update_agent_last_active
    BEFORE UPDATE ON agents
    FOR EACH ROW
    WHEN (NEW.runtime_status = 'ACTIVE')
    EXECUTE FUNCTION update_last_active();

-- Views for common queries

-- Active Agents View
CREATE VIEW active_agents AS
SELECT 
    a.id,
    a.did,
    a.name,
    a.description,
    a.owner_address,
    a.ipfs_metadata_hash,
    a.created_at,
    a.updated_at,
    a.last_active_at,
    COUNT(cv.id) as capability_count
FROM agents a
LEFT JOIN capability_vectors cv ON a.id = cv.agent_id
WHERE a.runtime_status = 'ACTIVE'
GROUP BY a.id;

-- Agent Summary View
CREATE VIEW agent_summary AS
SELECT 
    a.id,
    a.did,
    a.name,
    a.owner_address,
    a.runtime_status,
    a.created_at,
    a.last_active_at,
    COUNT(DISTINCT cv.id) as capability_count,
    COUNT(DISTINCT ash.id) as status_change_count
FROM agents a
LEFT JOIN capability_vectors cv ON a.id = cv.agent_id
LEFT JOIN agent_status_history ash ON a.id = ash.agent_id
GROUP BY a.id;

-- Comments for documentation
COMMENT ON TABLE agents IS 'Main table storing agent metadata and state';
COMMENT ON TABLE capability_vectors IS 'Stores capability vectors for each agent';
COMMENT ON TABLE agent_status_history IS 'Tracks historical status changes for agents';
COMMENT ON TABLE ipfs_metadata IS 'Caches IPFS metadata for agents';

COMMENT ON COLUMN agents.did IS 'Decentralized Identifier (DID) for the agent';
COMMENT ON COLUMN agents.ipfs_metadata_hash IS 'IPFS hash of the agent metadata';
COMMENT ON COLUMN agents.runtime_status IS 'Current runtime status: ACTIVE, SLEEP, or TERMINATED';
COMMENT ON COLUMN agents.last_active_at IS 'Timestamp of last time agent was in ACTIVE status';

COMMENT ON COLUMN capability_vectors.capability_name IS 'Name of the capability (e.g., "communication", "reasoning")';
COMMENT ON COLUMN capability_vectors.capability_value IS 'JSON object containing capability parameters and values';
