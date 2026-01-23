/**
 * Workflow Executor - Maestro Agent
 * Executes workflows with error handling, retries, and rollback capabilities
 */

import {
  WorkflowExecution,
  WorkflowStep,
  ExecutionError,
  RetryPolicy,
  RollbackEntry,
  ChoreographyEvent,
} from './types';
import { AgentRegistry } from './registry';
import { ChoreographyEngine } from './choreography';
import { MaestroEventBus } from './eventbus';

export interface StepResult {
  success: boolean;
  outputs?: Record<string, unknown>;
  error?: ExecutionError;
  duration: number;
}

export class WorkflowExecutor {
  private defaultRetryPolicy: RetryPolicy = {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 30000,
  };

  constructor(
    private registry: AgentRegistry,
    private choreography: ChoreographyEngine,
    private eventBus: MaestroEventBus,
  ) {}

  /**
   * Execute a workflow
   */
  async executeWorkflow(execution: WorkflowExecution): Promise<void> {
    const workflow = this.choreography.getWorkflow(execution.workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${execution.workflowId} not found`);
    }

    try {
      this.choreography.updateExecutionStatus(execution.id, 'running');
      execution.startedAt = Date.now();

      await this.publishEvent({
        type: 'workflow:started',
        sourceAgent: 'maestro',
        workflowId: execution.workflowId,
        executionId: execution.id,
        correlationId: execution.context.correlationId,
        payload: { workflowName: workflow.name },
      });

      // Execute workflow steps
      while (true) {
        const nextSteps = this.choreography.getNextSteps(execution.id);

        if (nextSteps.length === 0) {
          // Check if all steps are completed
          const allCompleted = Array.from(execution.stepExecutions.values()).every(
            (se) => se.status === 'completed' || se.status === 'skipped',
          );

          if (allCompleted) {
            break;
          } else {
            // No steps to execute but not all completed = error in dependencies
            throw new Error('Workflow execution deadlocked');
          }
        }

        // Execute next steps in parallel
        const results = await Promise.all(nextSteps.map((step) => this.executeStep(execution, step)));

        // Check for failures
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (!result.success) {
            const step = nextSteps[i];
            await this.handleStepFailure(execution, step, result.error!);

            if (workflow.onError === 'stop') {
              throw result.error;
            } else if (workflow.onError === 'rollback') {
              await this.rollbackExecution(execution);
              throw result.error;
            }
          }
        }
      }

      this.choreography.updateExecutionStatus(execution.id, 'completed');

      await this.publishEvent({
        type: 'workflow:completed',
        sourceAgent: 'maestro',
        workflowId: execution.workflowId,
        executionId: execution.id,
        correlationId: execution.context.correlationId,
        payload: { outputs: Object.fromEntries(execution.context.stepOutputs) },
      });
    } catch (error) {
      const executionError: ExecutionError = {
        code: 'EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };

      this.choreography.updateExecutionStatus(execution.id, 'failed', executionError);

      await this.publishEvent({
        type: 'workflow:failed',
        sourceAgent: 'maestro',
        workflowId: execution.workflowId,
        executionId: execution.id,
        correlationId: execution.context.correlationId,
        payload: { error: executionError },
      });

      throw executionError;
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(execution: WorkflowExecution, step: WorkflowStep): Promise<StepResult> {
    const startTime = Date.now();
    const retryPolicy = step.retryPolicy || this.defaultRetryPolicy;

    let lastError: ExecutionError | undefined;
    let attempt = 0;

    while (attempt < retryPolicy.maxAttempts) {
      attempt++;

      try {
        this.choreography.updateStepStatus(execution.id, step.id, 'running');

        // Substitute variables in inputs
        const inputs = this.choreography.substituteVariables(step.inputs, execution);

        // Execute step via agent
        const result = await this.invokeAgent(step.agentId, step.capability, inputs);

        // Update execution context with step outputs
        this.choreography.updateStepStatus(execution.id, step.id, 'completed', {
          outputs: result,
        });

        const duration = Date.now() - startTime;

        await this.publishEvent({
          type: 'workflow:step_completed',
          sourceAgent: 'maestro',
          workflowId: execution.workflowId,
          executionId: execution.id,
          correlationId: execution.context.correlationId,
          payload: { stepId: step.id, outputs: result, duration },
        });

        return {
          success: true,
          outputs: result,
          duration,
        };
      } catch (error) {
        const executionError: ExecutionError = {
          code: 'STEP_EXECUTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
          stepId: step.id,
        };

        lastError = executionError;

        if (attempt < retryPolicy.maxAttempts) {
          const delay = this.calculateBackoffDelay(attempt, retryPolicy);
          await this.sleep(delay);
        }
      }
    }

    const duration = Date.now() - startTime;

    // Handle error based on error handler
    if (step.errorHandler) {
      const result = await this.handleError(execution, step, lastError!);
      if (result.success) {
        return { ...result, duration };
      }
    }

    this.choreography.updateStepStatus(execution.id, step.id, 'failed', {
      error: lastError,
    });

    await this.publishEvent({
      type: 'workflow:step_failed',
      sourceAgent: 'maestro',
      workflowId: execution.workflowId,
      executionId: execution.id,
      correlationId: execution.context.correlationId,
      payload: { stepId: step.id, error: lastError, duration },
    });

    return {
      success: false,
      error: lastError,
      duration,
    };
  }

  /**
   * Invoke an agent capability
   */
  private async invokeAgent(agentId: string, capability: string, inputs: Record<string, unknown>): Promise<Record<string, unknown>> {
    const agent = this.registry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const cap = this.registry.getCapability(agentId, capability);
    if (!cap) {
      throw new Error(`Capability ${capability} not found on agent ${agentId}`);
    }

    // TODO: Implement actual agent invocation
    // For now, return mock results
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'success', ...inputs });
      }, 100);
    });
  }

  /**
   * Handle step failure with error handler
   */
  private async handleStepFailure(execution: WorkflowExecution, step: WorkflowStep, _error: ExecutionError): Promise<void> {
    // Record the failure
    const stepExec = execution.stepExecutions.get(step.id);
    if (stepExec) {
      stepExec.retryCount = (step.retryPolicy?.maxAttempts || this.defaultRetryPolicy.maxAttempts) - 1;
    }
  }

  /**
   * Handle error using error handler
   */
  private async handleError(
    execution: WorkflowExecution,
    step: WorkflowStep,
    error: ExecutionError,
  ): Promise<StepResult> {
    if (!step.errorHandler) {
      return { success: false, error, duration: 0 };
    }

    try {
      if (step.errorHandler.type === 'skip') {
        // Skip the step
        this.choreography.updateStepStatus(execution.id, step.id, 'skipped');
        return { success: true, duration: 0 };
      }

      if (step.errorHandler.type === 'fallback') {
        // Find fallback step and execute it
        const fallbackStep = this.choreography.getWorkflow(execution.workflowId)?.steps.find(
          (s) => s.id === step.errorHandler?.action,
        );

        if (fallbackStep) {
          return await this.executeStep(execution, fallbackStep);
        }
      }

      return { success: false, error, duration: 0 };
    } catch {
      return { success: false, error, duration: 0 };
    }
  }

  /**
   * Rollback workflow execution
   */
  private async rollbackExecution(execution: WorkflowExecution): Promise<void> {
    const workflow = this.choreography.getWorkflow(execution.workflowId);
    if (!workflow) return;

    execution.status = 'rolled_back';
    execution.rollbackLog = [];

    // Get completed steps in reverse order
    const completedSteps = Array.from(execution.stepExecutions.entries())
      .filter(([, se]) => se.status === 'completed')
      .reverse();

    for (const [stepId, stepExec] of completedSteps) {
      const step = workflow.steps.find((s) => s.id === stepId);
      if (!step) continue;

      // Record rollback entry
      const rollbackEntry: RollbackEntry = {
        stepId,
        action: 'undo',
        rollbackCapability: `${step.capability}_rollback`,
        inputs: stepExec.outputs || {},
        status: 'pending',
      };

      execution.rollbackLog!.push(rollbackEntry);

      // TODO: Invoke rollback capability on agent
      rollbackEntry.status = 'executed';
    }
  }

  /**
   * Calculate backoff delay for retry
   */
  private calculateBackoffDelay(attempt: number, policy: RetryPolicy): number {
    const multiplier = policy.backoffMultiplier || 1;
    const delay = policy.delayMs * Math.pow(multiplier, attempt - 1);
    const maxDelay = policy.maxDelayMs || delay;
    return Math.min(delay, maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Publish event via event bus
   */
  private async publishEvent(eventData: Partial<ChoreographyEvent>): Promise<void> {
    const event: ChoreographyEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventData.type as any,
      sourceAgent: eventData.sourceAgent || 'maestro',
      timestamp: Date.now(),
      correlationId: eventData.correlationId || '',
      payload: eventData.payload || {},
      targetAgent: eventData.targetAgent,
      workflowId: eventData.workflowId,
      executionId: eventData.executionId,
      metadata: eventData.metadata,
    };

    await this.eventBus.publish(event);
  }
}
