/**
 * Agent Discovery Service
 * Manages agent registration, discovery, and presence
 */

import { EventEmitter } from 'events';
import {
  AgentRegistration,
  AgentInfo,
  AgentStatus,
  DiscoveryRequest,
  DiscoveryResponse,
  IAgentDiscoveryService,
  CrossPlatformEvent,
} from '../types';

export interface AgentDiscoveryConfig {
  heartbeatInterval?: number;  // milliseconds
  heartbeatTimeout?: number;   // milliseconds
  maxAgents?: number;
}

export class AgentDiscoveryService extends EventEmitter implements IAgentDiscoveryService {
  private agents: Map<string, AgentInfo> = new Map();
  private sessions: Map<string, string> = new Map(); // sessionId -> agentId
  private heartbeatTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: Required<AgentDiscoveryConfig>;

  constructor(config: AgentDiscoveryConfig = {}) {
    super();
    this.config = {
      heartbeatInterval: config.heartbeatInterval || 30000,  // 30 seconds
      heartbeatTimeout: config.heartbeatTimeout || 90000,    // 90 seconds
      maxAgents: config.maxAgents || 1000,
    };
  }

  /**
   * Register agent with discovery service
   */
  async registerAgent(registration: AgentRegistration): Promise<{ success: boolean; sessionId: string }> {
    try {
      // Check capacity
      if (this.agents.size >= this.config.maxAgents) {
        throw new Error('Maximum agent capacity reached');
      }

      // Validate registration
      this.validateRegistration(registration);

      // Generate session ID
      const sessionId = this.generateSessionId(registration.agentId);

      // Create agent info
      const agentInfo: AgentInfo = {
        agentId: registration.agentId,
        did: registration.did,
        address: registration.address,
        capabilities: registration.capabilities,
        metadata: registration.metadata || {},
        endpoint: registration.endpoint,
        lastSeen: Date.now(),
        status: AgentStatus.ACTIVE,
      };

      // Store agent and session
      this.agents.set(registration.agentId, agentInfo);
      this.sessions.set(sessionId, registration.agentId);

      // Start heartbeat monitoring
      this.startHeartbeatMonitoring(registration.agentId);

      // Emit registration event
      this.emit(CrossPlatformEvent.AGENT_REGISTERED, {
        event: CrossPlatformEvent.AGENT_REGISTERED,
        data: agentInfo,
        timestamp: new Date(),
        agentId: registration.agentId,
      });

      console.log(`Agent registered: ${registration.agentId} (DID: ${registration.did})`);

      return { success: true, sessionId };
    } catch (error) {
      console.error(`Failed to register agent ${registration.agentId}:`, error);
      throw error;
    }
  }

  /**
   * Discover agents by capabilities and filters
   */
  async discoverAgents(request: DiscoveryRequest): Promise<DiscoveryResponse> {
    try {
      let matchedAgents: AgentInfo[] = Array.from(this.agents.values());

      // Filter by capabilities
      if (request.capabilities && request.capabilities.length > 0) {
        matchedAgents = matchedAgents.filter(agent =>
          request.capabilities!.some(cap => agent.capabilities.includes(cap))
        );
      }

      // Filter by metadata
      if (request.filters && Object.keys(request.filters).length > 0) {
        matchedAgents = matchedAgents.filter(agent => {
          if (!agent.metadata) return false;
          return Object.entries(request.filters!).every(
            ([key, value]) => agent.metadata![key] === value
          );
        });
      }

      // Limit results
      const maxResults = request.maxResults || 10;
      const limitedAgents = matchedAgents.slice(0, maxResults);

      // Emit discovery event
      this.emit(CrossPlatformEvent.AGENT_DISCOVERED, {
        event: CrossPlatformEvent.AGENT_DISCOVERED,
        data: { request, foundCount: limitedAgents.length },
        timestamp: new Date(),
      });

      return {
        agents: limitedAgents,
        totalCount: matchedAgents.length,
      };
    } catch (error) {
      console.error('Failed to discover agents:', error);
      throw error;
    }
  }

  /**
   * Process heartbeat from agent
   */
  async heartbeat(agentId: string, sessionId: string, status: AgentStatus): Promise<boolean> {
    try {
      // Validate session
      if (!this.validateSession(agentId, sessionId)) {
        throw new Error(`Invalid session for agent ${agentId}`);
      }

      // Update agent info
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      agent.lastSeen = Date.now();
      agent.status = status;

      // Reset heartbeat timer
      this.resetHeartbeatTimer(agentId);

      return true;
    } catch (error) {
      console.error(`Heartbeat failed for agent ${agentId}:`, error);
      return false;
    }
  }

  /**
   * Unregister agent from discovery service
   */
  async unregisterAgent(agentId: string, sessionId: string): Promise<boolean> {
    try {
      // Validate session
      if (!this.validateSession(agentId, sessionId)) {
        throw new Error(`Invalid session for agent ${agentId}`);
      }

      // Remove agent
      this.agents.delete(agentId);
      this.sessions.delete(sessionId);

      // Clear heartbeat timer
      const timer = this.heartbeatTimers.get(agentId);
      if (timer) {
        clearTimeout(timer);
        this.heartbeatTimers.delete(agentId);
      }

      // Emit disconnection event
      this.emit(CrossPlatformEvent.AGENT_DISCONNECTED, {
        event: CrossPlatformEvent.AGENT_DISCONNECTED,
        data: { agentId },
        timestamp: new Date(),
        agentId,
      });

      console.log(`Agent unregistered: ${agentId}`);

      return true;
    } catch (error) {
      console.error(`Failed to unregister agent ${agentId}:`, error);
      return false;
    }
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AgentInfo | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all active agents
   */
  getAllAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent count
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Private helper methods
   */
  private validateRegistration(registration: AgentRegistration): void {
    if (!registration.agentId || !registration.did || !registration.address) {
      throw new Error('Missing required registration fields');
    }

    if (!registration.endpoint) {
      throw new Error('Agent endpoint is required');
    }

    if (this.agents.has(registration.agentId)) {
      throw new Error(`Agent ${registration.agentId} is already registered`);
    }
  }

  private generateSessionId(agentId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${agentId}-${timestamp}-${random}`;
  }

  private validateSession(agentId: string, sessionId: string): boolean {
    const storedAgentId = this.sessions.get(sessionId);
    return storedAgentId === agentId;
  }

  private startHeartbeatMonitoring(agentId: string): void {
    // Clear existing timer if any
    const existingTimer = this.heartbeatTimers.get(agentId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timeout
    const timer = setTimeout(() => {
      this.handleHeartbeatTimeout(agentId);
    }, this.config.heartbeatTimeout);

    this.heartbeatTimers.set(agentId, timer);
  }

  private resetHeartbeatTimer(agentId: string): void {
    this.startHeartbeatMonitoring(agentId);
  }

  private handleHeartbeatTimeout(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      console.warn(`Heartbeat timeout for agent ${agentId}, marking as offline`);
      agent.status = AgentStatus.OFFLINE;

      // Emit timeout event
      this.emit(CrossPlatformEvent.AGENT_DISCONNECTED, {
        event: CrossPlatformEvent.AGENT_DISCONNECTED,
        data: { agentId, reason: 'heartbeat_timeout' },
        timestamp: new Date(),
        agentId,
      });
    }
  }

  /**
   * Cleanup and shutdown
   */
  shutdown(): void {
    // Clear all heartbeat timers
    for (const timer of this.heartbeatTimers.values()) {
      clearTimeout(timer);
    }
    this.heartbeatTimers.clear();

    // Clear all data
    this.agents.clear();
    this.sessions.clear();

    console.log('Agent discovery service shut down');
  }
}
