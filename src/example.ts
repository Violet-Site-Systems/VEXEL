// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Example usage of VEXEL data layer
 * 
 * This script demonstrates:
 * - Creating agents
 * - Managing capabilities
 * - Updating status
 * - IPFS integration
 */

import { db, AgentRepository, RuntimeStatus, ipfsClient, AgentService, AgentMetadata } from './index';

async function main() {
  console.log('🚀 VEXEL Data Layer Example\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.error('❌ Database connection failed');
      return;
    }
    console.log('✅ Database connected\n');

    // Initialize repository
    const repository = new AgentRepository(db);

    // Create an agent
    console.log('2. Creating a new agent...');
    const agent = await repository.createAgent({
      did: `did:vexel:example:${Date.now()}`,
      name: 'Example Agent',
      description: 'A demonstration agent for VEXEL',
      owner_address: '0x1234567890123456789012345678901234567890',
      runtime_status: RuntimeStatus.ACTIVE,
    });
    console.log('✅ Agent created:', {
      id: agent.id,
      did: agent.did,
      name: agent.name,
      status: agent.runtime_status,
    });
    console.log();

    // Add capabilities
    console.log('3. Adding capabilities...');
    const communicationCap = await repository.createCapability({
      agent_id: agent.id,
      capability_name: 'communication',
      capability_value: {
        protocols: ['http', 'websocket'],
        level: 5,
        languages: ['en', 'es'],
      },
    });
    console.log('✅ Communication capability added');

    const reasoningCap = await repository.createCapability({
      agent_id: agent.id,
      capability_name: 'reasoning',
      capability_value: {
        type: 'logical',
        level: 7,
        domains: ['general', 'mathematics'],
      },
    });
    console.log('✅ Reasoning capability added');
    console.log();

    // Get all capabilities
    console.log('4. Retrieving capabilities...');
    const capabilities = await repository.getAgentCapabilities(agent.id);
    console.log(`✅ Found ${capabilities.length} capabilities:`);
    capabilities.forEach((cap: any) => {
      console.log(`   - ${cap.capability_name} (version ${cap.version})`);
    });
    console.log();

    // Update agent status
    console.log('5. Updating agent status...');
    await repository.updateAgentStatus(agent.id, RuntimeStatus.SLEEP, 'Testing status change');
    console.log('✅ Status updated to SLEEP');
    
    await repository.updateAgentStatus(agent.id, RuntimeStatus.ACTIVE, 'Reactivating agent');
    console.log('✅ Status updated to ACTIVE');
    console.log();

    // Get status history
    console.log('6. Retrieving status history...');
    const history = await repository.getAgentStatusHistory(agent.id);
    console.log(`✅ Found ${history.length} status changes:`);
    history.forEach((change: any, index: number) => {
      console.log(`   ${index + 1}. ${change.previous_status || 'INITIAL'} → ${change.new_status} (${change.reason || 'No reason'})`);
    });
    console.log();

    // IPFS integration (if available)
    console.log('7. Testing IPFS integration...');
    try {
      const ipfsConnected = await ipfsClient.testConnection();
      if (ipfsConnected) {
        console.log('✅ IPFS connected');
        
        // Create metadata
        const metadata: AgentMetadata = {
          name: agent.name,
          description: agent.description || '',
          did: agent.did,
          owner_address: agent.owner_address,
          capabilities: capabilities.map((c: any) => ({
            name: c.capability_name,
            value: c.capability_value,
          })),
          version: '1.0.0',
          created_at: agent.created_at.toISOString(),
        };

        // Store on IPFS
        const ipfsHash = await ipfsClient.storeMetadata(metadata);
        console.log('✅ Metadata stored on IPFS:', ipfsHash);

        // Update agent with IPFS hash
        await repository.updateAgent(agent.id, { ipfs_metadata_hash: ipfsHash });
        console.log('✅ Agent updated with IPFS hash');

        // Retrieve from IPFS
        const retrieved = await ipfsClient.retrieveMetadata(ipfsHash);
        console.log('✅ Metadata retrieved from IPFS:', {
          name: retrieved.name,
          capabilityCount: retrieved.capabilities.length,
        });
      } else {
        console.log('⚠️  IPFS not available (this is optional)');
      }
    } catch (error) {
      console.log('⚠️  IPFS not available (this is optional)');
    }
    console.log();

    // High-level service example
    console.log('8. Using high-level service...');
    const service = new AgentService(db, ipfsClient);
    
    // Get agent with metadata
    const agentData = await service.getAgentWithMetadata(agent.id);
    if (agentData) {
      console.log('✅ Agent data retrieved:', {
        id: agentData.agent?.id,
        did: agentData.agent?.did,
        hasMetadata: !!agentData.metadata,
      });
    }
    console.log();

    // Get all agents
    console.log('9. Listing all agents...');
    const allAgents = await repository.getAllAgents(10, 0);
    console.log(`✅ Found ${allAgents.length} agent(s) in database`);
    console.log();

    // Get active agents count
    console.log('10. Counting active agents...');
    const activeCount = await repository.getActiveAgentsCount();
    console.log(`✅ Active agents: ${activeCount}`);
    console.log();

    console.log('🎉 Example completed successfully!\n');
    console.log('Summary:');
    console.log(`- Created agent: ${agent.did}`);
    console.log(`- Added ${capabilities.length} capabilities`);
    console.log(`- Recorded ${history.length} status changes`);
    console.log(`- Total agents in database: ${allAgents.length}`);
    console.log(`- Active agents: ${activeCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close database connection
    await db.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export default main;
