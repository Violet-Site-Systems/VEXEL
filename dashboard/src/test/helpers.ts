/**
 * Helper functions for tests
 */
import { Agent, GuardianAlert, InheritanceTrigger, AgentStatus, AlertSeverity } from '../types';

export function createMockAgent(overrides?: Partial<Agent>): Agent {
  return {
    agentId: 'agent-test-001',
    did: 'did:vexel:0xtest123',
    status: 'active' as AgentStatus,
    lastHeartbeat: new Date(),
    capabilities: ['messaging', 'analysis'],
    emotionalState: {
      emotion: 'neutral',
      intensity: 0.5,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockAlert(overrides?: Partial<GuardianAlert>): GuardianAlert {
  return {
    alertId: 'alert-test-001',
    agentId: 'agent-test-001',
    type: 'heartbeat_missed',
    severity: 'warning' as AlertSeverity,
    message: 'Agent missed heartbeat check',
    timestamp: new Date(),
    acknowledged: false,
    ...overrides,
  };
}

export function createMockTrigger(overrides?: Partial<InheritanceTrigger>): InheritanceTrigger {
  return {
    triggerId: 'trigger-test-001',
    agentId: 'agent-test-001',
    type: 'heartbeat_failure',
    status: 'pending',
    beneficiaries: ['user-001', 'user-002'],
    lastCheckTimestamp: new Date(),
    missedHeartbeats: 2,
    threshold: 5,
    ...overrides,
  };
}
