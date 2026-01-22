// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Example: API Gateway Usage
 * Demonstrates how to start and use the VEXEL API Gateway
 */

import { APIGateway } from '../src/api';

async function main() {
  console.log('Starting VEXEL API Gateway Example...\n');

  // Initialize API Gateway
  const gateway = new APIGateway({
    port: 3000,
    jwtSecret: 'example-secret-key-change-in-production',
    corsOrigin: '*',
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // 100 requests per window
  });

  // Start the gateway
  await gateway.start();

  // Get WebSocket server instance
  const wsServer = gateway.getWebSocketServer();

  console.log('\n✅ API Gateway started successfully!\n');
  console.log('📝 Example operations:\n');

  // Example: Get semantic layer
  const semanticLayer = wsServer.getSemanticLayer();
  console.log('1. Semantic Layer initialized');

  // Example: Translate a message
  const humanMessage = semanticLayer.translateHumanToCopilot(
    'Hello, can you help me with this task?'
  );
  console.log('2. Translated human message:');
  console.log('   Original:', humanMessage.originalMessage);
  console.log('   Translated:', humanMessage.translatedMessage.substring(0, 80) + '...');

  // Example: Get emotional tracker
  const emotionalTracker = wsServer.getEmotionalTracker();
  console.log('\n3. Emotional Tracker initialized');

  // Example: Infer emotional state
  const emotionalState = emotionalTracker.inferEmotionalState(
    'I am so excited about this project!'
  );
  console.log('4. Inferred emotional state:');
  console.log('   Emotion:', emotionalState.emotion);
  console.log('   Intensity:', emotionalState.intensity);

  // Example: Track emotional state
  emotionalTracker.updateState('user-123', emotionalState);
  console.log('5. Emotional state tracked for user-123');

  // Example: Broadcast WebSocket message
  console.log('\n6. WebSocket server ready for connections');
  console.log('   Connected clients:', wsServer.getConnectedClientsCount());

  console.log('\n📚 Next steps:');
  console.log('   - Visit http://localhost:3000/api-docs for API documentation');
  console.log('   - Use curl or Postman to test REST endpoints');
  console.log('   - Connect WebSocket client to ws://localhost:3000');
  console.log('   - Check http://localhost:3000/health for server status');

  console.log('\n⚠️  Press Ctrl+C to stop the server\n');

  // Keep the process running
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down gracefully...');
    await gateway.stop();
    process.exit(0);
  });
}

// Run the example
main().catch((error) => {
  console.error('Error running API Gateway example:', error);
  process.exit(1);
});
