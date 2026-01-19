/**
 * Choreography Engine - Maestro Agent
 * Manages workflow definition, state transitions, and coordination
 */

import { Workflow, WorkflowExecution, WorkflowStep, ExecutionCondition, ExecutionError } from './types';

export class ChoreographyEngine {
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();

  /**
   * Define a new workflow
   */
  defineWorkflow(workflow: Workflow): void {
    if (this.workflows.has(workflow.id)) {
      throw new Error(`Workflow ${workflow.id} already exists`);
    }

    // Validate workflow structure
    this.validateWorkflow(workflow);
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Validate workflow structure
   */
  private validateWorkflow(workflow: Workflow): void {
    if (!workflow.id || !workflow.name || !workflow.steps || workflow.steps.length === 0) {
      throw new Error('Invalid workflow: missing required fields');
    }

    // Check for circular dependencies
    this.checkCircularDependencies(workflow.steps);

    // Validate each step
    for (const step of workflow.steps) {
      if (!step.id || !step.agentId || !step.capability) {
        throw new Error(`Invalid step: ${step.id} missing required fields`);
      }
    }
  }

  /**
   * Check for circular dependencies in workflow steps
   */
  private checkCircularDependencies(steps: WorkflowStep[]): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      if (visiting.has(stepId)) return true;
      if (visited.has(stepId)) return false;

      visiting.add(stepId);
      const step = steps.find((s) => s.id === stepId);

      if (step?.dependencies) {
        for (const dep of step.dependencies) {
          if (hasCycle(dep)) return true;
        }
      }

      visiting.delete(stepId);
      visited.add(stepId);
      return false;
    };

    for (const step of steps) {
      if (hasCycle(step.id)) {
        throw new Error('Circular dependency detected in workflow');
      }
    }
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Update workflow
   */
  updateWorkflow(workflowId: string, updates: Partial<Workflow>): void {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const updated = { ...workflow, ...updates, updatedAt: Date.now() };
    this.validateWorkflow(updated);
    this.workflows.set(workflowId, updated);
  }

  /**
   * Create a new workflow execution
   */
  createExecution(
    workflowId: string,
    context: {
      correlationId: string;
      parentExecutionId?: string;
    },
  ): WorkflowExecution {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const executionId = this.generateExecutionId();
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'pending',
      stepExecutions: new Map(),
      context: {
        executionId,
        workflowId,
        stepOutputs: new Map(),
        variables: new Map(Object.entries(workflow.initialInputs || {})),
        correlationId: context.correlationId,
        parentExecutionId: context.parentExecutionId,
      },
    };

    // Initialize step executions
    for (const step of workflow.steps) {
      execution.stepExecutions.set(step.id, {
        stepId: step.id,
        status: 'pending',
        inputs: step.inputs,
        retryCount: 0,
      });
    }

    this.executions.set(executionId, execution);
    return execution;
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all executions for a workflow
   */
  getExecutionsByWorkflow(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter((e) => e.workflowId === workflowId);
  }

  /**
   * Update execution status
   */
  updateExecutionStatus(
    executionId: string,
    status: WorkflowExecution['status'],
    error?: ExecutionError,
  ): void {
    const execution = this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    execution.status = status;
    if (error) {
      execution.error = error;
    }

    if (status === 'completed' || status === 'failed') {
      execution.completedAt = Date.now();
    }
  }

  /**
   * Update step execution status
   */
  updateStepStatus(
    executionId: string,
    stepId: string,
    status: string,
    data?: { outputs?: Record<string, unknown>; error?: ExecutionError },
  ): void {
    const execution = this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const stepExec = execution.stepExecutions.get(stepId);
    if (!stepExec) {
      throw new Error(`Step ${stepId} not found in execution`);
    }

    stepExec.status = status as any;
    if (data?.outputs) {
      stepExec.outputs = data.outputs;
      execution.context.stepOutputs.set(stepId, data.outputs);
    }
    if (data?.error) {
      stepExec.error = data.error;
    }

    if (stepExec.status === 'completed' || stepExec.status === 'failed') {
      stepExec.completedAt = Date.now();
      if (stepExec.startedAt) {
        stepExec.duration = stepExec.completedAt - stepExec.startedAt;
      }
    }
  }

  /**
   * Get next steps to execute (respecting dependencies)
   */
  getNextSteps(executionId: string): WorkflowStep[] {
    const execution = this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const workflow = this.getWorkflow(execution.workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${execution.workflowId} not found`);
    }

    const nextSteps: WorkflowStep[] = [];

    for (const step of workflow.steps) {
      const stepExec = execution.stepExecutions.get(step.id);
      if (!stepExec) continue;

      // Skip if already completed or failed
      if (stepExec.status === 'completed' || stepExec.status === 'failed') {
        continue;
      }

      // Check if dependencies are met
      if (step.dependencies && step.dependencies.length > 0) {
        const depsMet = step.dependencies.every((depId) => {
          const depExec = execution.stepExecutions.get(depId);
          return depExec && depExec.status === 'completed';
        });

        if (!depsMet) {
          continue;
        }
      }

      // Check condition
      if (step.condition) {
        const conditionMet = this.evaluateCondition(step.condition, execution.context);
        if (!conditionMet) {
          // Skip this step
          this.updateStepStatus(executionId, step.id, 'skipped');
          continue;
        }
      }

      nextSteps.push(step);
    }

    return nextSteps;
  }

  /**
   * Evaluate execution condition
   */
  evaluateCondition(condition: ExecutionCondition, context: any): boolean {
    try {
      if (condition.type === 'javascript' && condition.expression) {
        // eslint-disable-next-line no-new-func
        const fn = new Function('context', `return ${condition.expression}`);
        return fn(context);
      }

      if (condition.type === 'comparison' && condition.operator && condition.variable !== undefined) {
        const value = context.variables.get(condition.variable);
        const compareValue = condition.value as any;

        switch (condition.operator) {
          case 'eq':
            return value === compareValue;
          case 'neq':
            return value !== compareValue;
          case 'gt':
            return (value as any) > compareValue;
          case 'gte':
            return (value as any) >= compareValue;
          case 'lt':
            return (value as any) < compareValue;
          case 'lte':
            return (value as any) <= compareValue;
          case 'in':
            return Array.isArray(compareValue) && compareValue.includes(value);
          case 'not_in':
            return !Array.isArray(compareValue) || !compareValue.includes(value);
          default:
            return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Substitute variables in step inputs
   */
  substituteVariables(inputs: Record<string, unknown>, execution: WorkflowExecution): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const varName = value.slice(2, -1);
        result[key] = execution.context.variables.get(varName) ?? value;
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.substituteVariables(value as Record<string, unknown>, execution);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all workflows and executions (for testing)
   */
  clear(): void {
    this.workflows.clear();
    this.executions.clear();
  }
}
