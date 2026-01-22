// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Agent status types
 */
export type AgentStatus = 'active' | 'inactive' | 'paused' | 'error';

/**
 * Agent interface
 */
export interface Agent {
  agentId: string;
  did: string;
  status: AgentStatus;
  lastHeartbeat: Date;
  capabilities: string[];
  emotionalState?: {
    emotion: string;
    intensity: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Guardian alert types
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 'heartbeat_missed' | 'status_change' | 'inheritance_trigger' | 'security' | 'system';

/**
 * Guardian alert interface
 */
export interface GuardianAlert {
  alertId: string;
  agentId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

/**
 * Inheritance trigger interface
 */
export interface InheritanceTrigger {
  triggerId: string;
  agentId: string;
  type: 'heartbeat_failure' | 'manual' | 'scheduled';
  status: 'pending' | 'active' | 'completed' | 'failed';
  beneficiaries: string[];
  lastCheckTimestamp: Date;
  missedHeartbeats: number;
  threshold: number;
  triggeredAt?: Date;
  completedAt?: Date;
}

/**
 * WebSocket message types
 */
export interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: Date;
  sender?: string;
  recipient?: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  criticalAlerts: number;
  pendingTriggers: number;
}

/**
 * Filter options
 */
export interface FilterOptions {
  status?: AgentStatus[];
  alertSeverity?: AlertSeverity[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

/**
 * Chart data types
 */
export interface ChartDataPoint {
  label: string;
  value: number;
}
