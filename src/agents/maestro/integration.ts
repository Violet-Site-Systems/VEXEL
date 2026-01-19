/**
 * Maestro Agent Integration - APIGateway
 * Express middleware and routes for Maestro orchestration layer
 */

import { Router, Request, Response, NextFunction } from 'express';
import { MaestroAgent } from './maestro';
import { Workflow, RegisteredAgent, AgentQuery, WorkflowQuery } from './types';

export interface MaestroRequest extends Request {
  maestro?: MaestroAgent;
}

/**
 * Create Maestro middleware for Express
 */
export function createMaestroMiddleware(maestro: MaestroAgent) {
  return (req: MaestroRequest, res: Response, next: NextFunction) => {
    req.maestro = maestro;
    next();
  };
}

/**
 * Create Maestro routes for Express
 */
export function createMaestroRoutes(maestro: MaestroAgent): Router {
  const router = Router();

  // ======================================================================
  // Agent Management Endpoints
  // ======================================================================

  /**
   * Register agent
   * POST /maestro/agents
   */
  router.post('/agents', (req: MaestroRequest, res: Response) => {
    try {
      const agent: RegisteredAgent = req.body;
      maestro.registerAgent(agent);

      res.status(201).json({
        success: true,
        message: `Agent ${agent.id} registered`,
        agent,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get agent by ID
   * GET /maestro/agents/:agentId
   */
  router.get('/agents/:agentId', (req: MaestroRequest, res: Response) => {
    try {
      const agent = maestro.getAgent(req.params.agentId as string);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: `Agent ${req.params.agentId} not found`,
        });
      }

      res.json({
        success: true,
        agent,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * List all agents
   * GET /maestro/agents
   */
  router.get('/agents', (req: MaestroRequest, res: Response) => {
    try {
      const normalizeArray = (val: string | string[] | undefined): string[] | undefined => {
        if (!val) return undefined;
        return Array.isArray(val) ? (val as string[]) : [val as string];
      };

      const query: AgentQuery = {
        types: normalizeArray(req.query.types as any) as any,
        status: normalizeArray(req.query.status as any) as any,
        capabilities: normalizeArray(req.query.capabilities as any),
        tags: normalizeArray(req.query.tags as any),
      };

      const agents = maestro.queryAgents(query);

      res.json({
        success: true,
        count: agents.length,
        agents,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Update agent status
   * PATCH /maestro/agents/:agentId/status
   */
  router.patch('/agents/:agentId/status', (req: MaestroRequest, res: Response) => {
    try {
      const status = req.body.status as RegisteredAgent['status'];
      maestro.updateAgentStatus(req.params.agentId as string, status);

      res.json({
        success: true,
        message: `Agent ${req.params.agentId} status updated to ${status}`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Deregister agent
   * DELETE /maestro/agents/:agentId
   */
  router.delete('/agents/:agentId', (req: MaestroRequest, res: Response) => {
    try {
      maestro.deregisterAgent(req.params.agentId as string);

      res.json({
        success: true,
        message: `Agent ${req.params.agentId} deregistered`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get agent health
   * GET /maestro/agents/:agentId/health
   */
  router.get('/agents/:agentId/health', (req: MaestroRequest, res: Response) => {
    try {
      const health = maestro.getAgentHealth(req.params.agentId as string);

      if (!health) {
        return res.status(404).json({
          success: false,
          error: `Health data not found for agent ${req.params.agentId}`,
        });
      }

      res.json({
        success: true,
        health,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ======================================================================
  // Workflow Management Endpoints
  // ======================================================================

  /**
   * Define workflow
   * POST /maestro/workflows
   */
  router.post('/workflows', (req: MaestroRequest, res: Response) => {
    try {
      const workflow: Workflow = req.body;
      maestro.defineWorkflow(workflow);

      res.status(201).json({
        success: true,
        message: `Workflow ${workflow.id} defined`,
        workflow,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get workflow by ID
   * GET /maestro/workflows/:workflowId
   */
  router.get('/workflows/:workflowId', (req: MaestroRequest, res: Response) => {
    try {
      const workflow = maestro.getWorkflow(req.params.workflowId as string);

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: `Workflow ${req.params.workflowId} not found`,
        });
      }

      res.json({
        success: true,
        workflow,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * List all workflows
   * GET /maestro/workflows
   */
  router.get('/workflows', (req: MaestroRequest, res: Response) => {
    try {
      const workflows = maestro.getAllWorkflows();

      res.json({
        success: true,
        count: workflows.length,
        workflows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Update workflow
   * PATCH /maestro/workflows/:workflowId
   */
  router.patch('/workflows/:workflowId', (req: MaestroRequest, res: Response) => {
    try {
      maestro.updateWorkflow(req.params.workflowId as string, req.body);

      const workflow = maestro.getWorkflow(req.params.workflowId as string);

      res.json({
        success: true,
        message: `Workflow ${req.params.workflowId} updated`,
        workflow,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ======================================================================
  // Workflow Execution Endpoints
  // ======================================================================

  /**
   * Execute workflow
   * POST /maestro/workflows/:workflowId/execute
   */
  router.post('/workflows/:workflowId/execute', async (req: MaestroRequest, res: Response) => {
    try {
      const execution = await maestro.executeWorkflow(req.params.workflowId as string, {
        correlationId: req.body.correlationId,
        parentExecutionId: req.body.parentExecutionId,
      });

      res.status(202).json({
        success: true,
        message: `Workflow execution started`,
        execution: {
          id: execution.id,
          workflowId: execution.workflowId,
          status: execution.status,
          startedAt: execution.startedAt,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get execution by ID
   * GET /maestro/executions/:executionId
   */
  router.get('/executions/:executionId', (req: MaestroRequest, res: Response) => {
    try {
      const execution = maestro.getExecution(req.params.executionId as string);

      if (!execution) {
        return res.status(404).json({
          success: false,
          error: `Execution ${req.params.executionId} not found`,
        });
      }

      res.json({
        success: true,
        execution: {
          id: execution.id,
          workflowId: execution.workflowId,
          status: execution.status,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          stepExecutions: Array.from(execution.stepExecutions.entries()).map(([id, stepExec]) => ({
            ...stepExec,
            stepId: id,
          })),
          error: execution.error,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Query executions
   * GET /maestro/executions
   */
  router.get('/executions', (req: MaestroRequest, res: Response) => {
    try {
      const normalizeArray = (val: string | string[] | undefined): string[] | undefined => {
        if (!val) return undefined;
        return Array.isArray(val) ? (val as string[]) : [val as string];
      };

      const query: WorkflowQuery = {
        status: normalizeArray(req.query.status as any) as any,
        agentId: req.query.agentId as string | undefined,
        tags: normalizeArray(req.query.tags as any),
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const executions = maestro.queryExecutions(query);

      res.json({
        success: true,
        count: executions.length,
        executions: executions.map((e) => ({
          id: e.id,
          workflowId: e.workflowId,
          status: e.status,
          startedAt: e.startedAt,
          completedAt: e.completedAt,
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ======================================================================
  // Event Management Endpoints
  // ======================================================================

  /**
   * Get event history
   * GET /maestro/events
   */
  router.get('/events', (req: MaestroRequest, res: Response) => {
    try {
      const filter = {
        eventTypes: req.query.eventTypes,
        sourceAgent: req.query.sourceAgent as string | undefined,
        workflowId: req.query.workflowId as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      };

      const events = maestro.getEventHistory(filter);

      res.json({
        success: true,
        count: events.length,
        events,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get events by correlation ID
   * GET /maestro/events/:correlationId
   */
  router.get('/events/:correlationId', (req: MaestroRequest, res: Response) => {
    try {
      const events = maestro.getEventsByCorrelation(req.params.correlationId as string);

      res.json({
        success: true,
        count: events.length,
        events,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ======================================================================
  // Monitoring & Metrics Endpoints
  // ======================================================================

  /**
   * Get choreography metrics
   * GET /maestro/metrics
   */
  router.get('/metrics', (req: MaestroRequest, res: Response) => {
    try {
      const metrics = maestro.getMetrics();

      res.json({
        success: true,
        metrics: {
          totalWorkflows: metrics.totalWorkflows,
          completedWorkflows: metrics.completedWorkflows,
          failedWorkflows: metrics.failedWorkflows,
          averageExecutionTime: metrics.averageExecutionTime,
          successRate: metrics.successRate,
          activeExecutions: metrics.activeExecutions,
          agentHealthScores: Object.fromEntries(metrics.agentHealthScores),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get all agent health
   * GET /maestro/health
   */
  router.get('/health', (req: MaestroRequest, res: Response) => {
    try {
      const health = maestro.getAllAgentHealth();

      res.json({
        success: true,
        count: health.length,
        agents: health,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get Maestro configuration
   * GET /maestro/config
   */
  router.get('/config', (req: MaestroRequest, res: Response) => {
    try {
      const config = maestro.getConfig();

      res.json({
        success: true,
        config,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Update Maestro configuration
   * PATCH /maestro/config
   */
  router.patch('/config', (req: MaestroRequest, res: Response) => {
    try {
      maestro.updateConfig(req.body);
      const config = maestro.getConfig();

      res.json({
        success: true,
        message: 'Configuration updated',
        config,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}
