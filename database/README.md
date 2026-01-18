# VEXEL Database Schema Documentation

## Overview

This document describes the PostgreSQL database schema for the VEXEL agent metadata and state management system (Phase 1.2).

## Schema Version

**Version:** 1.0.0  
**Last Updated:** 2026-01-18

## Architecture

The database schema is designed to store:
- Agent metadata and identity information
- Runtime status tracking (ACTIVE/SLEEP/TERMINATED)
- Capability vectors for each agent
- IPFS metadata hashes and cached content
- Historical status changes

## Tables

### 1. agents

Main table storing agent metadata and current state.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique agent identifier |
| did | VARCHAR(255) | UNIQUE, NOT NULL | Decentralized Identifier (DID) |
| name | VARCHAR(255) | NOT NULL | Agent name |
| description | TEXT | | Optional agent description |
| owner_address | VARCHAR(42) | NOT NULL | Ethereum address of owner (0x...) |
| ipfs_metadata_hash | VARCHAR(64) | | IPFS hash of agent metadata |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW | Last update timestamp |
| runtime_status | runtime_status | DEFAULT 'ACTIVE' | Current runtime status |
| last_active_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW | Last active timestamp |

**Indexes:**
- `idx_agents_did` on `did`
- `idx_agents_owner_address` on `owner_address`
- `idx_agents_runtime_status` on `runtime_status`
- `idx_agents_created_at` on `created_at`

**Constraints:**
- `agents_owner_address_check`: Validates Ethereum address format (0x + 40 hex chars)

### 2. capability_vectors

Stores capability information for each agent.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique capability identifier |
| agent_id | UUID | FOREIGN KEY, NOT NULL | References agents(id) |
| capability_name | VARCHAR(255) | NOT NULL | Name of the capability |
| capability_value | JSONB | NOT NULL | JSON object with capability data |
| version | INTEGER | DEFAULT 1 | Version number of the capability |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW | Last update timestamp |

**Indexes:**
- `idx_capability_vectors_agent_id` on `agent_id`
- `idx_capability_vectors_capability_name` on `capability_name`
- `idx_capability_vectors_value` GIN index on `capability_value`

**Constraints:**
- `unique_agent_capability`: UNIQUE constraint on (agent_id, capability_name)

### 3. agent_status_history

Tracks historical status changes for agents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique history record identifier |
| agent_id | UUID | FOREIGN KEY, NOT NULL | References agents(id) |
| previous_status | runtime_status | | Previous runtime status |
| new_status | runtime_status | NOT NULL | New runtime status |
| changed_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW | Status change timestamp |
| reason | TEXT | | Optional reason for status change |
| metadata | JSONB | | Additional metadata about the change |

**Indexes:**
- `idx_agent_status_history_agent_id` on `agent_id`
- `idx_agent_status_history_changed_at` on `changed_at`

### 4. ipfs_metadata

Caches IPFS metadata for agents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique cache entry identifier |
| agent_id | UUID | FOREIGN KEY, NOT NULL | References agents(id) |
| ipfs_hash | VARCHAR(64) | UNIQUE, NOT NULL | IPFS content hash |
| metadata | JSONB | NOT NULL | Cached metadata content |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW | Cache creation timestamp |

**Indexes:**
- `idx_ipfs_metadata_agent_id` on `agent_id`
- `idx_ipfs_metadata_hash` on `ipfs_hash`
- `idx_ipfs_metadata_content` GIN index on `metadata`

**Constraints:**
- `unique_agent_current_metadata`: UNIQUE constraint on `agent_id`

## Enums

### runtime_status

Defines the possible runtime states for an agent:

- `ACTIVE`: Agent is currently active and operational
- `SLEEP`: Agent is in sleep mode (paused but not terminated)
- `TERMINATED`: Agent has been terminated and is no longer operational

## Triggers

### 1. update_agents_updated_at

Automatically updates the `updated_at` timestamp on the `agents` table whenever a row is modified.

### 2. update_capability_vectors_updated_at

Automatically updates the `updated_at` timestamp on the `capability_vectors` table whenever a row is modified.

### 3. track_agent_status_changes

Automatically creates a record in `agent_status_history` whenever an agent's runtime status changes.

### 4. update_agent_last_active

Automatically updates the `last_active_at` timestamp when an agent's status changes to `ACTIVE`.

## Views

### 1. active_agents

Provides a summary of all active agents with their capability counts.

```sql
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
```

### 2. agent_summary

Provides an overview of all agents with aggregate statistics.

```sql
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
```

## Common Queries

### Get all active agents
```sql
SELECT * FROM active_agents;
```

### Get agent with all capabilities
```sql
SELECT 
    a.*,
    json_agg(
        json_build_object(
            'name', cv.capability_name,
            'value', cv.capability_value,
            'version', cv.version
        )
    ) as capabilities
FROM agents a
LEFT JOIN capability_vectors cv ON a.id = cv.agent_id
WHERE a.id = 'agent-uuid-here'
GROUP BY a.id;
```

### Get agent status history
```sql
SELECT * FROM agent_status_history
WHERE agent_id = 'agent-uuid-here'
ORDER BY changed_at DESC;
```

### Find agents by owner
```sql
SELECT * FROM agents
WHERE owner_address = '0x...'
ORDER BY created_at DESC;
```

## Migration

### Apply Schema
```bash
npm run migrate
```

### Rollback Schema
```bash
npm run migrate:down
```

## Data Integrity

The schema enforces data integrity through:

1. **Foreign Key Constraints**: All references between tables are enforced
2. **Unique Constraints**: Prevent duplicate DIDs and capability names per agent
3. **Check Constraints**: Validate Ethereum address format
4. **Automatic Timestamps**: Managed through triggers
5. **Cascade Deletes**: Related records are automatically cleaned up when an agent is deleted

## Performance Considerations

1. **Indexes**: Strategic indexes on frequently queried columns
2. **GIN Indexes**: For efficient JSONB querying
3. **Materialized Views**: Consider for heavy aggregation queries in production
4. **Partitioning**: Consider partitioning `agent_status_history` by date if volume grows large

## Security Considerations

1. Use parameterized queries to prevent SQL injection
2. Implement row-level security (RLS) policies for multi-tenant scenarios
3. Encrypt sensitive data at rest
4. Use SSL/TLS for database connections
5. Regularly rotate database credentials

## Backup and Recovery

1. Set up regular automated backups
2. Test restore procedures regularly
3. Consider point-in-time recovery (PITR) for critical data
4. Store backups in geographically separate locations

## Monitoring

Monitor the following metrics:

1. Query performance (slow query log)
2. Connection pool utilization
3. Table sizes and growth rates
4. Index usage statistics
5. Replication lag (if using replication)
