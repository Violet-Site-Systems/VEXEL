import { DatabaseClient } from '../../database/client';
import { AgentRepository } from '../../database/repository';
import { TestDataSeeder } from '../../database/test-seeder';
import { RuntimeStatus } from '../../types';

describe('AgentRepository', () => {
  let db: DatabaseClient;
  let repository: AgentRepository;
  let seeder: TestDataSeeder;

  beforeAll(() => {
    db = new DatabaseClient();
    repository = new AgentRepository(db);
    seeder = new TestDataSeeder(db);
  });

  beforeEach(async () => {
    // Clean database before each test to ensure isolation
    await seeder.cleanAll();
  });

  afterAll(async () => {
    // Final cleanup
    await seeder.cleanAll();
    await db.close();
  });

  describe('createAgent', () => {
    it('should create a new agent', async () => {
      const input = {
        did: 'did:vexel:test:' + Date.now(),
        name: 'Test Agent',
        description: 'A test agent',
        owner_address: '0x1234567890123456789012345678901234567890',
        runtime_status: RuntimeStatus.ACTIVE,
      };

      const agent = await repository.createAgent(input);

      expect(agent).toBeDefined();
      expect(agent.id).toBeDefined();
      expect(agent.did).toBe(input.did);
      expect(agent.name).toBe(input.name);
      expect(agent.runtime_status).toBe(RuntimeStatus.ACTIVE);
    });

    it('should fail with invalid owner address', async () => {
      const input = {
        did: 'did:vexel:test:invalid',
        name: 'Invalid Agent',
        owner_address: 'invalid_address',
      };

      await expect(repository.createAgent(input)).rejects.toThrow();
    });
  });

  describe('getAgentById', () => {
    it('should retrieve an agent by ID', async () => {
      const input = {
        did: 'did:vexel:test:' + Date.now(),
        name: 'Retrievable Agent',
        owner_address: '0x1234567890123456789012345678901234567890',
      };

      const created = await repository.createAgent(input);
      const retrieved = await repository.getAgentById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.did).toBe(created.did);
    });

    it('should return null for non-existent ID', async () => {
      const retrieved = await repository.getAgentById('00000000-0000-0000-0000-000000000000');
      expect(retrieved).toBeNull();
    });
  });

  describe('updateAgentStatus', () => {
    it('should update agent status and track changes', async () => {
      const input = {
        did: 'did:vexel:test:status:' + Date.now(),
        name: 'Status Test Agent',
        owner_address: '0x1234567890123456789012345678901234567890',
        runtime_status: RuntimeStatus.ACTIVE,
      };

      const agent = await repository.createAgent(input);
      
      // Update status to SLEEP
      const updated = await repository.updateAgentStatus(agent.id, RuntimeStatus.SLEEP);
      expect(updated?.runtime_status).toBe(RuntimeStatus.SLEEP);

      // Check status history
      const history = await repository.getAgentStatusHistory(agent.id);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].new_status).toBe(RuntimeStatus.SLEEP);
      expect(history[0].previous_status).toBe(RuntimeStatus.ACTIVE);
    });
  });

  describe('capability operations', () => {
    it('should create and retrieve capabilities', async () => {
      const input = {
        did: 'did:vexel:test:capabilities:' + Date.now(),
        name: 'Capability Test Agent',
        owner_address: '0x1234567890123456789012345678901234567890',
      };

      const agent = await repository.createAgent(input);

      // Add capability
      const capability = await repository.createCapability({
        agent_id: agent.id,
        capability_name: 'communication',
        capability_value: { level: 5, protocols: ['http', 'websocket'] },
      });

      expect(capability).toBeDefined();
      expect(capability.capability_name).toBe('communication');

      // Retrieve capabilities
      const capabilities = await repository.getAgentCapabilities(agent.id);
      expect(capabilities.length).toBe(1);
      expect(capabilities[0].capability_name).toBe('communication');
    });

    it('should update capability and increment version', async () => {
      const input = {
        did: 'did:vexel:test:capability-update:' + Date.now(),
        name: 'Capability Update Agent',
        owner_address: '0x1234567890123456789012345678901234567890',
      };

      const agent = await repository.createAgent(input);

      // Add capability
      const capability = await repository.createCapability({
        agent_id: agent.id,
        capability_name: 'reasoning',
        capability_value: { level: 3 },
      });

      expect(capability.version).toBe(1);

      // Update capability
      const updated = await repository.updateCapability(
        agent.id,
        'reasoning',
        { capability_value: { level: 5 } }
      );

      expect(updated?.version).toBe(2);
    });
  });

  describe('getAgentsByStatus', () => {
    it('should filter agents by status', async () => {
      // Create active agent
      const activeAgent = await repository.createAgent({
        did: 'did:vexel:test:active:' + Date.now(),
        name: 'Active Agent',
        owner_address: '0x1234567890123456789012345678901234567890',
        runtime_status: RuntimeStatus.ACTIVE,
      });

      const activeAgents = await repository.getAgentsByStatus(RuntimeStatus.ACTIVE);
      const hasAgent = activeAgents.some(a => a.id === activeAgent.id);
      
      expect(hasAgent).toBe(true);
    });
  });
});
