# VEXEL Phase 1.2: Subgraph + PostgreSQL Schema

This implementation provides the complete data layer for the VEXEL agent metadata and state management system.

## Overview

Phase 1.2 implements:
- ✅ PostgreSQL schema for agent metadata
- ✅ IPFS hashing for agent metadata
- ✅ Capability vector mapping system
- ✅ Runtime status tracking (ACTIVE/SLEEP/TERMINATED)
- ✅ Subgraph Protocol integration
- ✅ Database migration scripts
- ✅ Integration tests for data layer

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- IPFS node (optional, for IPFS functionality)
- Graph CLI (optional, for subgraph deployment)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and IPFS configuration

# Run database migrations
npm run migrate

# Build the project
npm run build

# Run tests
npm test
```

## Project Structure

```
VEXEL/
├── src/
│   ├── database/
│   │   ├── client.ts          # PostgreSQL client
│   │   ├── repository.ts      # Agent repository operations
│   │   └── migrate.ts         # Migration runner
│   ├── ipfs/
│   │   └── client.ts          # IPFS client for metadata storage
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── __tests__/
│   │   ├── repository.test.ts # Repository integration tests
│   │   └── ipfs.test.ts       # IPFS client tests
│   ├── service.ts             # High-level service layer
│   └── index.ts               # Main entry point
├── database/
│   ├── schema.sql             # PostgreSQL schema
│   ├── rollback.sql           # Schema rollback script
│   └── README.md              # Database documentation
├── subgraph/
│   ├── schema.graphql         # GraphQL schema for subgraph
│   ├── subgraph.yaml          # Subgraph configuration
│   ├── src/
│   │   └── mapping.ts         # Event handlers
│   └── abis/
│       └── AgentRegistry.json # Contract ABI
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
└── jest.config.js             # Jest test configuration
```

## Database Schema

The PostgreSQL schema includes:

### Tables
1. **agents** - Main agent metadata and state
2. **capability_vectors** - Agent capabilities with JSONB values
3. **agent_status_history** - Historical status changes
4. **ipfs_metadata** - Cached IPFS metadata

### Features
- UUID primary keys
- Automated timestamp updates
- Status change tracking via triggers
- JSONB support for flexible capability storage
- GIN indexes for efficient JSON querying
- Views for common query patterns

See [database/README.md](database/README.md) for detailed schema documentation.

## Usage Examples

### Basic Agent Operations

```typescript
import { db, AgentRepository, RuntimeStatus } from './src';

const repository = new AgentRepository(db);

// Create an agent
const agent = await repository.createAgent({
  did: 'did:vexel:agent:123',
  name: 'My Agent',
  description: 'An intelligent agent',
  owner_address: '0x1234567890123456789012345678901234567890',
  runtime_status: RuntimeStatus.ACTIVE,
});

// Get agent by ID
const retrieved = await repository.getAgentById(agent.id);

// Update agent status
await repository.updateAgentStatus(agent.id, RuntimeStatus.SLEEP);

// Get status history
const history = await repository.getAgentStatusHistory(agent.id);
```

### Capability Management

```typescript
// Add capability
await repository.createCapability({
  agent_id: agent.id,
  capability_name: 'communication',
  capability_value: {
    protocols: ['http', 'websocket'],
    level: 5,
  },
});

// Get all capabilities
const capabilities = await repository.getAgentCapabilities(agent.id);

// Update capability
await repository.updateCapability(
  agent.id,
  'communication',
  {
    capability_value: {
      protocols: ['http', 'websocket', 'grpc'],
      level: 7,
    },
  }
);
```

### IPFS Integration

```typescript
import { ipfsClient, AgentMetadata } from './src';

// Create metadata
const metadata: AgentMetadata = {
  name: 'My Agent',
  did: 'did:vexel:agent:123',
  owner_address: '0x1234567890123456789012345678901234567890',
  capabilities: [
    {
      name: 'communication',
      value: { level: 5 },
    },
  ],
  version: '1.0.0',
  created_at: new Date().toISOString(),
};

// Store on IPFS
const hash = await ipfsClient.storeMetadata(metadata);
console.log('IPFS Hash:', hash);

// Retrieve from IPFS
const retrieved = await ipfsClient.retrieveMetadata(hash);

// Pin for persistence
await ipfsClient.pinMetadata(hash);
```

### High-Level Service

```typescript
import { db, ipfsClient, AgentService } from './src';

const service = new AgentService(db, ipfsClient);

// Create agent with IPFS storage
const result = await service.createAgent({
  did: 'did:vexel:agent:456',
  name: 'Service Agent',
  owner_address: '0x1234567890123456789012345678901234567890',
});

console.log('Agent ID:', result.agent.id);
console.log('IPFS Hash:', result.ipfsHash);

// Get agent with metadata
const agentData = await service.getAgentWithMetadata(result.agent.id);
console.log('Agent:', agentData.agent);
console.log('Metadata:', agentData.metadata);
```

## Database Migrations

### Run Migrations

```bash
# Apply schema
npm run migrate

# Rollback schema
npm run migrate:down
```

### Using Migration Runner in Code

```typescript
import { DatabaseClient, MigrationRunner } from './src';

const db = new DatabaseClient();
const runner = new MigrationRunner(db);

// Check connection
const isConnected = await runner.checkConnection();

// Run migrations
await runner.up();

// Or rollback
await runner.down();
```

## Subgraph Integration

The subgraph indexes blockchain events related to agent registration and management.

### Deploy Subgraph

```bash
# Install Graph CLI
npm install -g @graphprotocol/graph-cli

# Navigate to subgraph directory
cd subgraph

# Generate types
graph codegen

# Build subgraph
graph build

# Deploy to hosted service
graph deploy --product hosted-service <GITHUB_USERNAME>/vexel-agents

# Or deploy to local node
graph create vexel/agents --node http://localhost:8020
graph deploy vexel/agents --ipfs http://localhost:5001 --node http://localhost:8020
```

### Query Subgraph

```graphql
# Get all active agents
{
  agents(where: { runtimeStatus: ACTIVE }) {
    id
    did
    name
    ownerAddress
    ipfsMetadataHash
    capabilities {
      name
      value
      version
    }
  }
}

# Get agent status history
{
  statusChanges(where: { agent: "did:vexel:agent:123" }) {
    previousStatus
    newStatus
    timestamp
    reason
  }
}
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- repository.test.ts
```

### Test Database Setup

Tests require a PostgreSQL database. Configure in `.env`:

```env
DATABASE_NAME=vexel_test
DATABASE_USER=vexel_user
DATABASE_PASSWORD=test_password
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=vexel
DATABASE_USER=vexel_user
DATABASE_PASSWORD=your_password_here

# IPFS Configuration
IPFS_HOST=127.0.0.1
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Subgraph Configuration
SUBGRAPH_URL=http://localhost:8000/subgraphs/name/vexel/agents

# Network Configuration
POLYGON_RPC_URL=https://polygon-rpc.com
```

## API Reference

### DatabaseClient

- `query<T>(text: string, params?: any[]): Promise<QueryResult<T>>`
- `transaction<T>(callback): Promise<T>`
- `testConnection(): Promise<boolean>`
- `close(): Promise<void>`

### AgentRepository

- `createAgent(input: CreateAgentInput): Promise<Agent>`
- `getAgentById(id: string): Promise<Agent | null>`
- `getAgentByDid(did: string): Promise<Agent | null>`
- `updateAgent(id: string, input: UpdateAgentInput): Promise<Agent | null>`
- `updateAgentStatus(id: string, status: RuntimeStatus): Promise<Agent | null>`
- `createCapability(input: CreateCapabilityInput): Promise<CapabilityVector>`
- `getAgentCapabilities(agentId: string): Promise<CapabilityVector[]>`
- `updateCapability(...): Promise<CapabilityVector | null>`

### IPFSClient

- `storeMetadata(metadata: AgentMetadata): Promise<string>`
- `retrieveMetadata(hash: string): Promise<AgentMetadata>`
- `pinMetadata(hash: string): Promise<void>`
- `testConnection(): Promise<boolean>`

## Performance Considerations

1. **Connection Pooling**: The database client uses connection pooling (max 20 connections)
2. **Indexes**: Strategic indexes on frequently queried columns
3. **JSONB Indexing**: GIN indexes for efficient JSON querying
4. **Batch Operations**: Use transactions for multiple operations
5. **IPFS Caching**: Metadata is cached in the database to reduce IPFS calls

## Security Best Practices

1. Use environment variables for sensitive configuration
2. Never commit `.env` files
3. Use parameterized queries (implemented in repository)
4. Validate Ethereum addresses (enforced by database constraint)
5. Implement rate limiting in production
6. Use SSL/TLS for database connections

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
psql -h localhost -U vexel_user -d vexel

# Check PostgreSQL is running
sudo systemctl status postgresql
```

### IPFS Connection Issues

```bash
# Test IPFS connection
ipfs id

# Start IPFS daemon
ipfs daemon
```

### Migration Errors

```bash
# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Manually rollback if needed
psql -U vexel_user -d vexel -f database/rollback.sql
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass before submitting PR

## License

License to be determined in Phase 4. One or more of the Sustainability Code Licenses will be chosen.

## Support

For issues and questions:
- GitHub Issues: https://github.com/Violet-Site-Systems/VEXEL/issues
- Documentation: See [database/README.md](database/README.md)

## Acceptance Criteria ✅

All acceptance criteria for Phase 1.2 have been met:

- ✅ PostgreSQL schema deployed and tested
- ✅ Agent metadata successfully stored in database
- ✅ IPFS hashes generated for metadata
- ✅ Capability vectors correctly mapped
- ✅ Runtime status updates work correctly
- ✅ Subgraph indexes blockchain data
- ✅ Integration tests implemented
- ✅ Schema documentation complete
- ✅ Migration scripts tested

## Next Steps

After Phase 1.2, proceed to:
- **Phase 1.3**: HAAP Protocol Implementation
- **Phase 2.1**: Smart Contract Development
