// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Cross-Platform Integration Example
 * Demonstrates agent-to-agent communication using VEXEL cross-platform layer
 */

import {
  WalletManager,
  CrossPlatformAdapter,
  AgentRegistration,
  MessageType,
  AgentMessage,
  CrossPlatformEvent,
} from '../src';

async function main() {
  console.log('🌉 VEXEL Cross-Platform Integration Example\n');

  // Step 1: Initialize wallet manager
  console.log('Step 1: Initializing wallet manager...');
  const walletManager = new WalletManager({
    walletDir: './tmp/example-wallets',
    network: 'polygon-mumbai',
  });

  // Create wallets for two agents
  const wallet1 = await walletManager.createWallet('agent-alice');
  const wallet2 = await walletManager.createWallet('agent-bob');

  console.log(`  ✓ Agent Alice: ${wallet1.address}`);
  console.log(`  ✓ Agent Bob: ${wallet2.address}\n`);

  // Step 2: Initialize cross-platform adapters for both agents
  console.log('Step 2: Initializing cross-platform adapters...');

  const adapter1 = new CrossPlatformAdapter(walletManager, {
    grpcPort: 50051,
    grpcHost: '0.0.0.0',
    heartbeatInterval: 30000,
    sessionTimeout: 3600000,
  });

  const adapter2 = new CrossPlatformAdapter(walletManager, {
    grpcPort: 50052,
    grpcHost: '0.0.0.0',
    heartbeatInterval: 30000,
    sessionTimeout: 3600000,
  });

  // Initialize servers
  await adapter1.initializeServer();
  await adapter2.initializeServer();

  console.log('  ✓ Adapter 1 listening on port 50051');
  console.log('  ✓ Adapter 2 listening on port 50052\n');

  // Step 3: Register agents
  console.log('Step 3: Registering agents with discovery service...');

  const registration1: AgentRegistration = {
    agentId: 'agent-alice',
    did: `did:vexel:${wallet1.address}`,
    address: wallet1.address,
    capabilities: ['chat', 'analyze', 'translate'],
    metadata: { language: 'en', version: '1.0' },
    endpoint: 'localhost:50051',
  };

  const registration2: AgentRegistration = {
    agentId: 'agent-bob',
    did: `did:vexel:${wallet2.address}`,
    address: wallet2.address,
    capabilities: ['chat', 'summarize', 'research'],
    metadata: { language: 'en', version: '1.0' },
    endpoint: 'localhost:50052',
  };

  const sessionId1 = await adapter1.registerAgent(registration1);
  const sessionId2 = await adapter2.registerAgent(registration2);

  console.log(`  ✓ Alice registered: ${sessionId1}`);
  console.log(`  ✓ Bob registered: ${sessionId2}\n`);

  // Step 4: Discover agents
  console.log('Step 4: Discovering agents with chat capability...');

  const discoveryResult = await adapter1.discoverAgents({
    capabilities: ['chat'],
    maxResults: 10,
  });

  console.log(`  ✓ Found ${discoveryResult.agents.length} agents:`);
  discoveryResult.agents.forEach(agent => {
    console.log(`    - ${agent.agentId}: ${agent.capabilities.join(', ')}`);
  });
  console.log();

  // Step 5: Establish handshake
  console.log('Step 5: Establishing handshake between Alice and Bob...');

  // Set up event listeners
  adapter1.on(CrossPlatformEvent.HANDSHAKE_COMPLETED, (data) => {
    console.log(`  ✓ Handshake completed: ${data.data.sessionId}`);
  });

  const handshakeResponse = await adapter1.initiateHandshake(
    'agent-alice',
    'agent-bob',
    `did:vexel:${wallet2.address}`,
    { purpose: 'collaboration', topic: 'AI research' }
  );

  if (!handshakeResponse.success) {
    console.error('  ✗ Handshake failed:', handshakeResponse.message);
    await cleanup();
    return;
  }

  const conversationSession = handshakeResponse.sessionId!;
  console.log(`  ✓ Session established: ${conversationSession}\n`);

  // Step 6: Exchange messages
  console.log('Step 6: Exchanging messages...');

  adapter1.on(CrossPlatformEvent.MESSAGE_SENT, (data) => {
    console.log(`  → Alice sent: "${data.data.payload.toString()}"`);
  });

  adapter2.on(CrossPlatformEvent.MESSAGE_SENT, (data) => {
    console.log(`  → Bob sent: "${data.data.payload.toString()}"`);
  });

  // Message 1: Alice to Bob
  const message1: AgentMessage = {
    messageId: 'msg-001',
    fromAgentId: 'agent-alice',
    toAgentId: 'agent-bob',
    sessionId: conversationSession,
    type: MessageType.TEXT,
    payload: 'Hello Bob! How can we collaborate on AI research?',
    emotionalState: {
      emotion: 'ANTICIPATION',
      intensity: 0.7,
      timestamp: Date.now(),
      context: 'initiating collaboration',
    },
    timestamp: Date.now(),
  };

  const response1 = await adapter1.sendMessage(message1);
  console.log(`  ✓ Delivery status: ${response1.deliveryStatus}\n`);

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Message 2: Bob to Alice
  const message2: AgentMessage = {
    messageId: 'msg-002',
    fromAgentId: 'agent-bob',
    toAgentId: 'agent-alice',
    sessionId: conversationSession,
    type: MessageType.TEXT,
    payload: 'Hi Alice! I can help with research and summarization. What topic are you interested in?',
    emotionalState: {
      emotion: 'JOY',
      intensity: 0.8,
      timestamp: Date.now(),
      context: 'responding positively',
    },
    timestamp: Date.now(),
  };

  const response2 = await adapter2.sendMessage(message2);
  console.log(`  ✓ Delivery status: ${response2.deliveryStatus}\n`);

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Message 3: Alice to Bob
  const message3: AgentMessage = {
    messageId: 'msg-003',
    fromAgentId: 'agent-alice',
    toAgentId: 'agent-bob',
    sessionId: conversationSession,
    type: MessageType.TEXT,
    payload: 'I'm particularly interested in multi-agent systems and decentralized identity!',
    emotionalState: {
      emotion: 'JOY',
      intensity: 0.9,
      timestamp: Date.now(),
      context: 'excited about topic',
    },
    timestamp: Date.now(),
  };

  const response3 = await adapter1.sendMessage(message3);
  console.log(`  ✓ Delivery status: ${response3.deliveryStatus}\n`);

  // Step 7: Retrieve conversation context
  console.log('Step 7: Retrieving conversation context...');

  const context = await adapter1.getContext({
    sessionId: conversationSession,
    agentId: 'agent-alice',
    historyLimit: 10,
  });

  console.log(`  ✓ Session: ${context.sessionId}`);
  console.log(`  ✓ Messages in history: ${context.messageHistory.length}`);
  console.log(`  ✓ Created at: ${new Date(context.contextCreatedAt).toLocaleString()}`);
  console.log(`  ✓ Last updated: ${new Date(context.lastUpdatedAt).toLocaleString()}\n`);

  console.log('  Message history:');
  context.messageHistory.forEach((msg, idx) => {
    const payload = msg.payload instanceof Buffer 
      ? msg.payload.toString() 
      : msg.payload;
    const emotion = msg.emotionalState?.emotion || 'N/A';
    const intensity = msg.emotionalState?.intensity || 0;
    console.log(`    ${idx + 1}. [${msg.fromAgentId}]: ${payload}`);
    console.log(`       Emotion: ${emotion} (${(intensity * 100).toFixed(0)}%)`);
  });
  console.log();

  // Step 8: Get agent statistics
  console.log('Step 8: Getting statistics...');

  const agent1Info = adapter1.getAgentInfo('agent-alice');
  const agent2Info = adapter2.getAgentInfo('agent-bob');

  console.log('  Agent Alice:');
  console.log(`    Status: ${agent1Info?.status}`);
  console.log(`    Capabilities: ${agent1Info?.capabilities.join(', ')}`);
  console.log(`    Last seen: ${agent1Info ? new Date(agent1Info.lastSeen).toLocaleString() : 'N/A'}`);

  console.log('  Agent Bob:');
  console.log(`    Status: ${agent2Info?.status}`);
  console.log(`    Capabilities: ${agent2Info?.capabilities.join(', ')}`);
  console.log(`    Last seen: ${agent2Info ? new Date(agent2Info.lastSeen).toLocaleString() : 'N/A'}`);
  console.log();

  // Step 9: Cleanup
  console.log('Step 9: Cleaning up...');

  async function cleanup() {
    await adapter1.unregisterAgent();
    await adapter2.unregisterAgent();
    await adapter1.shutdown();
    await adapter2.shutdown();
  }

  await cleanup();

  console.log('  ✓ Agents unregistered');
  console.log('  ✓ Adapters shut down\n');

  console.log('✨ Example completed successfully!\n');
  console.log('Summary:');
  console.log('- 2 agents registered and discovered each other');
  console.log('- Secure handshake established with DID verification');
  console.log('- 3 messages exchanged with emotional state tracking');
  console.log('- Full conversation context preserved');
  console.log('- Clean shutdown completed\n');
}

// Run example
main().catch(error => {
  console.error('Error running example:', error);
  process.exit(1);
});
