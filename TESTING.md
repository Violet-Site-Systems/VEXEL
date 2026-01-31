# Testing Guide for VEXEL Phase 1.2

This guide covers testing the PostgreSQL schema, IPFS integration, and data layer functionality.

## Prerequisites

Before running tests, ensure you have:

1. **PostgreSQL 14+** installed and running
2. **Node.js 18+** and npm installed
3. **IPFS node** (optional, for IPFS-related tests)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Test Environment

Create a `.env` file for testing:

```bash
cp .env.example .env
```

Edit `.env` with your test database credentials:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=vexel_test
DATABASE_USER=vexel_user
DATABASE_PASSWORD=test_password

IPFS_HOST=127.0.0.1
IPFS_PORT=5001
IPFS_PROTOCOL=http
```

### 3. Create Test Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE vexel_test;
CREATE USER vexel_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE vexel_test TO vexel_user;
\q
```

### 4. Run Migrations

```bash
# Build the project first
npm run build

# Run migrations
npm run migrate
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

This generates a coverage report in the `coverage/` directory.

### Run Specific Test File

```bash
# Repository tests
npm test -- repository.test.ts

# IPFS tests
npm test -- ipfs.test.ts
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

This automatically reruns tests when files change.

## Manual Testing

### 1. Test Database Connection

```typescript
import { db } from './src';

const connected = await db.testConnection();
console.log('Connected:', connected);
```

Or use the command line:

```bash
psql -h localhost -U vexel_user -d vexel_test -c "SELECT NOW();"
```

### 2. Test Schema

Verify tables were created:

```bash
psql -U vexel_user -d vexel_test

# List tables
\dt

# Describe agents table
\d agents

# View runtime_status enum
\dT runtime_status

# Exit
\q
```

### 3. Run Example Script

The example script demonstrates all functionality:

```bash
# Build the project
npm run build

# Run the example
npm run example
```

Expected output:
```
🚀 VEXEL Data Layer Example

1. Testing database connection...
✅ Database connected

2. Creating a new agent...
✅ Agent created: { id: '...', did: 'did:vexel:example:...', ... }

3. Adding capabilities...
✅ Communication capability added
✅ Reasoning capability added

... (more output)

🎉 Example completed successfully!
```

### 4. Test IPFS Integration

If you have IPFS running:

```bash
# Start IPFS daemon (in a separate terminal)
ipfs daemon

# Test IPFS connection
npm run example
```

The example script will automatically detect and use IPFS if available.

## Test Scenarios

### Scenario 1: Create and Retrieve Agent

```typescript
import { db, AgentRepository, RuntimeStatus } from './src';

const repository = new AgentRepository(db);

// Create
const agent = await repository.createAgent({
  did: 'did:vexel:test:1',
  name: 'Test Agent',
  owner_address: '0x1234567890123456789012345678901234567890',
  runtime_status: RuntimeStatus.ACTIVE,
});

// Retrieve
const retrieved = await repository.getAgentById(agent.id);
console.log('Match:', agent.id === retrieved?.id);
```

### Scenario 2: Status Change Tracking

```typescript
// Create agent
const agent = await repository.createAgent({
  did: 'did:vexel:test:2',
  name: 'Status Test Agent',
  owner_address: '0x1234567890123456789012345678901234567890',
});

// Change status
await repository.updateAgentStatus(agent.id, RuntimeStatus.SLEEP);
await repository.updateAgentStatus(agent.id, RuntimeStatus.ACTIVE);

// Check history
const history = await repository.getAgentStatusHistory(agent.id);
console.log('Status changes:', history.length); // Should be 2
```

### Scenario 3: Capability Management

```typescript
// Create agent
const agent = await repository.createAgent({
  did: 'did:vexel:test:3',
  name: 'Capability Test Agent',
  owner_address: '0x1234567890123456789012345678901234567890',
});

// Add capability
await repository.createCapability({
  agent_id: agent.id,
  capability_name: 'communication',
  capability_value: { level: 5 },
});

// Update capability (version should increment)
const updated = await repository.updateCapability(
  agent.id,
  'communication',
  { capability_value: { level: 7 } }
);

console.log('Version incremented:', updated?.version === 2);
```

### Scenario 4: IPFS Metadata Storage

```typescript
import { ipfsClient, AgentMetadata } from './src';

const metadata: AgentMetadata = {
  name: 'Test Agent',
  did: 'did:vexel:test:4',
  owner_address: '0x1234567890123456789012345678901234567890',
  capabilities: [],
  version: '1.0.0',
  created_at: new Date().toISOString(),
};

// Store
const hash = await ipfsClient.storeMetadata(metadata);
console.log('IPFS Hash:', hash);

// Retrieve
const retrieved = await ipfsClient.retrieveMetadata(hash);
console.log('Match:', metadata.name === retrieved.name);
```

## Testing Database Views

### Test active_agents View

```sql
-- In psql
SELECT * FROM active_agents;
```

### Test agent_summary View

```sql
-- In psql
SELECT * FROM agent_summary;
```

## Testing Database Triggers

### Test updated_at Trigger

```sql
-- Create agent
INSERT INTO agents (did, name, owner_address)
VALUES ('did:test:trigger', 'Trigger Test', '0x1234567890123456789012345678901234567890')
RETURNING *;

-- Note the updated_at timestamp

-- Update agent
UPDATE agents SET name = 'Updated Name' WHERE did = 'did:test:trigger'
RETURNING *;

-- Verify updated_at has changed
```

### Test Status Change Tracking

```sql
-- Create agent
INSERT INTO agents (did, name, owner_address, runtime_status)
VALUES ('did:test:status', 'Status Test', '0x1234567890123456789012345678901234567890', 'ACTIVE')
RETURNING id;

-- Update status
UPDATE agents SET runtime_status = 'SLEEP' WHERE did = 'did:test:status';

-- Check history
SELECT * FROM agent_status_history WHERE agent_id = (
  SELECT id FROM agents WHERE did = 'did:test:status'
);
```

## Performance Testing

### Bulk Insert Test

```typescript
const agents = [];
for (let i = 0; i < 1000; i++) {
  agents.push(
    repository.createAgent({
      did: `did:vexel:bulk:${i}`,
      name: `Agent ${i}`,
      owner_address: '0x1234567890123456789012345678901234567890',
    })
  );
}

const start = Date.now();
await Promise.all(agents);
const duration = Date.now() - start;

console.log(`Created 1000 agents in ${duration}ms`);
```

### Query Performance Test

```sql
-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM agents WHERE runtime_status = 'ACTIVE';

-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM agents WHERE did = 'did:vexel:test:1';
```

## Cleanup

### Clean Test Data

```bash
# Rollback migrations (drops all tables)
npm run migrate:down

# Recreate schema
npm run migrate
```

### Drop Test Database

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS vexel_test;"
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: vexel_test
          POSTGRES_USER: vexel_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run migrate
      - run: npm test
```

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

**Solution:**
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check connection parameters in `.env`
- Verify user has permissions

### Migration Error

```
ERROR: relation "agents" already exists
```

**Solution:**
```bash
npm run migrate:down
npm run migrate
```

### IPFS Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5001
```

**Solution:**
- IPFS is optional for most tests
- Start IPFS daemon: `ipfs daemon`
- Or skip IPFS tests

### Test Timeout

```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**Solution:**
- Increase Jest timeout in `jest.config.js`:
```javascript
testTimeout: 10000
```

## Test Coverage Goals

Aim for:
- **Statements:** > 45%
- **Branches:** > 35%
- **Functions:** > 45%
- **Lines:** > 45%

Check coverage:
```bash
npm run test:coverage
```

View detailed report:
```bash
open coverage/lcov-report/index.html
```

## Best Practices

1. **Isolation:** Each test should be independent
2. **Cleanup:** Clean up test data after each test
3. **Mocking:** Mock external services (IPFS) when appropriate
4. **Assertions:** Use descriptive assertion messages
5. **Coverage:** Write tests for edge cases and error conditions

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [PostgreSQL Testing](https://www.postgresql.org/docs/current/regress.html)
- [IPFS Testing](https://docs.ipfs.tech/reference/kubo/rpc/)
