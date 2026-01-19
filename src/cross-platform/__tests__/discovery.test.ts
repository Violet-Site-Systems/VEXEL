/**
 * Tests for Agent Discovery Service
 */

import { AgentDiscoveryService } from '../discovery/AgentDiscoveryService';
import {
  AgentRegistration,
  AgentStatus,
  DiscoveryRequest,
  CrossPlatformEvent,
} from '../types';

describe('AgentDiscoveryService', () => {
  let discoveryService: AgentDiscoveryService;

  beforeEach(() => {
    discoveryService = new AgentDiscoveryService({
      heartbeatInterval: 1000,
      heartbeatTimeout: 3000,
    });
  });

  afterEach(() => {
    discoveryService.shutdown();
  });

  describe('registerAgent', () => {
    it('should register an agent successfully', async () => {
      const registration: AgentRegistration = {
        agentId: 'agent-001',
        did: 'did:vexel:0x123',
        address: '0x123',
        capabilities: ['chat', 'analyze'],
        metadata: { version: '1.0' },
        endpoint: 'localhost:50051',
      };

      const result = await discoveryService.registerAgent(registration);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.sessionId).toContain('agent-001');
    });

    it('should emit registration event', (done) => {
      const registration: AgentRegistration = {
        agentId: 'agent-002',
        did: 'did:vexel:0x456',
        address: '0x456',
        capabilities: ['translate'],
        endpoint: 'localhost:50052',
      };

      discoveryService.on(CrossPlatformEvent.AGENT_REGISTERED, (data) => {
        expect(data.event).toBe(CrossPlatformEvent.AGENT_REGISTERED);
        expect(data.agentId).toBe('agent-002');
        done();
      });

      discoveryService.registerAgent(registration);
    });

    it('should reject duplicate registration', async () => {
      const registration: AgentRegistration = {
        agentId: 'agent-003',
        did: 'did:vexel:0x789',
        address: '0x789',
        capabilities: ['chat'],
        endpoint: 'localhost:50053',
      };

      await discoveryService.registerAgent(registration);

      await expect(
        discoveryService.registerAgent(registration)
      ).rejects.toThrow('already registered');
    });

    it('should reject registration with missing fields', async () => {
      const invalidRegistration = {
        agentId: 'agent-004',
        // missing did, address, endpoint
      } as AgentRegistration;

      await expect(
        discoveryService.registerAgent(invalidRegistration)
      ).rejects.toThrow('Missing required registration fields');
    });
  });

  describe('discoverAgents', () => {
    beforeEach(async () => {
      // Register multiple agents
      await discoveryService.registerAgent({
        agentId: 'agent-chat-1',
        did: 'did:vexel:0x111',
        address: '0x111',
        capabilities: ['chat', 'translate'],
        metadata: { language: 'en' },
        endpoint: 'localhost:50051',
      });

      await discoveryService.registerAgent({
        agentId: 'agent-chat-2',
        did: 'did:vexel:0x222',
        address: '0x222',
        capabilities: ['chat', 'summarize'],
        metadata: { language: 'es' },
        endpoint: 'localhost:50052',
      });

      await discoveryService.registerAgent({
        agentId: 'agent-analyze-1',
        did: 'did:vexel:0x333',
        address: '0x333',
        capabilities: ['analyze', 'report'],
        metadata: { language: 'en' },
        endpoint: 'localhost:50053',
      });
    });

    it('should discover all agents when no filters', async () => {
      const request: DiscoveryRequest = {};
      const response = await discoveryService.discoverAgents(request);

      expect(response.agents.length).toBeGreaterThanOrEqual(3);
      expect(response.totalCount).toBeGreaterThanOrEqual(3);
    });

    it('should discover agents by capability', async () => {
      const request: DiscoveryRequest = {
        capabilities: ['chat'],
      };

      const response = await discoveryService.discoverAgents(request);

      expect(response.agents.length).toBe(2);
      expect(response.agents.every(a => a.capabilities.includes('chat'))).toBe(true);
    });

    it('should discover agents by metadata', async () => {
      const request: DiscoveryRequest = {
        filters: { language: 'en' },
      };

      const response = await discoveryService.discoverAgents(request);

      expect(response.agents.length).toBe(2);
      expect(response.agents.every(a => a.metadata?.language === 'en')).toBe(true);
    });

    it('should limit results', async () => {
      const request: DiscoveryRequest = {
        maxResults: 1,
      };

      const response = await discoveryService.discoverAgents(request);

      expect(response.agents.length).toBe(1);
      expect(response.totalCount).toBeGreaterThanOrEqual(3);
    });

    it('should discover agents by multiple criteria', async () => {
      const request: DiscoveryRequest = {
        capabilities: ['chat'],
        filters: { language: 'en' },
      };

      const response = await discoveryService.discoverAgents(request);

      expect(response.agents.length).toBe(1);
      expect(response.agents[0].agentId).toBe('agent-chat-1');
    });
  });

  describe('heartbeat', () => {
    it('should process heartbeat successfully', async () => {
      const registration: AgentRegistration = {
        agentId: 'agent-hb-1',
        did: 'did:vexel:0xabc',
        address: '0xabc',
        capabilities: ['chat'],
        endpoint: 'localhost:50051',
      };

      const result = await discoveryService.registerAgent(registration);
      const success = await discoveryService.heartbeat(
        'agent-hb-1',
        result.sessionId,
        AgentStatus.ACTIVE
      );

      expect(success).toBe(true);
    });

    it('should update agent status', async () => {
      const registration: AgentRegistration = {
        agentId: 'agent-hb-2',
        did: 'did:vexel:0xdef',
        address: '0xdef',
        capabilities: ['chat'],
        endpoint: 'localhost:50052',
      };

      const result = await discoveryService.registerAgent(registration);
      await discoveryService.heartbeat('agent-hb-2', result.sessionId, AgentStatus.BUSY);

      const agent = discoveryService.getAgent('agent-hb-2');
      expect(agent?.status).toBe(AgentStatus.BUSY);
    });

    it('should reject heartbeat with invalid session', async () => {
      const success = await discoveryService.heartbeat(
        'agent-invalid',
        'invalid-session',
        AgentStatus.ACTIVE
      );

      expect(success).toBe(false);
    });

    it('should mark agent offline after timeout', (done) => {
      const registration: AgentRegistration = {
        agentId: 'agent-timeout',
        did: 'did:vexel:0xfff',
        address: '0xfff',
        capabilities: ['chat'],
        endpoint: 'localhost:50053',
      };

      discoveryService.registerAgent(registration).then(() => {
        discoveryService.on(CrossPlatformEvent.AGENT_DISCONNECTED, (data) => {
          if (data.agentId === 'agent-timeout') {
            const agent = discoveryService.getAgent('agent-timeout');
            expect(agent?.status).toBe(AgentStatus.OFFLINE);
            done();
          }
        });
      });
    }, 5000);
  });

  describe('unregisterAgent', () => {
    it('should unregister agent successfully', async () => {
      const registration: AgentRegistration = {
        agentId: 'agent-unreg-1',
        did: 'did:vexel:0x999',
        address: '0x999',
        capabilities: ['chat'],
        endpoint: 'localhost:50051',
      };

      const result = await discoveryService.registerAgent(registration);
      const success = await discoveryService.unregisterAgent('agent-unreg-1', result.sessionId);

      expect(success).toBe(true);
      expect(discoveryService.getAgent('agent-unreg-1')).toBeUndefined();
    });

    it('should emit disconnection event', (done) => {
      const registration: AgentRegistration = {
        agentId: 'agent-unreg-2',
        did: 'did:vexel:0x888',
        address: '0x888',
        capabilities: ['chat'],
        endpoint: 'localhost:50052',
      };

      discoveryService.registerAgent(registration).then(result => {
        discoveryService.on(CrossPlatformEvent.AGENT_DISCONNECTED, (data) => {
          if (data.agentId === 'agent-unreg-2') {
            expect(data.event).toBe(CrossPlatformEvent.AGENT_DISCONNECTED);
            done();
          }
        });

        discoveryService.unregisterAgent('agent-unreg-2', result.sessionId);
      });
    });

    it('should reject unregistration with invalid session', async () => {
      const success = await discoveryService.unregisterAgent('agent-invalid', 'invalid-session');
      expect(success).toBe(false);
    });
  });

  describe('getAgent', () => {
    it('should return agent info', async () => {
      const registration: AgentRegistration = {
        agentId: 'agent-get-1',
        did: 'did:vexel:0x555',
        address: '0x555',
        capabilities: ['chat'],
        endpoint: 'localhost:50051',
      };

      await discoveryService.registerAgent(registration);
      const agent = discoveryService.getAgent('agent-get-1');

      expect(agent).toBeDefined();
      expect(agent?.agentId).toBe('agent-get-1');
      expect(agent?.did).toBe('did:vexel:0x555');
    });

    it('should return undefined for non-existent agent', () => {
      const agent = discoveryService.getAgent('non-existent');
      expect(agent).toBeUndefined();
    });
  });

  describe('getAllAgents', () => {
    it('should return all registered agents', async () => {
      await discoveryService.registerAgent({
        agentId: 'agent-all-1',
        did: 'did:vexel:0x101',
        address: '0x101',
        capabilities: ['chat'],
        endpoint: 'localhost:50051',
      });

      await discoveryService.registerAgent({
        agentId: 'agent-all-2',
        did: 'did:vexel:0x102',
        address: '0x102',
        capabilities: ['chat'],
        endpoint: 'localhost:50052',
      });

      const agents = discoveryService.getAllAgents();
      expect(agents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getAgentCount', () => {
    it('should return correct agent count', async () => {
      const initialCount = discoveryService.getAgentCount();

      await discoveryService.registerAgent({
        agentId: 'agent-count-1',
        did: 'did:vexel:0x201',
        address: '0x201',
        capabilities: ['chat'],
        endpoint: 'localhost:50051',
      });

      expect(discoveryService.getAgentCount()).toBe(initialCount + 1);
    });
  });
});
