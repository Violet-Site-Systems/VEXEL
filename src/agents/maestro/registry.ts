/**
 * Agent Registry - Maestro Agent
 * Manages registration, discovery, and lifecycle of agents in the MAS
 */

import { RegisteredAgent, AgentCapability, AgentQuery, AgentHealth } from './types';

export class AgentRegistry {
  private agents: Map<string, RegisteredAgent> = new Map();
  private capabilities: Map<string, AgentCapability[]> = new Map();
  private healthMetrics: Map<string, AgentHealth> = new Map();

  /**
   * Register an agent in the registry
   */
  registerAgent(agent: RegisteredAgent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent ${agent.id} is already registered`);
    }

    this.agents.set(agent.id, agent);
    this.healthMetrics.set(agent.id, {
      agentId: agent.id,
      status: 'healthy',
      responseTime: 0,
      errorRate: 0,
      lastCheck: Date.now(),
      uptime: 100,
      capabilities: agent.capabilities.map((cap) => ({
        name: cap.name,
        successRate: 100,
        averageTime: 0,
      })),
    });

    // Index capabilities
    for (const capability of agent.capabilities) {
      const key = `${agent.id}:${capability.id}`;
      if (!this.capabilities.has(key)) {
        this.capabilities.set(key, []);
      }
      this.capabilities.get(key)!.push(capability);
    }
  }

  /**
   * Deregister an agent from the registry
   */
  deregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.agents.delete(agentId);
    this.healthMetrics.delete(agentId);

    // Remove from capability index
    for (const capability of agent.capabilities) {
      const key = `${agentId}:${capability.id}`;
      this.capabilities.delete(key);
    }
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): RegisteredAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): RegisteredAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Query agents by criteria
   */
  queryAgents(query: AgentQuery): RegisteredAgent[] {
    let results = Array.from(this.agents.values());

    if (query.types && query.types.length > 0) {
      results = results.filter((agent) => query.types!.includes(agent.type));
    }

    if (query.status && query.status.length > 0) {
      results = results.filter((agent) => query.status!.includes(agent.status));
    }

    if (query.capabilities && query.capabilities.length > 0) {
      results = results.filter((agent) => {
        const agentCapNames = agent.capabilities.map((c) => c.id);
        return query.capabilities!.some((cap) => agentCapNames.includes(cap));
      });
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter((agent) => {
        return query.tags!.some((tag) => {
          return agent.capabilities.some((cap) => cap.tags.includes(tag));
        });
      });
    }

    return results;
  }

  /**
   * Get capability from specific agent
   */
  getCapability(agentId: string, capabilityId: string): AgentCapability | undefined {
    const agent = this.getAgent(agentId);
    if (!agent) return undefined;
    return agent.capabilities.find((cap) => cap.id === capabilityId);
  }

  /**
   * Find agents with specific capability
   */
  findAgentsByCapability(capabilityId: string): RegisteredAgent[] {
    return Array.from(this.agents.values()).filter((agent) =>
      agent.capabilities.some((cap) => cap.id === capabilityId),
    );
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId: string, status: RegisteredAgent['status']): void {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    agent.status = status;
    agent.lastHeartbeat = Date.now();
  }

  /**
   * Update agent metadata
   */
  updateAgentMetadata(agentId: string, metadata: Record<string, unknown>): void {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    agent.metadata = { ...agent.metadata, ...metadata };
  }

  /**
   * Record health metrics for agent
   */
  recordHealth(health: AgentHealth): void {
    this.healthMetrics.set(health.agentId, health);
    const agent = this.getAgent(health.agentId);
    if (agent) {
      if (health.status === 'unhealthy') {
        agent.status = 'offline';
      } else if (health.status === 'degraded') {
        agent.status = 'degraded';
      } else {
        agent.status = 'online';
      }
    }
  }

  /**
   * Get health metrics for agent
   */
  getHealth(agentId: string): AgentHealth | undefined {
    return this.healthMetrics.get(agentId);
  }

  /**
   * Get health metrics for all agents
   */
  getAllHealth(): AgentHealth[] {
    return Array.from(this.healthMetrics.values());
  }

  /**
   * Check if agent is online
   */
  isAgentOnline(agentId: string): boolean {
    const agent = this.getAgent(agentId);
    return agent ? agent.status === 'online' : false;
  }

  /**
   * Get count of online agents
   */
  getOnlineAgentCount(): number {
    return Array.from(this.agents.values()).filter((a) => a.status === 'online').length;
  }

  /**
   * Get count of all agents
   */
  getTotalAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Clear all registrations (for testing)
   */
  clear(): void {
    this.agents.clear();
    this.capabilities.clear();
    this.healthMetrics.clear();
  }
}
