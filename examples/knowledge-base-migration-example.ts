// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Example: Knowledge Base Migration to Arweave
 * 
 * This example demonstrates how to migrate agent knowledge bases
 * to Arweave for permanent storage and capability transfer.
 */

import { KnowledgeBaseMigration } from '../src/knowledge-base';
import { DatabaseClient } from '../src/database/client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('=== VEXEL Knowledge Base Migration Example ===\n');

  // Initialize database connection
  const db = new DatabaseClient({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'vexel',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await db.connect();
    console.log('✓ Connected to database\n');

    // Initialize migration service
    const migration = new KnowledgeBaseMigration(db);

    // Load or generate Arweave wallet
    const walletPath = path.join(__dirname, '..', 'arweave-wallet.json');
    let wallet;

    if (fs.existsSync(walletPath)) {
      console.log('Loading existing Arweave wallet...');
      wallet = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    } else {
      console.log('Generating new Arweave wallet...');
      wallet = await migration.generateArweaveWallet();
      
      // Save wallet (in production, use secure storage!)
      fs.writeFileSync(walletPath, JSON.stringify(wallet, null, 2));
      console.log('✓ Wallet saved to:', walletPath);
      console.log('⚠️  IMPORTANT: Keep this wallet file secure!\n');
    }

    migration.setArweaveWallet(wallet);

    // Get wallet address and balance
    const walletAddress = await migration.getArweaveClient().getWalletAddress();
    console.log('Wallet Address:', walletAddress);

    try {
      const balance = await migration.getWalletBalance();
      console.log('Wallet Balance:', balance, 'AR\n');

      if (parseFloat(balance) === 0) {
        console.log('⚠️  Wallet has zero balance!');
        console.log('To perform actual migrations, add AR tokens to:', walletAddress);
        console.log('Get testnet tokens from: https://faucet.arweave.net/\n');
      }
    } catch (error) {
      console.log('⚠️  Could not fetch balance (offline mode)\n');
    }

    // Test connection
    console.log('Testing Arweave connection...');
    const connected = await migration.testConnection();
    if (connected) {
      console.log('✓ Connected to Arweave network\n');
    } else {
      console.log('✗ Could not connect to Arweave (offline mode)\n');
    }

    // Example: Create sample agent memory
    const agentId = 'example-agent-001';
    console.log('=== Example 1: Memory Extraction ===\n');

    const memoryExtractor = migration.getMemoryExtractor();

    // Store sample memories (for demonstration)
    console.log('Creating sample agent memories...');
    
    await memoryExtractor.storeAgentMemory({
      agent_id: agentId,
      memory_type: 'conversation',
      content: {
        message: 'Hello! How can I help you today?',
        context: 'greeting',
      },
    });

    await memoryExtractor.storeAgentMemory({
      agent_id: agentId,
      memory_type: 'skill',
      content: {
        skill_name: 'code_review',
        proficiency: 0.85,
        last_used: new Date().toISOString(),
      },
    });

    await memoryExtractor.storeEmotionalMemory({
      agent_id: agentId,
      emotion_type: 'curiosity',
      intensity: 0.7,
      context: 'Learning new task',
    });

    console.log('✓ Sample memories created\n');

    // Get memory statistics
    console.log('=== Example 2: Memory Statistics ===\n');
    
    try {
      const stats = await memoryExtractor.getMemoryStats(agentId);
      console.log('Memory Statistics:');
      console.log('  Total Memories:', stats.total_memories);
      console.log('  Emotional Memories:', stats.emotional_memories);
      console.log('  Capabilities:', stats.capabilities);
      if (stats.oldest_memory) {
        console.log('  Oldest Memory:', stats.oldest_memory.toISOString());
      }
      if (stats.newest_memory) {
        console.log('  Newest Memory:', stats.newest_memory.toISOString());
      }
      console.log();
    } catch (error) {
      console.log('⚠️  Could not fetch memory stats (tables may not exist)\n');
    }

    // Estimate migration cost
    console.log('=== Example 3: Cost Estimation ===\n');
    
    try {
      const cost = await migration.estimateMigrationCost(agentId);
      console.log('Estimated migration cost:', cost, 'AR');
      console.log('With compression, actual cost is typically 30% of original\n');
    } catch (error) {
      console.log('⚠️  Could not estimate cost:', error.message, '\n');
    }

    // Prepare knowledge base (without actually migrating)
    console.log('=== Example 4: Knowledge Base Preparation ===\n');
    
    try {
      const knowledgeBase = await migration.prepareKnowledgeBase(agentId, {
        includeEmotionalMemories: true,
        includeCapabilities: true,
        compressionEnabled: true,
      });

      console.log('Knowledge Base Summary:');
      console.log('  Agent ID:', knowledgeBase.agent_id);
      console.log('  Agent DID:', knowledgeBase.agent_did);
      console.log('  Memories:', knowledgeBase.memories.length);
      console.log('  Emotional Memories:', knowledgeBase.emotional_memories.length);
      console.log('  Capabilities:', knowledgeBase.capabilities.length);
      console.log('  Version:', knowledgeBase.version);
      console.log('  Extracted At:', knowledgeBase.extracted_at.toISOString());
      console.log();

      // Show sample data
      if (knowledgeBase.memories.length > 0) {
        console.log('Sample Memory:');
        console.log(JSON.stringify(knowledgeBase.memories[0], null, 2));
        console.log();
      }

      if (knowledgeBase.emotional_memories.length > 0) {
        console.log('Sample Emotional Memory:');
        console.log(JSON.stringify(knowledgeBase.emotional_memories[0], null, 2));
        console.log();
      }
    } catch (error) {
      console.log('⚠️  Could not prepare knowledge base:', error.message, '\n');
    }

    // Migration (only if wallet has balance)
    console.log('=== Example 5: Migration (Demo) ===\n');
    
    try {
      const balance = await migration.getWalletBalance();
      
      if (parseFloat(balance) > 0) {
        console.log('Performing actual migration to Arweave...');
        
        const result = await migration.migrateToArweave(agentId, {
          compressionEnabled: true,
          includeEmotionalMemories: true,
          includeCapabilities: true,
        });

        console.log('\n✓ Migration completed successfully!');
        console.log('\nMigration Result:');
        console.log('  Transaction ID:', result.transaction_id);
        console.log('  Arweave URL:', result.arweave_url);
        console.log('  Original Size:', result.data_size, 'bytes');
        console.log('  Compressed Size:', result.compressed_size, 'bytes');
        console.log('  Compression Ratio:', 
          ((1 - result.compressed_size / result.data_size) * 100).toFixed(2), '%');
        console.log('  Cost Estimate:', result.cost_estimate);
        console.log('  Timestamp:', result.timestamp.toISOString());
        console.log();

        // Check transaction status
        console.log('Checking transaction status...');
        const status = await migration.getTransactionStatus(result.transaction_id);
        console.log('  Confirmed:', status.confirmed);
        if (status.confirmations) {
          console.log('  Confirmations:', status.confirmations);
        }
        console.log();

        // Get migration history
        console.log('=== Example 6: Migration History ===\n');
        const history = await migration.getMigrationHistory(agentId);
        console.log(`Found ${history.length} migration(s):`);
        history.forEach((record, index) => {
          console.log(`\nMigration ${index + 1}:`);
          console.log('  Date:', record.created_at.toISOString());
          console.log('  Transaction ID:', record.arweave_tx_id);
          console.log('  Type:', record.migration_type);
          console.log('  Data Hash:', record.data_hash);
        });
        console.log();

        // Retrieve and verify
        console.log('=== Example 7: Data Retrieval ===\n');
        console.log('Retrieving knowledge base from Arweave...');
        
        const retrieved = await migration.retrieveFromArweave(result.transaction_id);
        console.log('✓ Successfully retrieved knowledge base');
        console.log('  Agent ID:', retrieved.agent_id);
        console.log('  Memories:', retrieved.memories.length);
        console.log('  Emotional Memories:', retrieved.emotional_memories.length);
        console.log('  Capabilities:', retrieved.capabilities.length);
        console.log();

      } else {
        console.log('Skipping actual migration (wallet has zero balance)');
        console.log('To perform real migrations:');
        console.log('1. Get testnet AR from: https://faucet.arweave.net/');
        console.log('2. Send AR to wallet:', walletAddress);
        console.log('3. Run this example again\n');
      }
    } catch (error) {
      console.log('⚠️  Migration demo skipped:', error.message, '\n');
    }

    console.log('=== Example Complete ===\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.disconnect();
    console.log('✓ Disconnected from database');
  }
}

// Run example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
