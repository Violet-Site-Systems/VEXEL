# Maestro Agent - Multi-Agent Orchestration Layer

The **Maestro Agent** is the orchestration and choreography layer for the VEXEL Multi-Agent System (MAS). It coordinates workflows across multiple agents, manages agent lifecycle, handles inter-agent communication, and provides comprehensive monitoring and metrics.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      Maestro Agent                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Agent         │  │ Choreography │  │   Event      │   │
│  │  Registry      │  │   Engine     │  │    Bus       │   │
│  └────────────────┘  └──────────────┘  └──────────────┘   │
│                                                              │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Workflow      │  │   Health &   │  │ Integration  │   │
│  │  Executor      │  │   Metrics    │  │  Layer       │   │
│  └────────────────┘  └──────────────┘  └──────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
         │              │              │           │
         ▼              ▼              ▼           ▼
    ┌─────────┐    ┌────────┐    ┌────────┐   ┌──────────┐
    │Sentinel │    │ Bridge │    │Prism   │   │Weaver    │
    │ Agent   │    │ Agent  │    │ Agent  │   │ Agent    │
    └─────────┘    └────────┘    └────────┘   └──────────┘
```

## Core Components

### 1. Agent Registry (`registry.ts`)
Manages agent registration, discovery, and lifecycle.

**Key Methods:**
- `registerAgent()` - Register a new agent
- `deregisterAgent()` - Unregister an agent
- `getAgent()` - Retrieve agent by ID
- `queryAgents()` - Query agents by type, status, capabilities
- `findAgentsByCapability()` - Find agents with specific capability
- `updateAgentStatus()` - Update agent online/offline status
- `recordHealth()` - Track agent health metrics

**Example:**
```typescript
const agent: RegisteredAgent = {
  id: 'sentinel-1',
  type: 'sentinel',
  name: 'Sentinel Agent',
  description: 'Security guardian',
  publicKey: 'pub_key_123',
  capabilities: [{
    id: 'sign',
    name: 'Sign Data',
    version: '1.0',
    inputs: { data: 'string' },
    outputs: { signature: 'string' },
    tags: ['crypto'],
  }],
  status: 'online',
  lastHeartbeat: Date.now(),
};

maestro.registerAgent(agent);
```

### 2. Choreography Engine (`choreography.ts`)
Manages workflow definition, state transitions, and step coordination.

**Key Methods:**
- `defineWorkflow()` - Define a new workflow
- `getWorkflow()` - Retrieve workflow definition
- `createExecution()` - Start workflow execution
- `getNextSteps()` - Get steps ready to execute (respects dependencies)
- `evaluateCondition()` - Evaluate conditional execution
- `substituteVariables()` - Replace variable placeholders

**Example:**
```typescript
const workflow: Workflow = {
  id: 'auth-flow',
  name: 'Authentication Flow',
  version: '1.0',
  steps: [
    {
      id: 'verify-user',
      agentId: 'sentinel-1',
      capability: 'verify-identity',
      inputs: { userId: '${userId}' },
    },
    {
      id: 'issue-token',
      agentId: 'bridge-1',
      capability: 'issue-jwt',
      inputs: { userId: '${userId}' },
      dependencies: ['verify-user'],
      condition: {
        type: 'comparison',
        operator: 'eq',
        variable: 'verified',
        value: true,
      },
    },
  ],
  initialInputs: {},
  expectedOutputs: { token: 'string' },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  createdBy: 'admin',
};

maestro.defineWorkflow(workflow);
```

### 3. Event Bus (`eventbus.ts`)
Handles publish/subscribe for inter-agent communication.

**Key Methods:**
- `publish()` - Publish an event to subscribers
- `subscribe()` - Subscribe to event types
- `unsubscribe()` - Unsubscribe from events
- `getEventHistory()` - Retrieve event history with filters
- `getEventsByCorrelation()` - Get all events for a correlation ID

**Event Types:**
- `agent:registered` - Agent joined the network
- `agent:deregistered` - Agent left the network
- `agent:health` - Agent health check
- `workflow:created` - Workflow definition created
- `workflow:started` - Workflow execution started
- `workflow:step_completed` - Step completed successfully
- `workflow:step_failed` - Step failed with error
- `workflow:completed` - Workflow execution completed
- `workflow:failed` - Workflow execution failed
- `agent:event` - Generic agent event
- `agent:alert` - Agent alert (from security monitoring)

**Example:**
```typescript
const subscription = maestro.subscribeToEvents(
  ['workflow:completed', 'workflow:failed'],
  'maestro',
  async (event) => {
    console.log(`Workflow ${event.executionId} completed`);
  },
);

// Later...
maestro.unsubscribeFromEvents(subscription.id);
```

### 4. Workflow Executor (`executor.ts`)
Executes workflows with error handling, retries, and rollback.

**Key Methods:**
- `executeWorkflow()` - Execute a workflow with all steps
- `executeStep()` - Execute a single step with retry logic
- `handleError()` - Handle step failures with error handlers
- `rollbackExecution()` - Rollback workflow on critical failure

**Retry Policy:**
```typescript
{
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
}
```

**Error Handling Strategies:**
- `retry` - Retry the step
- `skip` - Skip this step
- `callback` - Call a webhook
- `fallback` - Execute fallback step

### 5. Maestro Agent (`maestro.ts`)
Main orchestrator composing all components.

**Key Methods:**
- `registerAgent()` / `getAgent()` / `queryAgents()`
- `defineWorkflow()` / `getWorkflow()` / `updateWorkflow()`
- `executeWorkflow()` / `getExecution()`
- `subscribeToEvents()` / `getEventHistory()`
- `getMetrics()` / `getAgentHealth()`
- `initialize()` / `shutdown()`

## API Endpoints

All endpoints require authentication and use JSON request/response bodies.

### Agent Management

```
POST /maestro/agents                    # Register agent
GET /maestro/agents                     # List agents (with query filters)
GET /maestro/agents/:agentId            # Get agent by ID
PATCH /maestro/agents/:agentId/status   # Update agent status
DELETE /maestro/agents/:agentId         # Deregister agent
GET /maestro/agents/:agentId/health     # Get agent health
```

### Workflow Management

```
POST /maestro/workflows                 # Define workflow
GET /maestro/workflows                  # List workflows
GET /maestro/workflows/:workflowId      # Get workflow by ID
PATCH /maestro/workflows/:workflowId    # Update workflow
POST /maestro/workflows/:workflowId/execute  # Execute workflow
```

### Execution Monitoring

```
GET /maestro/executions/:executionId    # Get execution status
GET /maestro/executions                 # Query executions
```

### Events & Monitoring

```
GET /maestro/events                     # Get event history
GET /maestro/events/:correlationId      # Get events by correlation ID
GET /maestro/metrics                    # Get orchestration metrics
GET /maestro/health                     # Get all agent health
GET /maestro/config                     # Get Maestro configuration
PATCH /maestro/config                   # Update Maestro configuration
```

## Configuration

```typescript
const maestroConfig: MaestroConfig = {
  maxConcurrentWorkflows: 100,          // Max workflows running simultaneously
  defaultWorkflowTimeout: 300000,       // 5 minutes
  eventBusBufferSize: 10000,            // Max event history size
  healthCheckIntervalMs: 30000,         // Health check every 30 seconds
  agentTimeoutMs: 10000,                // Agent response timeout
  enableRollback: true,                 // Enable automatic rollback
  enableCompensation: false,            // Enable saga compensation
  logLevel: 'info',                     // Log level
};

const maestro = new MaestroAgent(maestroConfig);
```

## Usage Examples

### Register Multiple Agents

```typescript
const agents: RegisteredAgent[] = [
  {
    id: 'sentinel-1',
    type: 'sentinel',
    name: 'Sentinel',
    description: 'Security guardian',
    publicKey: 'pub_1',
    capabilities: [/* ... */],
    status: 'online',
    lastHeartbeat: Date.now(),
  },
  // ... more agents
];

agents.forEach(agent => maestro.registerAgent(agent));
```

### Define and Execute Workflow

```typescript
// Define workflow
maestro.defineWorkflow(workflow);

// Execute workflow
const execution = await maestro.executeWorkflow('auth-flow', {
  correlationId: `auth_${Date.now()}`,
});

console.log(`Execution started: ${execution.id}`);

// Monitor execution
const status = maestro.getExecution(execution.id);
console.log(`Status: ${status?.status}`);
```

### Monitor Events

```typescript
// Subscribe to workflow events
maestro.subscribeToEvents(
  ['workflow:completed', 'workflow:failed'],
  'maestro',
  async (event) => {
    if (event.type === 'workflow:completed') {
      console.log(`Workflow completed: ${event.executionId}`);
    } else {
      console.log(`Workflow failed: ${event.executionId}`);
    }
  },
);

// Get event history
const recentEvents = maestro.getEventHistory({
  limit: 100,
  since: Date.now() - 3600000, // Last hour
});
```

### Track Metrics

```typescript
const metrics = maestro.getMetrics();
console.log(`
  Total workflows: ${metrics.totalWorkflows}
  Success rate: ${metrics.successRate.toFixed(2)}%
  Active executions: ${metrics.activeExecutions}
  Agent health: ${metrics.agentHealthScores.size} tracked
`);
```

## Integration with APIGateway

```typescript
import express from 'express';
import { MaestroAgent, createMaestroMiddleware, createMaestroRoutes } from './agents/maestro';

const app = express();
const maestro = new MaestroAgent();

// Add Maestro middleware
app.use(createMaestroMiddleware(maestro));

// Mount Maestro routes
app.use('/maestro', createMaestroRoutes(maestro));

// Start server
app.listen(3000);
```

## Testing

Run the comprehensive test suite:

```bash
npm test -- src/agents/maestro/__tests__/maestro.test.ts
```

Test categories:
- Agent Registry (registration, deregistration, querying)
- Workflow Management (definition, validation, updates)
- Choreography Engine (execution, conditions, dependencies)
- Event Bus (publishing, subscribing, filtering)
- Metrics & Monitoring (health tracking, metrics collection)
- Integration (multi-agent workflows, event tracking)

## Next Steps

After Maestro Agent, the remaining MAS agents are:

1. **Bridge Agent** - Protocol translation (DID ↔ OIDC ↔ OAuth2)
2. **Sovereign Agent** - Consent/delegation management
3. **Prism Agent** - Identity unification (multiple DIDs → unified identity)
4. **Atlas Agent** - Routing and discovery (finding other agents)
5. **Weaver Agent** - Plugin system for extending capabilities

Each follows the same architectural pattern as Sentinel and Maestro.

## Architecture Alignment

Maestro Agent aligns with VEXEL's core principles:

- **Interoperability**: Coordinates agents across different protocols and systems
- **Sovereignty**: Agents retain full control over their operations
- **Scalability**: Event-driven architecture supports large agent networks
- **Resilience**: Built-in retry, rollback, and error handling
- **Observability**: Comprehensive event logging and metrics tracking

---

**Phase 3.3 Status**: ✅ Maestro Agent - Multi-Agent Orchestration

**Build Status**: Ready for testing
