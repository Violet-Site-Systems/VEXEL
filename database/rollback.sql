-- Rollback script for VEXEL schema
-- Version: 1.0.0

-- Drop views
DROP VIEW IF EXISTS agent_summary;
DROP VIEW IF EXISTS active_agents;

-- Drop triggers
DROP TRIGGER IF EXISTS update_agent_last_active ON agents;
DROP TRIGGER IF EXISTS track_agent_status_changes ON agents;
DROP TRIGGER IF EXISTS update_capability_vectors_updated_at ON capability_vectors;
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;

-- Drop functions
DROP FUNCTION IF EXISTS update_last_active();
DROP FUNCTION IF EXISTS track_agent_status_change();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (in reverse order of creation to handle foreign keys)
DROP TABLE IF EXISTS ipfs_metadata;
DROP TABLE IF EXISTS agent_status_history;
DROP TABLE IF EXISTS capability_vectors;
DROP TABLE IF EXISTS agents;

-- Drop types
DROP TYPE IF EXISTS runtime_status;

-- Drop extensions (optional - only if not used by other schemas)
-- DROP EXTENSION IF EXISTS "uuid-ossp";
