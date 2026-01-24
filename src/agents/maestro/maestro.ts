/**
 * Maestro Agent - Main Orchestrator
 * Coordinates multiple agents, workflows, and choreography in the MAS
 */

import {
  Workflow,
  WorkflowExecution,
  RegisteredAgent,
  ChoreographyMetrics,
  MaestroConfig,
  WorkflowQuery,
  AgentQuery,
  AgentHealth,
} from './types';
import { AgentRegistry } from './registry';
import { ChoreographyEngine } from './choreography';
import { MaestroEventBus } from './eventbus';
import { WorkflowExecutor } from './executor';

export class MaestroAgent {
  private registry: AgentRegistry;
  private choreography: ChoreographyEngine;
  private eventBus: MaestroEventBus;
  private executor: WorkflowExecutor;
  private config: MaestroConfig;
  private activeExecutions: Set<string> = new Set();
  private metrics: ChoreographyMetrics = {
    totalWorkflows: 0,
    completedWorkflows: 0,
    failedWorkflows: 0,
    averageExecutionTime: 0,
    successRate: 0,
    agentHealthScores: new Map(),
    eventThroughput: 0,
    activeExecutions: 0,
  };

  constructor(config: MaestroConfig = {}) {
    this.config = {
      maxConcurrentWorkflows: 100,
      defaultWorkflowTimeout: 300000, // 5 minutes
      eventBusBufferSize: 10000,
      healthCheckIntervalMs: 30000, // 30 seconds
      agentTimeoutMs: 10000, // 10 seconds
      enableRollback: true,
      enableCompensation: false,
      logLevel: 'info',
      ...config,
    };

    this.registry = new AgentRegistry();
    this.choreography = new ChoreographyEngine();
    this.eventBus = new MaestroEventBus();
    this.executor = new WorkflowExecutor(this.registry, this.choreography, this.eventBus);
  }

  // ========================================================================
  // Agent Registration & Management
  // ========================================================================

  /**
   * Register an agent in the MAS
   */
  registerAgent(agent: RegisteredAgent): void {
    this.registry.registerAgent(agent);
    this.log('info', `Agent registered: ${agent.id}`);
  }

  /**
   * Deregister an agent from the MAS
   */
  deregisterAgent(agentId: string): void {
    this.registry.deregisterAgent(agentId);
    this.log('info', `Agent deregistered: ${agentId}`);
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): RegisteredAgent | undefined {
    return this.registry.getAgent(agentId);
  }

  /**
   * Query agents
   */
  queryAgents(query: AgentQuery): RegisteredAgent[] {
    return this.registry.queryAgents(query);
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId: string, status: RegisteredAgent['status']): void {
    this.registry.updateAgentStatus(agentId, status);
  }

  /**
   * Record agent health metrics
   */
  recordAgentHealth(health: AgentHealth): void {
    this.registry.recordHealth(health);
    this.metrics.agentHealthScores.set(health.agentId, this.calculateHealthScore(health));
  }

  /**
   * Get all agents
   */
  getAllAgents(): RegisteredAgent[] {
    return this.registry.getAllAgents();
  }

  // ========================================================================
  // Workflow Management
  // ========================================================================

  /**
   * Define a workflow
   */
  defineWorkflow(workflow: Workflow): void {
    this.choreography.defineWorkflow(workflow);
    this.metrics.totalWorkflows++;
    this.log('info', `Workflow defined: ${workflow.id}`);
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.choreography.getWorkflow(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return this.choreography.getAllWorkflows();
  }

  /**
   * Update workflow
   */
  updateWorkflow(workflowId: string, updates: Partial<Workflow>): void {
    this.choreography.updateWorkflow(workflowId, updates);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    context?: {
      correlationId?: string;
      parentExecutionId?: string;
    },
  ): Promise<WorkflowExecution> {
    // Check concurrent execution limit
    if (this.activeExecutions.size >= (this.config.maxConcurrentWorkflows || 100)) {
      throw new Error('Max concurrent workflows reached');
    }

    const workflow = this.choreography.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const correlationId = context?.correlationId || `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const execution = this.choreography.createExecution(workflowId, {
      correlationId,
      parentExecutionId: context?.parentExecutionId,
    });

    this.activeExecutions.add(execution.id);

    try {
      // Execute asynchronously
      this.executor
        .executeWorkflow(execution)
        .then(() => {
          this.activeExecutions.delete(execution.id);
          this.metrics.completedWorkflows++;
          this.updateSuccessRate();
        })
        .catch((error) => {
          this.activeExecutions.delete(execution.id);
          this.metrics.failedWorkflows++;
          this.updateSuccessRate();
          this.log('error', `Workflow execution failed: ${error.message}`);
        });

      this.metrics.activeExecutions = this.activeExecutions.size;
      return execution;
    } catch (error) {
      this.activeExecutions.delete(execution.id);
      throw error;
    }
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.choreography.getExecution(executionId);
  }

  /**
   * Get executions for a workflow
   */
  getExecutionsByWorkflow(workflowId: string): WorkflowExecution[] {
    return this.choreography.getExecutionsByWorkflow(workflowId);
  }

  /**
   * Query executions
   */
  queryExecutions(query: WorkflowQuery): WorkflowExecution[] {
    let results = this.choreography.getAllWorkflows().flatMap((w) => {
      if (query.agentId) {
        const hasAgent = w.steps.some((s) => s.agentId === query.agentId);
        if (!hasAgent) return [];
      }

      return this.choreography.getExecutionsByWorkflow(w.id);
    });

    if (query.status && query.status.length > 0) {
      results = results.filter((e) => query.status!.includes(e.status));
    }

    if (query.limit) {
      results = results.slice(-query.limit);
    }

    return results;
  }

  // ========================================================================
  // Event Management
  // ========================================================================

  /**
   * Subscribe to events
   */
  subscribeToEvents(
    types: any[],
    agentId?: string,
    callback?: (event: any) => Promise<void>,
  ) {
    return this.eventBus.subscribe(types, agentId, callback);
  }

  /**
   * Unsubscribe from events
   */
  unsubscribeFromEvents(subscriptionId: string): void {
    this.eventBus.unsubscribe(subscriptionId);
  }

  /**
   * Get event history
   */
  getEventHistory(filter?: any) {
    return this.eventBus.getEventHistory(filter);
  }

  /**
   * Get events by correlation ID
   */
  getEventsByCorrelation(correlationId: string) {
    return this.eventBus.getEventsByCorrelation(correlationId);
  }

  // ========================================================================
  // Monitoring & Metrics
  // ========================================================================

  /**
   * Get choreography metrics
   */
  getMetrics(): ChoreographyMetrics {
    return {
      ...this.metrics,
      activeExecutions: this.activeExecutions.size,
    };
  }

  /**
   * Get agent health
   */
  getAgentHealth(agentId: string) {
    return this.registry.getHealth(agentId);
  }

  /**
   * Get all agent health metrics
   */
  getAllAgentHealth(): AgentHealth[] {
    return this.registry.getAllHealth();
  }

  /**
   * Check agent health and update status
   */
  async checkAgentHealth(): Promise<void> {
    const agents = this.registry.getAllAgents();

    for (const agent of agents) {
      try {
        // TODO: Implement health check via agent endpoint
        const isHealthy = true; // Placeholder

        if (isHealthy) {
          this.registry.updateAgentStatus(agent.id, 'online');
        } else {
          this.registry.updateAgentStatus(agent.id, 'offline');
        }
      } catch {
        this.registry.updateAgentStatus(agent.id, 'offline');
      }
    }
  }

  /**
   * Get configuration
   */
  getConfig(): MaestroConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<MaestroConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  /**
   * Calculate health score for an agent
   */
  private calculateHealthScore(health: AgentHealth): number {
    const statusScore = health.status === 'healthy' ? 100 : health.status === 'degraded' ? 50 : 0;
    const errorScore = (1 - health.errorRate) * 100;
    const uptimeScore = health.uptime;

    return (statusScore + errorScore + uptimeScore) / 3;
  }

  /**
   * Update success rate metric
   */
  private updateSuccessRate(): void {
    const total = this.metrics.completedWorkflows + this.metrics.failedWorkflows;
    if (total > 0) {
      this.metrics.successRate = (this.metrics.completedWorkflows / total) * 100;
    }
  }

  /**
   * Log message based on log level
   */
  private log(level: string, message: string): void {
    const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levelPriority[this.config.logLevel as keyof typeof levelPriority] || 1;
    const messageLevel = levelPriority[level as keyof typeof levelPriority] || 1;

    if (messageLevel >= currentLevel) {
      console.log(`[Maestro/${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Initialize Maestro (start health checks, etc)
   */
  async initialize(): Promise<void> {
    this.log('info', 'Maestro Agent initializing');

    // Start periodic health checks
    setInterval(() => {
      this.checkAgentHealth().catch((err) => {
        this.log('error', `Health check failed: ${err.message}`);
      });
    }, this.config.healthCheckIntervalMs || 30000);

    this.log('info', 'Maestro Agent initialized');
  }

  /**
   * Shutdown Maestro
   */
  async shutdown(): Promise<void> {
    this.log('info', 'Maestro Agent shutting down');
    this.activeExecutions.clear();
    this.registry.clear();
    this.choreography.clear();
    this.eventBus.clear();
  }
}
