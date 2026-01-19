/**
 * Maestro Agent Types
 * Defines interfaces and types for multi-agent orchestration and choreography
 */

// ============================================================================
// Agent Registry & Discovery Types
// ============================================================================

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  version: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  tags: string[];
  deprecated?: boolean;
}

export interface RegisteredAgent {
  id: string;
  type: 'sentinel' | 'bridge' | 'sovereign' | 'prism' | 'atlas' | 'maestro' | 'weaver';
  name: string;
  description: string;
  publicKey: string;
  capabilities: AgentCapability[];
  status: 'online' | 'offline' | 'degraded';
  lastHeartbeat: number;
  endpoint?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentRegistry {
  agents: Map<string, RegisteredAgent>;
  capabilities: Map<string, AgentCapability[]>;
}

// ============================================================================
// Workflow & Choreography Types
// ============================================================================

export interface WorkflowStep {
  id: string;
  agentId: string;
  capability: string;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  dependencies?: string[]; // IDs of preceding steps
  retryPolicy?: RetryPolicy;
  timeout?: number;
  errorHandler?: ErrorHandler;
  condition?: ExecutionCondition;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: WorkflowStep[];
  initialInputs: Record<string, unknown>;
  expectedOutputs: Record<string, unknown>;
  maxDuration?: number;
  onError?: 'stop' | 'continue' | 'rollback';
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'rolled_back';
  stepExecutions: Map<string, StepExecution>;
  context: WorkflowContext;
  startedAt?: number;
  completedAt?: number;
  error?: ExecutionError;
  rollbackLog?: RollbackEntry[];
}

export interface StepExecution {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  error?: ExecutionError;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  retryCount: number;
}

export interface WorkflowContext {
  executionId: string;
  workflowId: string;
  stepOutputs: Map<string, Record<string, unknown>>;
  variables: Map<string, unknown>;
  parentExecutionId?: string;
  correlationId: string;
}

export interface ExecutionCondition {
  type: 'javascript' | 'comparison' | 'logical';
  expression?: string; // JavaScript code or comparison
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';
  value?: unknown;
  variable?: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
}

export interface ErrorHandler {
  type: 'retry' | 'skip' | 'callback' | 'fallback';
  action: string; // AgentId or callback endpoint or fallback step ID
  params?: Record<string, unknown>;
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  stepId?: string;
}

export interface RollbackEntry {
  stepId: string;
  action: string;
  rollbackCapability: string;
  inputs: Record<string, unknown>;
  status: 'pending' | 'executed' | 'failed';
  error?: ExecutionError;
}

// ============================================================================
// Event Bus Types
// ============================================================================

export interface ChoreographyEvent {
  id: string;
  type: AgentEventType;
  sourceAgent: string;
  targetAgent?: string;
  workflowId?: string;
  executionId?: string;
  payload: Record<string, unknown>;
  timestamp: number;
  correlationId: string;
  metadata?: Record<string, unknown>;
}

export type AgentEventType =
  | 'agent:registered'
  | 'agent:deregistered'
  | 'agent:health'
  | 'workflow:created'
  | 'workflow:started'
  | 'workflow:step_completed'
  | 'workflow:step_failed'
  | 'workflow:completed'
  | 'workflow:failed'
  | 'workflow:paused'
  | 'workflow:resumed'
  | 'agent:event'
  | 'agent:alert'
  | 'choreography:sync';

export interface EventSubscription {
  id: string;
  eventTypes: AgentEventType[];
  agentId?: string;
  workflowId?: string;
  callback: (event: ChoreographyEvent) => Promise<void>;
  active: boolean;
}

export interface EventBus {
  publish(event: ChoreographyEvent): Promise<void>;
  subscribe(types: AgentEventType[], agentId?: string): EventSubscription;
  unsubscribe(subscriptionId: string): void;
  getSubscriptions(): EventSubscription[];
}

// ============================================================================
// Choreography State Types
// ============================================================================

export interface ChoreographyState {
  id: string;
  type: 'saga' | 'choreography' | 'orchestration';
  agents: Set<string>;
  events: ChoreographyEvent[];
  status: 'active' | 'completed' | 'compensating' | 'failed';
  startedAt: number;
  compensationLog: CompensationEntry[];
}

export interface CompensationEntry {
  originalEventId: string;
  compensationEvent: ChoreographyEvent;
  status: 'pending' | 'executed' | 'failed';
  error?: ExecutionError;
}

// ============================================================================
// Agent Communication Types
// ============================================================================

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'command' | 'query' | 'response' | 'event' | 'error';
  payload: Record<string, unknown>;
  timestamp: number;
  correlationId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentCommand {
  id: string;
  agentId: string;
  capability: string;
  parameters: Record<string, unknown>;
  expectedResponse?: Record<string, unknown>;
  timeout?: number;
}

export interface AgentResponse {
  commandId: string;
  status: 'success' | 'error' | 'timeout';
  data?: Record<string, unknown>;
  error?: ExecutionError;
  duration: number;
}

// ============================================================================
// Monitoring & Metrics Types
// ============================================================================

export interface ChoreographyMetrics {
  totalWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  averageExecutionTime: number;
  successRate: number;
  agentHealthScores: Map<string, number>;
  eventThroughput: number; // Events per second
  activeExecutions: number;
}

export interface AgentHealth {
  agentId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  errorRate: number;
  lastCheck: number;
  uptime: number;
  capabilities: {
    name: string;
    successRate: number;
    averageTime: number;
  }[];
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface MaestroConfig {
  maxConcurrentWorkflows?: number;
  defaultWorkflowTimeout?: number;
  eventBusBufferSize?: number;
  healthCheckIntervalMs?: number;
  agentTimeoutMs?: number;
  enableRollback?: boolean;
  enableCompensation?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// ============================================================================
// Query & Filter Types
// ============================================================================

export interface WorkflowQuery {
  status?: WorkflowExecution['status'][];
  agentId?: string;
  tags?: string[];
  createdAfter?: number;
  createdBefore?: number;
  limit?: number;
  offset?: number;
}

export interface AgentQuery {
  types?: RegisteredAgent['type'][];
  status?: RegisteredAgent['status'][];
  capabilities?: string[];
  tags?: string[];
}
