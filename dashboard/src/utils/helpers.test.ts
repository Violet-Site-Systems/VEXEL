// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Tests for utility helper functions
 */
import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatRelativeTime,
  getStatusColor,
  getSeverityColor,
  filterAgents,
  calculateAgentHealth,
  truncate,
} from '../utils/helpers';
import { createMockAgent } from '../test/helpers';

describe('Utility Helpers', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('2024');
    });

    it('handles string dates', () => {
      const formatted = formatDate('2024-01-15T10:30:00Z');
      expect(formatted).toContain('Jan');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats recent dates correctly', () => {
      const date = new Date();
      const formatted = formatRelativeTime(date);
      expect(formatted).toContain('ago');
    });
  });

  describe('getStatusColor', () => {
    it('returns correct color for active status', () => {
      expect(getStatusColor('active')).toBe('text-green-500');
    });

    it('returns correct color for error status', () => {
      expect(getStatusColor('error')).toBe('text-red-500');
    });
  });

  describe('getSeverityColor', () => {
    it('returns correct color for critical severity', () => {
      expect(getSeverityColor('critical')).toBe('text-red-500');
    });

    it('returns correct color for info severity', () => {
      expect(getSeverityColor('info')).toBe('text-blue-500');
    });
  });

  describe('filterAgents', () => {
    it('filters by search query', () => {
      const agents = [
        createMockAgent({ agentId: 'agent-001' }),
        createMockAgent({ agentId: 'agent-002' }),
      ];
      const filtered = filterAgents(agents, '001', []);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].agentId).toBe('agent-001');
    });

    it('filters by status', () => {
      const agents = [
        createMockAgent({ status: 'active' }),
        createMockAgent({ status: 'inactive' }),
      ];
      const filtered = filterAgents(agents, '', ['active']);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('active');
    });

    it('applies both search and status filters', () => {
      const agents = [
        createMockAgent({ agentId: 'agent-001', status: 'active' }),
        createMockAgent({ agentId: 'agent-002', status: 'inactive' }),
      ];
      const filtered = filterAgents(agents, '001', ['active']);
      expect(filtered).toHaveLength(1);
    });
  });

  describe('calculateAgentHealth', () => {
    it('returns 100 for active agent with recent heartbeat', () => {
      const agent = createMockAgent({
        status: 'active',
        lastHeartbeat: new Date(),
      });
      const health = calculateAgentHealth(agent);
      expect(health).toBe(100);
    });

    it('penalizes inactive agents', () => {
      const agent = createMockAgent({
        status: 'inactive',
        lastHeartbeat: new Date(),
      });
      const health = calculateAgentHealth(agent);
      expect(health).toBeLessThan(100);
    });

    it('penalizes old heartbeats', () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25);
      const agent = createMockAgent({
        status: 'active',
        lastHeartbeat: oldDate,
      });
      const health = calculateAgentHealth(agent);
      expect(health).toBeLessThan(100);
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      const result = truncate('This is a very long string', 10);
      expect(result).toBe('This is a ...');
      expect(result.length).toBeLessThanOrEqual(13);
    });

    it('does not truncate short strings', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });
  });
});
