# Phase 3.1: API Gateway + WebSocket Layer - API Documentation

## Overview

The VEXEL API Gateway provides a RESTful API and WebSocket interface for real-time human-Copilot interoperability. This document describes the complete API specification.

## Base URL

```
Development: http://localhost:3000
Production: TBD
```

## Authentication

All API endpoints (except `/health` and `/api/auth/login`) require JWT authentication.

### Getting a Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "userId": "user-123",
  "role": "human",
  "did": "did:vexel:0x123..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "user": {
      "userId": "user-123",
      "role": "human",
      "did": "did:vexel:0x123..."
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Using the Token

Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## REST API Endpoints

### Authentication

#### POST /api/auth/login
Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "userId": "string (required)",
  "role": "human | agent | admin (required)",
  "agentId": "string (optional)",
  "did": "string (optional)"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "token": "string",
    "expiresIn": "24h",
    "user": { ... }
  },
  "timestamp": "ISO8601"
}
```

#### GET /api/auth/verify
Verify a JWT token.

**Headers:** Authorization: Bearer <token>

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": { ... }
  },
  "timestamp": "ISO8601"
}
```

#### POST /api/auth/refresh
Refresh an existing JWT token.

**Headers:** Authorization: Bearer <token>

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "token": "string",
    "expiresIn": "24h"
  },
  "timestamp": "ISO8601"
}
```

### Agents

#### GET /api/agents
List all agents (requires authentication).

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "agents": [],
    "message": "Agent listing requires database integration"
  },
  "timestamp": "ISO8601"
}
```

#### GET /api/agents/:agentId
Get details for a specific agent.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "agentId": "string",
    "message": "Agent details require database integration"
  },
  "timestamp": "ISO8601"
}
```

#### POST /api/agents
Create a new agent (requires human or admin role).

**Request Body:**
```json
{
  "name": "string (required)",
  "did": "string (required)",
  "ownerAddress": "string (required)",
  "description": "string (optional)"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "message": "Agent created",
    "agent": { ... }
  },
  "timestamp": "ISO8601"
}
```

#### PUT /api/agents/:agentId/status
Update agent runtime status.

**Request Body:**
```json
{
  "status": "ACTIVE | SLEEP | TERMINATED (required)",
  "reason": "string (optional)"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "agentId": "string",
    "status": "ACTIVE",
    "reason": "string",
    "updatedAt": "ISO8601"
  },
  "timestamp": "ISO8601"
}
```

#### GET /api/agents/:agentId/capabilities
Get agent capabilities.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "agentId": "string",
    "capabilities": [],
    "message": "Capabilities require database integration"
  },
  "timestamp": "ISO8601"
}
```

### Health Check

#### GET /health
Check API Gateway health (no authentication required).

**Response:** 200 OK
```json
{
  "status": "healthy",
  "timestamp": "ISO8601",
  "uptime": 12345,
  "websocket": {
    "connected": 5
  }
}
```

## WebSocket API

### Connection

Connect to WebSocket server:

```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    userId: 'user-123'
  }
});
```

### Events

#### connect
Emitted when connection is established.

**Server → Client:**
```json
{
  "message": "Connected to VEXEL WebSocket server",
  "timestamp": "ISO8601"
}
```

#### message
Send and receive messages.

**Client → Server:**
```json
{
  "from": "human | copilot",
  "to": "human | copilot",
  "message": "string",
  "conversationId": "string (optional)"
}
```

**Server → Client:**
```json
{
  "event": "message",
  "data": {
    "id": "uuid",
    "from": "human | copilot",
    "to": "human | copilot",
    "originalMessage": "string",
    "translatedMessage": "string",
    "emotionalState": { ... },
    "timestamp": "ISO8601",
    "status": "delivered"
  },
  "timestamp": "ISO8601",
  "sender": "string",
  "recipient": "string"
}
```

#### emotional_state
Update and receive emotional state changes.

**Client → Server:**
```json
{
  "entityId": "string",
  "emotionalState": {
    "emotion": "JOY | SADNESS | ANGER | FEAR | SURPRISE | TRUST | ANTICIPATION | NEUTRAL",
    "intensity": 0.8,
    "timestamp": "ISO8601",
    "context": "string (optional)"
  }
}
```

**Server → Client:**
```json
{
  "entityId": "string",
  "emotionalState": { ... },
  "timestamp": "ISO8601"
}
```

#### agent_status
Broadcast agent status updates.

**Server → Client (broadcast):**
```json
{
  "agentId": "string",
  "status": "ACTIVE | SLEEP | TERMINATED",
  "timestamp": "ISO8601"
}
```

#### action_request
Request actions (broadcast to relevant parties).

**Client → Server:**
```json
{
  "actionType": "string",
  "agentId": "string",
  "payload": { ... }
}
```

#### error
Error notifications.

**Server → Client:**
```json
{
  "error": "string",
  "details": "string",
  "timestamp": "ISO8601"
}
```

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

## Security Features

1. **JWT Authentication** - Token-based authentication with configurable expiry
2. **Role-Based Access Control** - Human, Agent, and Admin roles
3. **Action Verification** - Middleware validates actions before execution
4. **Rate Limiting** - Prevents abuse and DoS attacks
5. **CORS Protection** - Configurable cross-origin resource sharing
6. **Helmet.js** - Security headers middleware

## Semantic Layer

The semantic layer provides context-aware translation between human and Copilot messages:

- **Context Preservation** - Maintains conversation history
- **Emotional Enhancement** - Injects emotional state into messages
- **Technical Translation** - Humanizes technical Copilot messages

## Emotional State Tracking

Tracks and manages emotional states for all entities:

- **Real-time Tracking** - Updates emotional states in real-time
- **Pattern Analysis** - Analyzes emotional patterns over time
- **Transition Detection** - Detects emotional state transitions
- **Sentiment Inference** - Infers emotion from text messages

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "ISO8601"
}
```

Common status codes:
- `400` Bad Request - Invalid input
- `401` Unauthorized - Missing or invalid authentication
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `500` Internal Server Error - Server error

## Environment Variables

```bash
# API Configuration
API_PORT=3000
JWT_SECRET=your-secret-key

# CORS Configuration
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100

# Wallet Configuration (for future database integration)
WALLET_ENCRYPTION_KEY=your-encryption-key
```

## Example Usage

### JavaScript/TypeScript

```typescript
import { APIGateway } from 'vexel';

// Start API Gateway
const gateway = new APIGateway({
  port: 3000,
  jwtSecret: 'your-secret',
  corsOrigin: '*',
});

await gateway.start();

// Access WebSocket server
const wsServer = gateway.getWebSocketServer();

// Broadcast message
wsServer.broadcast('agent_status', {
  agentId: 'agent-123',
  status: 'ACTIVE',
});
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123","role":"human"}'

# Get agents (with token)
curl http://localhost:3000/api/agents \
  -H "Authorization: Bearer <token>"

# Create agent
curl -X POST http://localhost:3000/api/agents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"MyAgent","did":"did:vexel:0x123","ownerAddress":"0x123"}'
```

## Interactive API Documentation

Once the server is running, visit:
```
http://localhost:3000/api-docs
```

This provides an interactive Swagger UI for testing all API endpoints.

## Next Steps

1. Integrate with PostgreSQL database for persistence
2. Connect to existing agent management system
3. Implement Redis for session management
4. Add monitoring and logging
5. Implement load testing
6. Security audit and hardening
7. Deploy to production environment
