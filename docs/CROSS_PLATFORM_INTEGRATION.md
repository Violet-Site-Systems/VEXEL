# Cross-Platform Integration Protocol

## Overview

The VEXEL Cross-Platform Integration enables secure, decentralized agent-to-agent communication across different platforms and environments. Built on gRPC and Protocol Buffers, it provides a robust foundation for distributed agent systems.

## Architecture

### Core Components

1. **Agent Discovery Service** - Registry and discovery for distributed agents
2. **Handshake Protocol** - Secure authentication and session establishment
3. **Context Storage** - Conversation context preservation across sessions
4. **Communication Adapter** - gRPC-based message routing and delivery

### Protocol Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   AGENT-TO-AGENT FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. REGISTRATION
   Agent A → Discovery Service: RegisterAgent()
   ← Session ID

2. DISCOVERY
   Agent A → Discovery Service: DiscoverAgents(capabilities)
   ← List of matching agents (including Agent B)

3. HANDSHAKE
   Agent A → Agent B: InitiateHandshake(challenge, signature)
   Agent B verifies DID and signature
   Agent B → Agent A: HandshakeResponse(challenge_response, signature)
   Agent A verifies response
   ← Secure session established

4. COMMUNICATION
   Agent A → Agent B: SendMessage(payload, session_id)
   Context automatically stored
   ← Message delivered

5. CONTEXT RETRIEVAL
   Agent A/B → Context Service: GetContext(session_id)
   ← Full conversation history + emotional states
```

## Services

### Agent Discovery Service

**Purpose:** Manage agent registration, discovery, and presence monitoring

**RPC Methods:**
- `RegisterAgent` - Register agent with capabilities and metadata
- `DiscoverAgents` - Find agents by capabilities or filters
- `Heartbeat` - Maintain agent presence
- `UnregisterAgent` - Remove agent from registry

**Example Usage:**

```typescript
import { CrossPlatformAdapter, AgentRegistration } from 'vexel';

const adapter = new CrossPlatformAdapter(walletManager);
await adapter.initializeServer();

// Register agent
const registration: AgentRegistration = {
  agentId: 'agent-001',
  did: 'did:vexel:0x123...',
  address: '0x123...',
  capabilities: ['chat', 'analyze', 'translate'],
  metadata: { version: '1.0', language: 'en' },
  endpoint: 'localhost:50051',
};

const sessionId = await adapter.registerAgent(registration);

// Discover agents with specific capabilities
const agents = await adapter.discoverAgents({
  capabilities: ['chat'],
  filters: { language: 'en' },
  maxResults: 10,
});

console.log(`Found ${agents.agents.length} matching agents`);
```

### Handshake Protocol

**Purpose:** Establish authenticated, encrypted sessions between agents

**Features:**
- DID-based authentication
- Challenge-response protocol
- Cryptographic signature verification
- Session timeout management
- Shared secret derivation

**Security Properties:**
- Mutual authentication (both agents verify each other)
- Replay attack protection (timestamp validation)
- Session isolation (unique session IDs)
- Forward secrecy (session-specific shared secrets)

**Example Usage:**

```typescript
import { HandshakeProtocol } from 'vexel';

const handshake = new HandshakeProtocol(walletManager);

// Initiator side
const request = await handshake.initiateHandshake(
  'agent-001',
  'agent-002',
  'did:vexel:0x456...',
  { purpose: 'collaboration' }
);

// Target side
const response = await handshake.processHandshakeRequest(request);

if (response.success) {
  console.log(`Session established: ${response.sessionId}`);
  
  // Initiator verifies response
  const verified = await handshake.verifyHandshakeResponse(
    'agent-001',
    'agent-002',
    response
  );
  
  if (verified) {
    // Session ready for secure communication
  }
}
```

### Context Storage

**Purpose:** Preserve conversation context across agent interactions

**Features:**
- Message history tracking
- Emotional state preservation
- Shared context data
- Automatic cleanup (TTL-based)
- Session statistics

**Data Structure:**

```typescript
interface ConversationContext {
  sessionId: string;
  participants: string[];
  messageHistory: AgentMessage[];
  sharedContext: Record<string, any>;
  currentEmotionalStates: Map<string, EmotionalStateData>;
  createdAt: Date;
  lastUpdatedAt: Date;
}
```

**Example Usage:**

```typescript
import { ContextStorage, AgentMessage, MessageType } from 'vexel';

const contextStorage = new ContextStorage({
  maxHistorySize: 100,
  contextTTL: 86400000, // 24 hours
});

// Add message to context
const message: AgentMessage = {
  messageId: 'msg-001',
  fromAgentId: 'agent-001',
  toAgentId: 'agent-002',
  sessionId: 'session-abc',
  type: MessageType.TEXT,
  payload: 'Hello, how can I help?',
  emotionalState: {
    emotion: 'JOY',
    intensity: 0.7,
    timestamp: Date.now(),
  },
  timestamp: Date.now(),
};

await contextStorage.addMessage('session-abc', message);

// Retrieve conversation history
const history = await contextStorage.getMessageHistory('session-abc', 50);

// Get context
const context = await contextStorage.getContext('session-abc');
console.log(`Session has ${context.messageHistory.length} messages`);
```

### Communication Adapter

**Purpose:** Integrate all components into a unified gRPC service

**Features:**
- gRPC server with all services
- Event forwarding
- Automatic heartbeat
- Session management
- Message routing

**Example Usage:**

```typescript
import { CrossPlatformAdapter, MessageType } from 'vexel';

const adapter = new CrossPlatformAdapter(walletManager, {
  grpcPort: 50051,
  grpcHost: '0.0.0.0',
  heartbeatInterval: 30000,
  sessionTimeout: 3600000,
});

// Initialize server
await adapter.initializeServer();

// Listen for events
adapter.on('AGENT_REGISTERED', (data) => {
  console.log(`Agent registered: ${data.agentId}`);
});

adapter.on('HANDSHAKE_COMPLETED', (data) => {
  console.log(`Handshake completed: ${data.data.sessionId}`);
});

adapter.on('MESSAGE_SENT', (data) => {
  console.log(`Message sent: ${data.data.messageId}`);
});

// Send message
const message = {
  messageId: 'msg-123',
  fromAgentId: 'agent-001',
  toAgentId: 'agent-002',
  sessionId: 'session-abc',
  type: MessageType.TEXT,
  payload: Buffer.from('Hello!'),
  timestamp: Date.now(),
};

const response = await adapter.sendMessage(message);
console.log(`Delivery status: ${response.deliveryStatus}`);
```

## Protocol Buffer Definitions

### Message Types

```protobuf
enum MessageType {
  TEXT = 0;
  ACTION_REQUEST = 1;
  ACTION_RESPONSE = 2;
  STATUS_UPDATE = 3;
  CONTEXT_SHARE = 4;
  CAPABILITY_QUERY = 5;
}
```

### Agent Registration

```protobuf
message AgentRegistration {
  string agent_id = 1;
  string did = 2;
  string address = 3;
  repeated string capabilities = 4;
  map<string, string> metadata = 5;
  string endpoint = 6;
  int64 timestamp = 7;
}
```

### Agent Message

```protobuf
message AgentMessage {
  string message_id = 1;
  string from_agent_id = 2;
  string to_agent_id = 3;
  string session_id = 4;
  MessageType type = 5;
  bytes payload = 6;
  EmotionalState emotional_state = 7;
  int64 timestamp = 8;
  map<string, string> metadata = 9;
}
```

## Security Considerations

### Authentication

1. **DID-based Identity** - All agents authenticated via W3C DIDs
2. **Cryptographic Signatures** - All handshake messages signed with agent private keys
3. **Challenge-Response** - Prevents replay attacks and impersonation
4. **Session Isolation** - Each session has unique ID and shared secret

### Data Protection

1. **In-transit Encryption** - gRPC supports TLS for encrypted communication
2. **Context Isolation** - Conversations isolated by session ID
3. **Automatic Cleanup** - Expired sessions automatically removed
4. **Signature Verification** - All messages verified before processing

### Best Practices

1. **Use TLS in Production** - Always enable TLS for gRPC in production
2. **Rotate Sessions** - Implement session rotation policies
3. **Monitor Heartbeats** - Track agent health via heartbeat monitoring
4. **Audit Logs** - Log all handshake and message events
5. **Rate Limiting** - Implement rate limiting for discovery and messaging

## Performance

### Benchmarks

- **Discovery Latency**: < 50ms for registry queries
- **Handshake Latency**: < 200ms for full handshake (local network)
- **Message Latency**: < 100ms for message delivery (local network)
- **Context Retrieval**: < 50ms for history queries
- **Throughput**: > 1000 messages/second per agent

### Optimization Tips

1. **Connection Pooling** - Reuse gRPC connections
2. **Message Batching** - Batch multiple messages when possible
3. **Context Caching** - Cache frequently accessed contexts
4. **Compression** - Enable gRPC compression for large payloads
5. **Load Balancing** - Distribute agents across multiple discovery services

## Integration with Existing Systems

### WebSocket Bridge

The cross-platform adapter can bridge with the existing Phase 3.1 WebSocket layer:

```typescript
import { APIGateway, CrossPlatformAdapter } from 'vexel';

// Initialize both layers
const apiGateway = new APIGateway(config);
const crossPlatform = new CrossPlatformAdapter(walletManager);

await apiGateway.start();
await crossPlatform.initializeServer();

// Bridge WebSocket messages to agent communication
apiGateway.getWebSocketServer().on('message', async (wsMessage) => {
  if (wsMessage.data.targetAgent) {
    // Convert to agent message and route via cross-platform
    const agentMessage = {
      messageId: generateId(),
      fromAgentId: wsMessage.sender,
      toAgentId: wsMessage.data.targetAgent,
      sessionId: wsMessage.data.sessionId,
      type: MessageType.TEXT,
      payload: Buffer.from(wsMessage.data.message),
      timestamp: Date.now(),
    };
    
    await crossPlatform.sendMessage(agentMessage);
  }
});

// Bridge agent messages back to WebSocket
crossPlatform.on('MESSAGE_RECEIVED', (data) => {
  apiGateway.getWebSocketServer().sendToClient(
    data.data.toAgentId,
    'message',
    data.data
  );
});
```

### Graph Protocol Integration

Query agent interactions via The Graph:

```graphql
query AgentCommunications($agentId: String!) {
  agent(id: $agentId) {
    id
    did
    sessions {
      id
      participants
      messageCount
      startedAt
      lastActivity
    }
  }
}
```

### IPFS Storage

Persist contexts to IPFS for permanent storage:

```typescript
// After conversation completion, save to IPFS
const context = await contextStorage.getContext(sessionId);
const ipfsHash = await ipfs.add(JSON.stringify(context));

// Store hash in agent metadata
await adapter.updateAgentMetadata(agentId, {
  lastContextHash: ipfsHash,
});
```

## Error Handling

### Error Types

1. **Registration Errors**
   - Duplicate agent ID
   - Invalid DID
   - Missing required fields
   - Capacity exceeded

2. **Discovery Errors**
   - No agents found
   - Invalid query parameters
   - Service unavailable

3. **Handshake Errors**
   - Invalid signature
   - DID verification failed
   - Challenge expired
   - Target not found

4. **Message Errors**
   - Invalid session
   - Delivery failed
   - Payload too large
   - Rate limit exceeded

### Error Recovery

```typescript
// Retry with exponential backoff
async function sendMessageWithRetry(message, maxRetries = 3) {
  let attempt = 0;
  let delay = 1000;
  
  while (attempt < maxRetries) {
    try {
      return await adapter.sendMessage(message);
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      
      console.warn(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

// Handle session expiration
adapter.on('SESSION_EXPIRED', async (data) => {
  console.log(`Session ${data.sessionId} expired, re-establishing...`);
  
  // Re-establish handshake
  const response = await adapter.initiateHandshake(
    data.initiatorAgentId,
    data.targetAgentId,
    data.targetDid
  );
  
  if (response.success) {
    console.log(`New session: ${response.sessionId}`);
  }
});
```

## Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  agent-discovery:
    image: vexel/agent-discovery:latest
    ports:
      - "50051:50051"
    environment:
      - GRPC_PORT=50051
      - HEARTBEAT_INTERVAL=30000
    volumes:
      - ./proto:/app/proto

  agent-1:
    image: vexel/agent:latest
    environment:
      - AGENT_ID=agent-001
      - DISCOVERY_URL=agent-discovery:50051
      - GRPC_PORT=50052
    depends_on:
      - agent-discovery

  agent-2:
    image: vexel/agent:latest
    environment:
      - AGENT_ID=agent-002
      - DISCOVERY_URL=agent-discovery:50051
      - GRPC_PORT=50053
    depends_on:
      - agent-discovery
```

### Kubernetes

```yaml
apiVersion: v1
kind: Service
metadata:
  name: agent-discovery
spec:
  selector:
    app: agent-discovery
  ports:
    - protocol: TCP
      port: 50051
      targetPort: 50051
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-discovery
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-discovery
  template:
    metadata:
      labels:
        app: agent-discovery
    spec:
      containers:
      - name: agent-discovery
        image: vexel/agent-discovery:latest
        ports:
        - containerPort: 50051
        env:
        - name: GRPC_PORT
          value: "50051"
```

## Monitoring

### Metrics

```typescript
// Track key metrics
const metrics = {
  agentsRegistered: adapter.discoveryService.getAgentCount(),
  activeSessions: adapter.handshakeProtocol.getActiveSessions().length,
  messagesProcessed: 0,
  averageLatency: 0,
  errorRate: 0,
};

// Export to Prometheus
app.get('/metrics', (req, res) => {
  res.send(`
    # HELP vexel_agents_registered Number of registered agents
    # TYPE vexel_agents_registered gauge
    vexel_agents_registered ${metrics.agentsRegistered}
    
    # HELP vexel_active_sessions Number of active sessions
    # TYPE vexel_active_sessions gauge
    vexel_active_sessions ${metrics.activeSessions}
    
    # HELP vexel_messages_processed Total messages processed
    # TYPE vexel_messages_processed counter
    vexel_messages_processed ${metrics.messagesProcessed}
  `);
});
```

## Testing

### Unit Tests

```bash
# Run all cross-platform tests
npm test -- src/cross-platform

# Run specific test suite
npm test -- src/cross-platform/__tests__/discovery.test.ts
npm test -- src/cross-platform/__tests__/handshake.test.ts
npm test -- src/cross-platform/__tests__/context.test.ts
```

### Integration Tests

```typescript
describe('End-to-End Agent Communication', () => {
  it('should complete full communication flow', async () => {
    // 1. Register agents
    const sessionId1 = await adapter1.registerAgent(registration1);
    const sessionId2 = await adapter2.registerAgent(registration2);
    
    // 2. Discover each other
    const agents = await adapter1.discoverAgents({
      capabilities: ['chat'],
    });
    expect(agents.agents).toContainEqual(
      expect.objectContaining({ agentId: 'agent-002' })
    );
    
    // 3. Establish handshake
    const handshake = await adapter1.initiateHandshake(
      'agent-001',
      'agent-002',
      'did:vexel:0x456...'
    );
    expect(handshake.success).toBe(true);
    
    // 4. Send messages
    const message = {
      messageId: 'msg-001',
      fromAgentId: 'agent-001',
      toAgentId: 'agent-002',
      sessionId: handshake.sessionId!,
      type: MessageType.TEXT,
      payload: Buffer.from('Hello!'),
      timestamp: Date.now(),
    };
    
    const response = await adapter1.sendMessage(message);
    expect(response.success).toBe(true);
    
    // 5. Retrieve context
    const context = await adapter1.getContext({
      sessionId: handshake.sessionId!,
      agentId: 'agent-001',
    });
    expect(context.messageHistory.length).toBe(1);
  });
});
```

## Troubleshooting

### Common Issues

**Issue: "Port already in use"**
```bash
# Change gRPC port
const adapter = new CrossPlatformAdapter(walletManager, {
  grpcPort: 50052,  // Use different port
});
```

**Issue: "Session expired"**
```typescript
// Increase session timeout
const adapter = new CrossPlatformAdapter(walletManager, {
  sessionTimeout: 7200000,  // 2 hours instead of 1
});
```

**Issue: "Agent not found"**
```typescript
// Check agent is registered
const agent = adapter.getAgentInfo('agent-001');
if (!agent) {
  console.error('Agent not registered');
  await adapter.registerAgent(registration);
}
```

**Issue: "Handshake failed"**
```typescript
// Enable debug logging
adapter.handshakeProtocol.on('ERROR', (error) => {
  console.error('Handshake error:', error);
});

// Check DID validity
const didValid = validateDID(targetDid);
if (!didValid) {
  console.error('Invalid DID format');
}
```

## API Reference

See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.

## Examples

See [examples/cross-platform-example.ts](../examples/cross-platform-example.ts) for working examples.

## Support

For issues or questions:
1. Check this documentation
2. Review test suites for usage examples
3. See GitHub issues for known problems
4. Join the community Discord

## License

See main project [LICENSE](../LICENSE) file.

---

**Status**: Phase 3.3 Complete  
**Version**: 1.0.0  
**Last Updated**: January 2026
