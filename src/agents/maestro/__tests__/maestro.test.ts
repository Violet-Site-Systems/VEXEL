/**
 * Maestro Agent - Test Suite
 * Comprehensive tests for orchestration, choreography, and agent management
 */

import { MaestroAgent } from '../maestro';
import { AgentRegistry } from '../registry';
import { ChoreographyEngine } from '../choreography';
import { MaestroEventBus } from '../eventbus';
import {
  RegisteredAgent,
  Workflow,
  WorkflowStep,
  AgentCapability,
  ChoreographyEvent,
} from '../types';

describe('Maestro Agent', () => {
  let maestro: MaestroAgent;

  beforeEach(() => {
    maestro = new MaestroAgent({
      maxConcurrentWorkflows: 10,
      logLevel: 'error',
    });
  });

  afterEach(async () => {
    await maestro.shutdown();
  });

  // ======================================================================
  // Agent Registry Tests
  // ======================================================================

  describe('Agent Registry', () => {
    it('should register an agent', () => {
      const agent: RegisteredAgent = {
        id: 'agent-1',
        type: 'sentinel',
        name: 'Sentinel Agent',
        description: 'Security agent',
        publicKey: 'pub_key_123',
        capabilities: [],
        status: 'online',
        lastHeartbeat: Date.now(),
      };

      maestro.registerAgent(agent);
      const retrieved = maestro.getAgent('agent-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Sentinel Agent');
    });

    it('should prevent duplicate agent registration', () => {
      const agent: RegisteredAgent = {
        id: 'agent-1',
        type: 'sentinel',
        name: 'Test Agent',
        description: 'Test',
        publicKey: 'pub_key',
        capabilities: [],
        status: 'online',
        lastHeartbeat: Date.now(),
      };

      maestro.registerAgent(agent);

      expect(() => maestro.registerAgent(agent)).toThrow();
    });

    it('should deregister an agent', () => {
      const agent: RegisteredAgent = {
        id: 'agent-1',
        type: 'sentinel',
        name: 'Test',
        description: 'Test',
        publicKey: 'pub_key',
        capabilities: [],
        status: 'online',
        lastHeartbeat: Date.now(),
      };

      maestro.registerAgent(agent);
      maestro.deregisterAgent('agent-1');

      expect(maestro.getAgent('agent-1')).toBeUndefined();
    });

    it('should query agents by type', () => {
      const agents: RegisteredAgent[] = [
        {
          id: 'sentinel-1',
          type: 'sentinel',
          name: 'Sentinel',
          description: 'Security',
          publicKey: 'pub_1',
          capabilities: [],
          status: 'online',
          lastHeartbeat: Date.now(),
        },
        {
          id: 'bridge-1',
          type: 'bridge',
          name: 'Bridge',
          description: 'Protocol translation',
          publicKey: 'pub_2',
          capabilities: [],
          status: 'online',
          lastHeartbeat: Date.now(),
        },
      ];

      agents.forEach((a) => maestro.registerAgent(a));

      const sentinels = maestro.queryAgents({ types: ['sentinel'] });
      expect(sentinels).toHaveLength(1);
      expect(sentinels[0].type).toBe('sentinel');
    });

    it('should query agents by status', () => {
      const agent: RegisteredAgent = {
        id: 'agent-1',
        type: 'sentinel',
        name: 'Test',
        description: 'Test',
        publicKey: 'pub_key',
        capabilities: [],
        status: 'online',
        lastHeartbeat: Date.now(),
      };

      maestro.registerAgent(agent);
      maestro.updateAgentStatus('agent-1', 'offline');

      const offline = maestro.queryAgents({ status: ['offline'] });
      expect(offline).toHaveLength(1);
      expect(offline[0].status).toBe('offline');
    });

    it('should query agents by capability', () => {
      const capability: AgentCapability = {
        id: 'sign',
        name: 'Sign Data',
        description: 'Sign data with key',
        version: '1.0',
        inputs: {},
        outputs: {},
        tags: ['crypto'],
      };

      const agent: RegisteredAgent = {
        id: 'sentinel-1',
        type: 'sentinel',
        name: 'Sentinel',
        description: 'Security',
        publicKey: 'pub_key',
        capabilities: [capability],
        status: 'online',
        lastHeartbeat: Date.now(),
      };

      maestro.registerAgent(agent);

      const result = maestro.queryAgents({ capabilities: ['sign'] });
      expect(result).toHaveLength(1);
    });
  });

  // ======================================================================
  // Workflow Management Tests
  // ======================================================================

  describe('Workflow Management', () => {
    let workflow: Workflow;

    beforeEach(() => {
      workflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        version: '1.0',
        steps: [
          {
            id: 'step-1',
            agentId: 'agent-1',
            capability: 'process',
            inputs: { data: 'test' },
          },
        ],
        initialInputs: {},
        expectedOutputs: { result: 'string' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'user-1',
      };
    });

    it('should define a workflow', () => {
      maestro.defineWorkflow(workflow);
      const retrieved = maestro.getWorkflow('workflow-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Workflow');
    });

    it('should prevent duplicate workflow definition', () => {
      maestro.defineWorkflow(workflow);

      expect(() => maestro.defineWorkflow(workflow)).toThrow();
    });

    it('should detect circular dependencies', () => {
      const badWorkflow: Workflow = {
        id: 'bad-workflow',
        name: 'Circular',
        description: 'Test',
        version: '1.0',
        steps: [
          {
            id: 'step-1',
            agentId: 'agent-1',
            capability: 'process',
            inputs: {},
            dependencies: ['step-2'],
          },
          {
            id: 'step-2',
            agentId: 'agent-1',
            capability: 'process',
            inputs: {},
            dependencies: ['step-1'],
          },
        ],
        initialInputs: {},
        expectedOutputs: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'user-1',
      };

      expect(() => maestro.defineWorkflow(badWorkflow)).toThrow('Circular dependency');
    });

    it('should update workflow', () => {
      maestro.defineWorkflow(workflow);
      maestro.updateWorkflow('workflow-1', {
        name: 'Updated Workflow',
      });

      const retrieved = maestro.getWorkflow('workflow-1');
      expect(retrieved?.name).toBe('Updated Workflow');
    });

    it('should list all workflows', () => {
      maestro.defineWorkflow(workflow);

      const workflows = maestro.getAllWorkflows();
      expect(workflows.length).toBeGreaterThan(0);
    });
  });

  // ======================================================================
  // Choreography Engine Tests
  // ======================================================================

  describe('Choreography Engine', () => {
    it('should create workflow execution', () => {
      const workflow: Workflow = {
        id: 'workflow-1',
        name: 'Test',
        description: 'Test',
        version: '1.0',
        steps: [
          {
            id: 'step-1',
            agentId: 'agent-1',
            capability: 'process',
            inputs: { data: 'test' },
          },
        ],
        initialInputs: { input1: 'value1' },
        expectedOutputs: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'user-1',
      };

      maestro.defineWorkflow(workflow);

      const execution = maestro.getWorkflow('workflow-1');
      expect(execution).toBeDefined();
    });

    it('should evaluate conditions', () => {
      const engine = new ChoreographyEngine();

      const condition = {
        type: 'comparison' as const,
        operator: 'gt' as const,
        variable: 'count',
        value: 5,
      };

      const context = {
        variables: new Map([['count', 10]]),
        stepOutputs: new Map(),
        executionId: 'exec-1',
        workflowId: 'wf-1',
        correlationId: 'corr-1',
      };

      const result = engine.evaluateCondition(condition, context);
      expect(result).toBe(true);
    });

    it('should substitute variables in inputs', () => {
      const engine = new ChoreographyEngine();

      const workflow: Workflow = {
        id: 'workflow-1',
        name: 'Test',
        description: 'Test',
        version: '1.0',
        steps: [
          {
            id: 'step-1',
            agentId: 'agent-1',
            capability: 'process',
            inputs: { data: 'test' },
          },
        ],
        initialInputs: { userName: 'Alice' },
        expectedOutputs: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'user-1',
      };

      engine.defineWorkflow(workflow);
      const execution = engine.createExecution('workflow-1', { correlationId: 'corr-1' });

      const inputs = {
        greeting: '${userName}',
        message: 'Hello',
      };

      const substituted = engine.substituteVariables(inputs, execution);
      expect(substituted.greeting).toBe('Alice');
      expect(substituted.message).toBe('Hello');
    });
  });

  // ======================================================================
  // Event Bus Tests
  // ======================================================================

  describe('Event Bus', () => {
    it('should publish and retrieve events', async () => {
      const eventBus = new MaestroEventBus();

      const event: ChoreographyEvent = {
        id: 'evt-1',
        type: 'agent:registered',
        sourceAgent: 'agent-1',
        timestamp: Date.now(),
        correlationId: 'corr-1',
        payload: { agentName: 'Test' },
      };

      await eventBus.publish(event);

      const history = eventBus.getEventHistory();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('agent:registered');
    });

    it('should filter events by type', async () => {
      const eventBus = new MaestroEventBus();

      const events: ChoreographyEvent[] = [
        {
          id: 'evt-1',
          type: 'agent:registered',
          sourceAgent: 'agent-1',
          timestamp: Date.now(),
          correlationId: 'corr-1',
          payload: {},
        },
        {
          id: 'evt-2',
          type: 'workflow:started',
          sourceAgent: 'maestro',
          timestamp: Date.now(),
          correlationId: 'corr-1',
          payload: {},
        },
      ];

      for (const event of events) {
        await eventBus.publish(event);
      }

      const filtered = eventBus.getEventHistory({ eventTypes: ['agent:registered'] });
      expect(filtered).toHaveLength(1);
    });

    it('should subscribe to events', async () => {
      const eventBus = new MaestroEventBus();
      const events: ChoreographyEvent[] = [];

      const subscription = eventBus.subscribe(['agent:registered'], 'agent-1', async (event) => {
        events.push(event);
      });

      const event: ChoreographyEvent = {
        id: 'evt-1',
        type: 'agent:registered',
        sourceAgent: 'agent-1',
        timestamp: Date.now(),
        correlationId: 'corr-1',
        payload: {},
      };

      await eventBus.publish(event);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(events).toHaveLength(1);

      eventBus.unsubscribe(subscription.id);
    });

    it('should get events by correlation ID', async () => {
      const eventBus = new MaestroEventBus();

      const events: ChoreographyEvent[] = [
        {
          id: 'evt-1',
          type: 'workflow:started',
          sourceAgent: 'maestro',
          timestamp: Date.now(),
          correlationId: 'corr-1',
          payload: {},
        },
        {
          id: 'evt-2',
          type: 'workflow:step_completed',
          sourceAgent: 'maestro',
          timestamp: Date.now(),
          correlationId: 'corr-1',
          payload: {},
        },
        {
          id: 'evt-3',
          type: 'workflow:started',
          sourceAgent: 'maestro',
          timestamp: Date.now(),
          correlationId: 'corr-2',
          payload: {},
        },
      ];

      for (const event of events) {
        await eventBus.publish(event);
      }

      const corr1Events = eventBus.getEventsByCorrelation('corr-1');
      expect(corr1Events).toHaveLength(2);

      const corr2Events = eventBus.getEventsByCorrelation('corr-2');
      expect(corr2Events).toHaveLength(1);
    });
  });

  // ======================================================================
  // Metrics & Monitoring Tests
  // ======================================================================

  describe('Metrics & Monitoring', () => {
    it('should track workflow metrics', async () => {
      const workflow: Workflow = {
        id: 'workflow-1',
        name: 'Test',
        description: 'Test',
        version: '1.0',
        steps: [
          {
            id: 'step-1',
            agentId: 'agent-1',
            capability: 'process',
            inputs: { data: 'test' },
          },
        ],
        initialInputs: {},
        expectedOutputs: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'user-1',
      };

      maestro.defineWorkflow(workflow);

      const metrics = maestro.getMetrics();
      expect(metrics.totalWorkflows).toBeGreaterThan(0);
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
    });

    it('should get choreography metrics', () => {
      const metrics = maestro.getMetrics();

      expect(metrics).toHaveProperty('totalWorkflows');
      expect(metrics).toHaveProperty('completedWorkflows');
      expect(metrics).toHaveProperty('failedWorkflows');
      expect(metrics).toHaveProperty('successRate');
      expect(metrics).toHaveProperty('activeExecutions');
    });

    it('should track agent health', () => {
      const agent: RegisteredAgent = {
        id: 'agent-1',
        type: 'sentinel',
        name: 'Test',
        description: 'Test',
        publicKey: 'pub_key',
        capabilities: [],
        status: 'online',
        lastHeartbeat: Date.now(),
      };

      maestro.registerAgent(agent);

      const health = maestro.getAgentHealth('agent-1');
      expect(health).toBeDefined();
    });

    it('should get all agent health', () => {
      const agents: RegisteredAgent[] = [
        {
          id: 'agent-1',
          type: 'sentinel',
          name: 'Agent 1',
          description: 'Test',
          publicKey: 'pub_1',
          capabilities: [],
          status: 'online',
          lastHeartbeat: Date.now(),
        },
        {
          id: 'agent-2',
          type: 'bridge',
          name: 'Agent 2',
          description: 'Test',
          publicKey: 'pub_2',
          capabilities: [],
          status: 'online',
          lastHeartbeat: Date.now(),
        },
      ];

      agents.forEach((a) => maestro.registerAgent(a));

      const healthData = maestro.getAllAgentHealth();
      expect(healthData.length).toBeGreaterThan(0);
    });
  });

  // ======================================================================
  // Configuration Tests
  // ======================================================================

  describe('Configuration', () => {
    it('should get configuration', () => {
      const config = maestro.getConfig();

      expect(config).toHaveProperty('maxConcurrentWorkflows');
      expect(config).toHaveProperty('logLevel');
    });

    it('should update configuration', () => {
      const newConfig = {
        maxConcurrentWorkflows: 50,
        logLevel: 'debug' as const,
      };

      maestro.updateConfig(newConfig);
      const config = maestro.getConfig();

      expect(config.maxConcurrentWorkflows).toBe(50);
      expect(config.logLevel).toBe('debug');
    });
  });

  // ======================================================================
  // Integration Tests
  // ======================================================================

  describe('Integration', () => {
    it('should coordinate multi-agent workflow', async () => {
      const agent1: RegisteredAgent = {
        id: 'agent-1',
        type: 'sentinel',
        name: 'Agent 1',
        description: 'First agent',
        publicKey: 'pub_1',
        capabilities: [
          {
            id: 'process',
            name: 'Process',
            description: 'Process data',
            version: '1.0',
            inputs: { data: 'string' },
            outputs: { result: 'string' },
            tags: ['processing'],
          },
        ],
        status: 'online',
        lastHeartbeat: Date.now(),
      };

      const agent2: RegisteredAgent = {
        id: 'agent-2',
        type: 'bridge',
        name: 'Agent 2',
        description: 'Second agent',
        publicKey: 'pub_2',
        capabilities: [
          {
            id: 'validate',
            name: 'Validate',
            description: 'Validate result',
            version: '1.0',
            inputs: { result: 'string' },
            outputs: { valid: 'boolean' },
            tags: ['validation'],
          },
        ],
        status: 'online',
        lastHeartbeat: Date.now(),
      };

      maestro.registerAgent(agent1);
      maestro.registerAgent(agent2);

      const workflow: Workflow = {
        id: 'multi-agent-workflow',
        name: 'Multi-Agent Workflow',
        description: 'Coordinates multiple agents',
        version: '1.0',
        steps: [
          {
            id: 'step-1',
            agentId: 'agent-1',
            capability: 'process',
            inputs: { data: 'input-data' },
          },
          {
            id: 'step-2',
            agentId: 'agent-2',
            capability: 'validate',
            inputs: { result: '${step-1}' },
            dependencies: ['step-1'],
          },
        ],
        initialInputs: { input: 'test' },
        expectedOutputs: { valid: 'boolean' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'user-1',
      };

      maestro.defineWorkflow(workflow);

      const agents = maestro.getAllAgents();
      expect(agents).toHaveLength(2);

      const workflows = maestro.getAllWorkflows();
      expect(workflows.length).toBeGreaterThan(0);
    });

    it('should track events across execution', async () => {
      const subscription = maestro.subscribeToEvents(
        ['workflow:started', 'workflow:completed'],
        'maestro',
        async () => {},
      );

      const subscriptions = maestro.getEventsByCorrelation('corr-1');
      expect(Array.isArray(subscriptions)).toBe(true);

      maestro.unsubscribeFromEvents(subscription.id);
    });
  });
});
