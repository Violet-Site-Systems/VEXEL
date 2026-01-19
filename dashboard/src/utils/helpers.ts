/**
 * Utility functions for the dashboard
 */
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { Agent, AgentStatus, AlertSeverity } from '../types';

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm:ss');
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Status color theme configuration
 */
const STATUS_COLORS = {
  active: {
    text: 'text-green-500',
    bg: 'bg-green-500/20',
    value: '#10b981',
  },
  inactive: {
    text: 'text-gray-500',
    bg: 'bg-gray-500/20',
    value: '#6b7280',
  },
  paused: {
    text: 'text-yellow-500',
    bg: 'bg-yellow-500/20',
    value: '#f59e0b',
  },
  error: {
    text: 'text-red-500',
    bg: 'bg-red-500/20',
    value: '#ef4444',
  },
} as const;

/**
 * Alert severity color theme configuration
 */
const SEVERITY_COLORS = {
  info: {
    text: 'text-blue-500',
    bg: 'bg-blue-500/20',
    value: '#3b82f6',
  },
  warning: {
    text: 'text-yellow-500',
    bg: 'bg-yellow-500/20',
    value: '#f59e0b',
  },
  critical: {
    text: 'text-red-500',
    bg: 'bg-red-500/20',
    value: '#ef4444',
  },
} as const;

/**
 * Get status color for agent
 */
export function getStatusColor(status: AgentStatus): string {
  return STATUS_COLORS[status]?.text || STATUS_COLORS.inactive.text;
}

/**
 * Get status background color for agent
 */
export function getStatusBgColor(status: AgentStatus): string {
  return STATUS_COLORS[status]?.bg || STATUS_COLORS.inactive.bg;
}

/**
 * Get status color value (hex) for agent
 */
export function getStatusColorValue(status: AgentStatus): string {
  return STATUS_COLORS[status]?.value || STATUS_COLORS.inactive.value;
}

/**
 * Get severity color for alert
 */
export function getSeverityColor(severity: AlertSeverity): string {
  return SEVERITY_COLORS[severity]?.text || 'text-gray-500';
}

/**
 * Get severity background color for alert
 */
export function getSeverityBgColor(severity: AlertSeverity): string {
  return SEVERITY_COLORS[severity]?.bg || 'bg-gray-500/20';
}

/**
 * Get severity color value (hex) for alert
 */
export function getSeverityColorValue(severity: AlertSeverity): string {
  return SEVERITY_COLORS[severity]?.value || '#6b7280';
}

/**
 * Filter agents by search query and status
 */
export function filterAgents(
  agents: Agent[],
  searchQuery: string,
  statusFilter: AgentStatus[]
): Agent[] {
  let filtered = agents;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (agent) =>
        agent.agentId.toLowerCase().includes(query) ||
        agent.did.toLowerCase().includes(query) ||
        agent.capabilities.some((cap) => cap.toLowerCase().includes(query))
    );
  }

  if (statusFilter.length > 0) {
    filtered = filtered.filter((agent) => statusFilter.includes(agent.status));
  }

  return filtered;
}

/**
 * Calculate agent health score (0-100)
 */
export function calculateAgentHealth(agent: Agent): number {
  let score = 100;

  // Deduct points based on status
  if (agent.status === 'paused') score -= 20;
  if (agent.status === 'inactive') score -= 50;
  if (agent.status === 'error') score -= 80;

  // Deduct points based on last heartbeat
  const timeSinceHeartbeat = Date.now() - new Date(agent.lastHeartbeat).getTime();
  const hoursSinceHeartbeat = timeSinceHeartbeat / (1000 * 60 * 60);

  if (hoursSinceHeartbeat > 24) score -= 30;
  else if (hoursSinceHeartbeat > 12) score -= 15;
  else if (hoursSinceHeartbeat > 6) score -= 5;

  return Math.max(0, score);
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

/**
 * Generate random color for visualization
 */
export function generateColor(index: number): string {
  const colors = [
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
  ];
  return colors[index % colors.length];
}

/**
 * Check if date is within range
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return isAfter(date, start) && isBefore(date, end);
}
