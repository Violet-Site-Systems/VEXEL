# Integration Tests Quick Reference

## Quick Start

```bash
# Local setup (first time)
createdb vexel_test
psql -c "CREATE USER vexel_test_user WITH PASSWORD 'vexel_test_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE vexel_test TO vexel_test_user;"

# Configure environment
cp .env.example .env
# Edit .env with test database credentials

# Run tests
npm run test:integration
```

## Common Commands

```bash
# Run all integration tests
npm run test:integration

# Run specific test file
npm run test:integration -- repository.test.ts

# Run with verbose output
npm run test:integration -- --verbose

# Keep test data after tests
KEEP_TEST_DATA=true npm run test:integration

# Clean database manually
psql -U vexel_test_user -d vexel_test -f database/rollback.sql
```

## Quick Fixes

### "Database connection failed"
```bash
# Check if PostgreSQL is running
pg_isready

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test connection manually
psql -U vexel_test_user -d vexel_test
```

### "Relation already exists"
```bash
# Clean and reinitialize
psql -U vexel_test_user -d vexel_test -f database/rollback.sql
psql -U vexel_test_user -d vexel_test -f database/schema.sql
```

### "Tests timeout"
```bash
# Check for active connections
psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE datname='vexel_test';"

# Kill stale connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='vexel_test' AND pid <> pg_backend_pid();"
```

### "Port 5432 in use"
```bash
# Find process using port
lsof -i :5432

# Stop PostgreSQL if needed
sudo systemctl stop postgresql
```

### "Permission denied"
```bash
# Grant all permissions
psql -U postgres -c "GRANT ALL ON SCHEMA public TO vexel_test_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vexel_test_user;"
```

## CI/CD

### Check CI Status
- View workflow runs: https://github.com/Violet-Site-Systems/VEXEL/actions
- Look for "Integration Tests" workflow
- Check PostgreSQL service health in logs

### CI Environment Variables
```yaml
DATABASE_HOST: localhost
DATABASE_PORT: 5432
DATABASE_NAME: vexel_test
DATABASE_USER: vexel_test_user
DATABASE_PASSWORD: vexel_test_password
NODE_ENV: test
```

## Database Inspection

```bash
# Connect to test database
psql -U vexel_test_user -d vexel_test

# Inside psql:
\dt              # List tables
\dT              # List types
\d agents        # Describe agents table
SELECT COUNT(*) FROM agents;  # Count records
```

## Test Data Management

```typescript
// In your test file
import { TestDataSeeder } from '../../database/test-seeder';

const seeder = new TestDataSeeder(db);

// Clean all data
await seeder.cleanAll();

// Create test agent
const agent = await seeder.createTestAgent({
  name: 'Test Agent',
  owner_address: '0x1234567890123456789012345678901234567890',
});

// Seed multiple agents
await seeder.seedAgents([...]);

// Get counts
await seeder.getAgentCount();
await seeder.getCapabilityCount();
```

## Performance Tips

- Tests run serially (`maxWorkers: 1`) to avoid conflicts
- Clean database before each test for isolation
- Close connections in `afterAll` to prevent hanging
- Use test seeder utilities for consistent data

## Getting Help

1. Check full documentation: `docs/INTEGRATION_TESTING.md`
2. Review GitHub Actions logs
3. Open an issue with error details and steps to reproduce
