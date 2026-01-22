// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Example: WebSocket Client
 * Demonstrates how to connect to and use the VEXEL WebSocket server
 * 
 * Prerequisites:
 * 1. Install socket.io-client: npm install socket.io-client
 * 2. Start the API Gateway: npm run api:start
 * 3. Run this example: npx ts-node examples/websocket-client-example.ts
 */

import { io, Socket } from 'socket.io-client';

async function main() {
  console.log('🔌 Connecting to VEXEL WebSocket Server...\n');

  // Connect to WebSocket server
  const socket: Socket = io('http://localhost:3000', {
    auth: {
      userId: 'example-user-123',
    },
  });

  // Connection event
  socket.on('connect', () => {
    console.log('✅ Connected to WebSocket server');
    console.log('   Socket ID:', socket.id);
    console.log('\n📤 Sending test messages...\n');

    // Example 1: Send a message from human to Copilot
    socket.emit('message', {
      from: 'human',
      to: 'copilot',
      message: 'Hello! I need help with my agent configuration.',
      conversationId: 'conv-001',
    });

    console.log('1. Sent human message to Copilot');

    // Example 2: Update emotional state
    setTimeout(() => {
      socket.emit('emotional_state', {
        entityId: 'example-user-123',
        emotionalState: {
          emotion: 'JOY',
          intensity: 0.85,
          timestamp: new Date(),
          context: 'Successful task completion',
        },
      });
      console.log('2. Updated emotional state to JOY (0.85)');
    }, 1000);

    // Example 3: Send another message with different emotion
    setTimeout(() => {
      socket.emit('message', {
        from: 'human',
        to: 'copilot',
        message: 'I am excited to see the results!',
        conversationId: 'conv-001',
      });
      console.log('3. Sent excited message to Copilot');
    }, 2000);

    // Example 4: Request agent status update
    setTimeout(() => {
      socket.emit('action_request', {
        actionType: 'STATUS_CHANGE',
        agentId: 'agent-456',
        payload: {
          status: 'ACTIVE',
          reason: 'Reactivating agent',
        },
      });
      console.log('4. Requested agent status update');
    }, 3000);
  });

  // Message received
  socket.on('message', (data: any) => {
    console.log('\n📥 Received message:');
    console.log('   From:', data.data.from);
    console.log('   To:', data.data.to);
    console.log('   Original:', data.data.originalMessage.substring(0, 60) + '...');
    console.log('   Translated:', data.data.translatedMessage.substring(0, 60) + '...');
    if (data.data.emotionalState) {
      console.log('   Emotion:', data.data.emotionalState.emotion);
      console.log('   Intensity:', data.data.emotionalState.intensity);
    }
    if (data.data.status) {
      console.log('   Status:', data.data.status);
    }
  });

  // Emotional state update
  socket.on('emotional_state', (data: any) => {
    console.log('\n😊 Emotional state update:');
    console.log('   Entity:', data.entityId);
    if (data.emotionalState) {
      console.log('   Emotion:', data.emotionalState.emotion);
      console.log('   Intensity:', data.emotionalState.intensity);
    }
    if (data.transition) {
      console.log('   Transition detected!');
      console.log('   From:', data.transition.from);
      console.log('   To:', data.transition.to);
      console.log('   Intensity change:', data.transition.intensityChange);
    }
  });

  // Agent status update
  socket.on('agent_status', (data: any) => {
    console.log('\n🤖 Agent status update:');
    console.log('   Agent:', data.agentId || 'N/A');
    console.log('   Status:', data.status || 'N/A');
    console.log('   Timestamp:', data.timestamp);
  });

  // Action request
  socket.on('action_request', (data: any) => {
    console.log('\n⚡ Action request received:');
    console.log('   Action:', data.actionType);
    console.log('   Agent:', data.agentId);
    console.log('   Payload:', JSON.stringify(data.payload, null, 2));
  });

  // Error handling
  socket.on('error', (data: any) => {
    console.error('\n❌ WebSocket Error:');
    console.error('   Error:', data.error);
    console.error('   Details:', data.details);
  });

  // Disconnection
  socket.on('disconnect', (reason: string) => {
    console.log('\n🔌 Disconnected from server');
    console.log('   Reason:', reason);
  });

  // Connection error
  socket.on('connect_error', (error: Error) => {
    console.error('\n❌ Connection error:', error.message);
    console.error('\n⚠️  Make sure the API Gateway is running (npm run api:start)');
  });

  console.log('\n⚠️  Press Ctrl+C to disconnect and exit\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nDisconnecting...');
    socket.disconnect();
    process.exit(0);
  });
}

// Run the example
main().catch((error) => {
  console.error('Error running WebSocket client example:', error);
  process.exit(1);
});
