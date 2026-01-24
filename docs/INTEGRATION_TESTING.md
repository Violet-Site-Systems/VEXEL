# Integration Testing Guide

This guide covers the integration testing setup for VEXEL, including database integration testing with PostgreSQL.

## Overview

VEXEL uses a dedicated integration test workflow with PostgreSQL service containers to ensure reliable database integration testing in both local development and CI environments.

## Architecture

### Test Layers

1. **Unit Tests** (`npm test`) - Fast, isolated tests without external dependencies
2. **Integration Tests** (`npm run test:integration`) - Tests with real database and services
3. **Contract Tests** (`npm run test:contracts`) - Smart contract tests with Hardhat

### Integration Test Components

- **PostgreSQL Service** - Dedicated test database (separate from development)
- **Database Migrations** - Automated schema setup/teardown
- **Test Data Seeding** - Helper utilities for test data management
- **Test Isolation** - Each test suite gets a clean database state

## Local Setup

### Prerequisites

1. **PostgreSQL 15+** installed and running
2. **Node.js 18.18+** installed
3. **npm dependencies** installed (`npm ci`)

### Database Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure test database credentials in `.env`:
   ```bash
   # Test Database Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=vexel_test
   DATABASE_USER=vexel_test_user
   DATABASE_PASSWORD=vexel_test_password
   ```

3. Create the test database:
   ```bash
   # Create test database and user
   psql -U postgres -c "CREATE DATABASE vexel_test;"
   psql -U postgres -c "CREATE USER vexel_test_user WITH PASSWORD 'vexel_test_password';"
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE vexel_test TO vexel_test_user;"
   ```

### Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- repository.test.ts

# Run with verbose output
npm run test:integration -- --verbose

# Keep test data after tests (for debugging)
KEEP_TEST_DATA=true npm run test:integration
```

## CI/CD Integration

### GitHub Actions Workflow

The integration test workflow (`.github/workflows/integration-tests.yml`) automatically:

1. ✅ Starts PostgreSQL 15 service container
2. ✅ Waits for database to be healthy
3. ✅ Verifies database connection
4. ✅ Initializes database schema
5. ✅ Runs all integration tests
6. ✅ Cleans up test data
7. ✅ Uploads test results as artifacts

### Workflow Configuration

- **Trigger**: All branches on push and pull requests
- **Timeout**: 15 minutes
- **PostgreSQL Version**: 15-alpine
- **Test Database**: `vexel_test`
- **Test User**: `vexel_test_user`
- **Health Checks**: Enabled with 5 retries

### Environment Variables

The workflow sets these environment variables:

```yaml
DATABASE_HOST: localhost
DATABASE_PORT: 5432
DATABASE_NAME: vexel_test
DATABASE_USER: vexel_test_user
DATABASE_PASSWORD: vexel_test_password
NODE_ENV: test
```

## Writing Integration Tests

### Test Structure

Integration tests should be placed in `src/__tests__/integration/`:

```typescript
import { DatabaseClient } from '../../database/client';
import { TestDataSeeder } from '../../database/test-seeder';

describe('MyIntegrationTest', () => {
  let db: DatabaseClient;
  let seeder: TestDataSeeder;

  beforeAll(() => {
    db = new DatabaseClient();
    seeder = new TestDataSeeder(db);
  });

  beforeEach(async () => {
    // Clean database before each test
    await seeder.cleanAll();
  });

  afterAll(async () => {
    // Final cleanup
    await seeder.cleanAll();
    await db.close();
  });

  it('should test database functionality', async () => {
    // Create test data
    const agent = await seeder.createTestAgent({
      name: 'My Test Agent',
    });

    // Test your code
    expect(agent).toBeDefined();
    expect(agent.name).toBe('My Test Agent');
  });
});
```

### Test Data Seeding

The `TestDataSeeder` utility provides helpers for managing test data:

```typescript
import { TestDataSeeder, createTestDatabase } from '../../database/test-seeder';

// Create database client and seeder
const { db, seeder } = createTestDatabase();

// Clean all test data
await seeder.cleanAll();

// Create a single test agent
const agent = await seeder.createTestAgent({
  name: 'Custom Agent',
  owner_address: '0x1234567890123456789012345678901234567890',
});

// Seed multiple agents
const agents = await seeder.seedAgents([
  {
    did: 'did:vexel:test:agent1',
    name: 'Agent 1',
    owner_address: '0x1111111111111111111111111111111111111111',
  },
  {
    did: 'did:vexel:test:agent2',
    name: 'Agent 2',
    owner_address: '0x2222222222222222222222222222222222222222',
  },
]);

// Seed capabilities
await seeder.seedCapabilities([
  {
    agent_id: agent.id,
    capability_name: 'communication',
    capability_value: { level: 5 },
  },
]);

// Get counts
const agentCount = await seeder.getAgentCount();
const capabilityCount = await seeder.getCapabilityCount();
```

### Test Isolation

Integration tests run with `maxWorkers: 1` to ensure:

- ✅ Tests run serially (no concurrent database conflicts)
- ✅ Each test gets a clean database state
- ✅ Test data doesn't leak between tests
- ✅ Predictable and reproducible results

### Best Practices

1. **Always clean test data** in `beforeEach` and `afterAll` hooks
2. **Use unique identifiers** (timestamps, UUIDs) to avoid conflicts
3. **Test real database constraints** (foreign keys, unique constraints, etc.)
4. **Keep tests focused** - one concern per test
5. **Use test seeder utilities** for consistent test data creation
6. **Close database connections** in `afterAll` to prevent hanging

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Symptom**: `Failed to connect to test database`

**Solutions**:
- Ensure PostgreSQL is running: `pg_isready`
- Verify credentials in `.env` file
- Check database exists: `psql -l | grep vexel_test`
- Verify user permissions: `\du` in psql

#### 2. Schema Already Exists

**Symptom**: `relation "agents" already exists`

**Solutions**:
- Run cleanup: `npm run test:integration` (will clean up automatically)
- Manual cleanup: `psql -U vexel_test_user -d vexel_test -f database/rollback.sql`
- Drop and recreate database:
  ```bash
  dropdb vexel_test
  createdb vexel_test
  ```

#### 3. Tests Timeout

**Symptom**: `Exceeded timeout of 30000 ms`

**Solutions**:
- Increase timeout in `jest.integration.config.js`
- Check database performance: `SELECT * FROM pg_stat_activity;`
- Ensure database connections are closed properly
- Verify no long-running queries blocking tests

#### 4. Port Already in Use

**Symptom**: `Error: listen EADDRINUSE: address already in use :::5432`

**Solutions**:
- Check if PostgreSQL is already running: `lsof -i :5432`
- Stop conflicting service: `sudo systemctl stop postgresql`
- Use different port in `.env` configuration

#### 5. Permission Denied

**Symptom**: `ERROR: permission denied for schema public`

**Solutions**:
- Grant schema permissions:
  ```sql
  GRANT ALL ON SCHEMA public TO vexel_test_user;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vexel_test_user;
  ```
- Or recreate user with superuser:
  ```sql
  DROP USER IF EXISTS vexel_test_user;
  CREATE USER vexel_test_user WITH PASSWORD 'vexel_test_password' SUPERUSER;
  ```

#### 6. CI Tests Pass Locally but Fail in GitHub Actions

**Symptom**: Tests work locally but fail in CI

**Solutions**:
- Check GitHub Actions logs for specific errors
- Verify environment variables are set correctly in workflow
- Ensure PostgreSQL service is healthy (check health check logs)
- Check for hardcoded localhost or port values
- Verify test timeout is sufficient for CI environment

### Debug Mode

Enable verbose logging for debugging:

```bash
# Enable verbose test output
npm run test:integration -- --verbose

# Keep test data for inspection
KEEP_TEST_DATA=true npm run test:integration

# Show database logs
psql -U vexel_test_user -d vexel_test -c "SELECT * FROM agents;"
psql -U vexel_test_user -d vexel_test -c "SELECT * FROM pg_stat_activity;"
```

### Manual Database Inspection

```bash
# Connect to test database
psql -U vexel_test_user -d vexel_test

# List tables
\dt

# List types
\dT

# List views
\dv

# Describe table
\d agents

# Count records
SELECT COUNT(*) FROM agents;

# View recent agents
SELECT * FROM agents ORDER BY created_at DESC LIMIT 10;
```

## Database Cleanup

### Automatic Cleanup

Integration tests automatically clean up:

- Before all tests (via `globalSetup`)
- Before each test (via `beforeEach`)
- After all tests (via `globalTeardown`)

### Manual Cleanup

```bash
# Clean all test data
PGPASSWORD=vexel_test_password psql -h localhost -U vexel_test_user -d vexel_test -f database/rollback.sql

# Reset schema
PGPASSWORD=vexel_test_password psql -h localhost -U vexel_test_user -d vexel_test -f database/rollback.sql
PGPASSWORD=vexel_test_password psql -h localhost -U vexel_test_user -d vexel_test -f database/schema.sql
```

## Performance Optimization

### Database Tuning

For faster tests, configure PostgreSQL test database:

```sql
-- Disable fsync for test database (faster but not durable)
ALTER DATABASE vexel_test SET fsync = off;

-- Increase work memory
ALTER DATABASE vexel_test SET work_mem = '64MB';

-- Use faster synchronous commit mode
ALTER DATABASE vexel_test SET synchronous_commit = off;
```

**⚠️ Warning**: Only use these settings for test databases, never in production!

### Test Optimization

- Use `maxWorkers: 1` to avoid connection pool exhaustion
- Minimize database queries in test setup
- Use transactions for faster test data setup/teardown
- Cache database clients when possible
- Close connections properly to avoid pool exhaustion

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [GitHub Actions Services](https://docs.github.com/en/actions/using-containerized-services/about-service-containers)
- [Database Schema](../database/README.md)

## Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Actions workflow logs](https://github.com/Violet-Site-Systems/VEXEL/actions)
2. Review existing issues and PRs
3. Open a new issue with:
   - Error message and stack trace
   - Steps to reproduce
   - Environment details (OS, PostgreSQL version, Node.js version)
   - Relevant logs from test output
