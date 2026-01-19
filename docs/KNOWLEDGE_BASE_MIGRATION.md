# Knowledge Base Migration to Arweave

## Overview

The Knowledge Base Migration system enables permanent storage of Copilot agent memory on Arweave, providing immutable backup and capability transfer capabilities. This implementation is part of Phase 2.3 of the VEXEL project.

## Features

- **Agent Memory Extraction**: Extract conversation, skill, emotional, and capability memories from agents
- **Arweave Permanent Storage**: Store knowledge bases permanently on the Arweave blockchain
- **Data Compression**: Automatic gzip compression to reduce storage costs
- **Emotional Memory Preservation**: Preserve emotional context and intensity data
- **Capability Transfer**: Transfer capabilities from one agent to another using Arweave backups
- **Migration History**: Track all migrations with metadata and transaction IDs
- **Cost Estimation**: Calculate storage costs before migration

## Architecture

### Components

1. **ArweaveClient**: Low-level client for Arweave blockchain operations
   - Data storage with compression
   - Data retrieval and verification
   - Transaction management
   - Cost estimation

2. **MemoryExtractor**: Extracts agent memory from database
   - Agent memories (conversation, skill, capability, emotional)
   - Emotional memories with context
   - Capability vectors
   - Memory statistics

3. **KnowledgeBaseMigration**: High-level migration orchestration
   - Complete knowledge base extraction
   - Migration to Arweave
   - Capability transfer automation
   - Migration history tracking

## Installation

The knowledge base migration system requires the Arweave dependency:

```bash
npm install arweave
```

## Usage

### Basic Migration

```typescript
import { KnowledgeBaseMigration } from 'vexel';
import { db } from './database';

// Initialize migration service
const migration = new KnowledgeBaseMigration(db);

// Generate or load Arweave wallet
const wallet = await migration.generateArweaveWallet();
migration.setArweaveWallet(wallet);

// Migrate agent knowledge base to Arweave
const result = await migration.migrateToArweave('agent-id-123');

console.log('Migration completed!');
console.log('Transaction ID:', result.transaction_id);
console.log('Arweave URL:', result.arweave_url);
console.log('Cost:', result.cost_estimate);
```

### Estimate Migration Cost

```typescript
// Estimate cost before migrating
const costInAR = await migration.estimateMigrationCost('agent-id-123');
console.log(`Estimated cost: ${costInAR} AR`);
```

### Retrieve Knowledge Base

```typescript
// Retrieve knowledge base from Arweave
const knowledgeBase = await migration.retrieveFromArweave('transaction-id');

console.log('Agent ID:', knowledgeBase.agent_id);
console.log('Agent DID:', knowledgeBase.agent_did);
console.log('Memories:', knowledgeBase.memories.length);
console.log('Emotional Memories:', knowledgeBase.emotional_memories.length);
console.log('Capabilities:', knowledgeBase.capabilities.length);
```

### Transfer Capabilities

```typescript
// Transfer capabilities from archived agent to new agent
await migration.transferCapabilities(
  'source-transaction-id',
  'target-agent-id'
);

console.log('Capabilities transferred successfully!');
```

### Custom Configuration

```typescript
import { MigrationConfig } from 'vexel';

const config: MigrationConfig = {
  arweaveWallet: wallet,
  compressionEnabled: true,
  includeEmotionalMemories: true,
  includeCapabilities: true,
};

const migration = new KnowledgeBaseMigration(db, config);

// Migrate with custom options
const result = await migration.migrateToArweave('agent-id', {
  compressionEnabled: false,  // Disable compression
  includeEmotionalMemories: false,  // Exclude emotional memories
});
```

### Migration History

```typescript
// Get migration history for an agent
const history = await migration.getMigrationHistory('agent-id-123');

history.forEach((record) => {
  console.log('Migration Date:', record.created_at);
  console.log('Transaction ID:', record.arweave_tx_id);
  console.log('Data Hash:', record.data_hash);
  console.log('Type:', record.migration_type);
});
```

### Check Transaction Status

```typescript
// Check if transaction is confirmed
const status = await migration.getTransactionStatus('transaction-id');

console.log('Confirmed:', status.confirmed);
console.log('Confirmations:', status.confirmations);
console.log('Block Height:', status.blockHeight);
```

## Memory Extraction

### Memory Types

The system supports four types of agent memories:

1. **Conversation**: Dialogue and interaction history
2. **Skill**: Learned skills and knowledge
3. **Emotional**: Emotional states and reactions
4. **Capability**: Agent capabilities and functions

### Emotional Memory Structure

```typescript
interface EmotionalMemory {
  agent_id: string;
  emotion_type: string;  // e.g., 'joy', 'frustration', 'curiosity'
  intensity: number;  // 0.0 to 1.0
  context: string;  // Description of the situation
  timestamp: Date;
  associated_memories?: string[];  // Links to related memories
}
```

### Knowledge Base Structure

```typescript
interface KnowledgeBase {
  agent_id: string;
  agent_did: string;
  memories: AgentMemory[];
  emotional_memories: EmotionalMemory[];
  capabilities: CapabilityVector[];
  extracted_at: Date;
  version: string;
}
```

## Database Schema

The knowledge base migration system uses the following database tables:

### agent_memories

```sql
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(255) NOT NULL,
  memory_type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

### emotional_memories

```sql
CREATE TABLE emotional_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(255) NOT NULL,
  emotion_type VARCHAR(50) NOT NULL,
  intensity DECIMAL(3, 2) NOT NULL,
  context TEXT NOT NULL,
  associated_memories TEXT[],
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

### arweave_migrations

```sql
CREATE TABLE arweave_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(255) NOT NULL,
  agent_did VARCHAR(255) NOT NULL,
  migration_type VARCHAR(20) NOT NULL,
  data_hash VARCHAR(64) NOT NULL,
  arweave_tx_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

## Arweave Configuration

### Environment Variables

```bash
# Arweave configuration
ARWEAVE_HOST=arweave.net
ARWEAVE_PORT=443
ARWEAVE_PROTOCOL=https
```

### Wallet Management

```typescript
// Generate new wallet
const wallet = await migration.generateArweaveWallet();

// Save wallet to file (keep secure!)
fs.writeFileSync('arweave-wallet.json', JSON.stringify(wallet));

// Load existing wallet
const wallet = JSON.parse(fs.readFileSync('arweave-wallet.json', 'utf8'));
migration.setArweaveWallet(wallet);

// Check balance
const balance = await migration.getWalletBalance();
console.log(`Balance: ${balance} AR`);
```

## Cost Analysis

### Storage Costs

Arweave charges a one-time fee for permanent storage. Costs depend on:

1. **Data Size**: Larger data costs more
2. **Compression**: Gzip compression reduces costs by ~70%
3. **Network Price**: AR token price fluctuates

### Example Costs

```typescript
// Example knowledge base sizes
const smallAgent = 50 KB;   // ~0.000001 AR
const mediumAgent = 500 KB;  // ~0.00001 AR
const largeAgent = 5 MB;     // ~0.0001 AR

// With 70% compression
const compressedCost = originalCost * 0.3;
```

### Cost Optimization

1. **Enable Compression**: Always use compression (default)
2. **Selective Migration**: Only migrate necessary data
3. **Batch Operations**: Minimize individual transactions
4. **Filter Data**: Exclude non-essential memories

## Security Considerations

### Wallet Security

- **Never commit wallet files to version control**
- Store wallet files securely with proper permissions
- Use environment variables for sensitive configuration
- Consider using hardware wallets for production

### Data Privacy

- **Review data before migration**: Ensure no sensitive information
- **Use encryption**: Encrypt sensitive data before storage
- **Access control**: Limit who can perform migrations
- **Audit logs**: Track all migration operations

### Data Verification

The system includes automatic data verification:

- **SHA-256 hashing**: All data is hashed before storage
- **Hash verification**: Retrieved data is verified against stored hash
- **Compression integrity**: Decompression validates data integrity

## Testing

### Run Tests

```bash
# Run knowledge base tests
npm test -- src/knowledge-base

# Run with coverage
npm test -- --coverage src/knowledge-base
```

### Test Coverage

The test suite includes:

- ✅ Arweave client initialization
- ✅ Memory extraction from database
- ✅ Emotional memory extraction
- ✅ Complete knowledge base extraction
- ✅ Memory statistics calculation
- ✅ Migration configuration
- ✅ Migration history tracking
- ✅ Error handling for missing tables

## Migration Workflow

### Complete Migration Process

1. **Extract Knowledge Base**
   ```typescript
   const kb = await migration.prepareKnowledgeBase('agent-id');
   ```

2. **Estimate Cost**
   ```typescript
   const cost = await migration.estimateMigrationCost('agent-id');
   ```

3. **Migrate to Arweave**
   ```typescript
   const result = await migration.migrateToArweave('agent-id');
   ```

4. **Verify Transaction**
   ```typescript
   const status = await migration.getTransactionStatus(result.transaction_id);
   ```

5. **Store Metadata**
   ```typescript
   // Metadata is automatically stored in database
   const history = await migration.getMigrationHistory('agent-id');
   ```

## Troubleshooting

### Common Issues

#### Insufficient Balance

```typescript
// Check balance before migration
const balance = await migration.getWalletBalance();
const cost = await migration.estimateMigrationCost('agent-id');

if (parseFloat(balance) < parseFloat(cost)) {
  console.error('Insufficient balance!');
  console.log('Need to add:', parseFloat(cost) - parseFloat(balance), 'AR');
}
```

#### Transaction Not Confirmed

Arweave transactions can take time to confirm (5-15 minutes):

```typescript
// Wait for confirmation
let status = await migration.getTransactionStatus(txId);
while (!status.confirmed) {
  console.log('Waiting for confirmation...');
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
  status = await migration.getTransactionStatus(txId);
}
```

#### Database Tables Missing

The system gracefully handles missing database tables:

```typescript
// Memory extraction returns empty arrays if tables don't exist
const memories = await memoryExtractor.extractAgentMemories('agent-id');
// Returns [] if agent_memories table doesn't exist
```

## Future Enhancements

- **Incremental Migrations**: Only migrate new/changed data
- **Bundlr Network Integration**: Faster uploads for large datasets
- **Query System**: Query archived data without full retrieval
- **Multi-Network Support**: Support for other permanent storage networks
- **Automated Backups**: Scheduled automatic migrations
- **Data Encryption**: End-to-end encryption for sensitive data

## Resources

- [Arweave Documentation](https://docs.arweave.org/)
- [Arweave.js Library](https://github.com/ArweaveTeam/arweave-js)
- [Bundlr Network](https://docs.bundlr.network/)
- [VEXEL Project Documentation](../README.md)

## License

This component is part of the VEXEL project. License TBD in Phase 4.
