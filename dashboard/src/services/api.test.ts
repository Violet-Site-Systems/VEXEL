/**
 * Tests for API service
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiService } from '../services/api';

// Mock fetch
global.fetch = vi.fn();

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    service = new ApiService();
    vi.clearAllMocks();
  });

  it('initializes correctly', () => {
    expect(service).toBeDefined();
  });

  it('can set token', () => {
    service.setToken('test-token');
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('calls login endpoint with correct parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: { userId: 'user-123', role: 'human' },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.login('user-123', 'human');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.token).toBe('test-token');
    });

    it('throws error on failed login', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Login failed' }),
      });

      await expect(service.login('user-123', 'human')).rejects.toThrow();
    });
  });

  describe('getAlerts', () => {
    it('returns empty array (mock implementation)', async () => {
      const alerts = await service.getAlerts();
      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBe(0);
    });
  });

  describe('getTriggers', () => {
    it('returns empty array (mock implementation)', async () => {
      const triggers = await service.getTriggers();
      expect(Array.isArray(triggers)).toBe(true);
      expect(triggers.length).toBe(0);
    });
  });

  describe('acknowledgeAlert', () => {
    it('executes without error', async () => {
      await expect(
        service.acknowledgeAlert('alert-123', 'user-123')
      ).resolves.not.toThrow();
    });
  });

  describe('getDashboardStats', () => {
    it('calculates stats correctly with empty data', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const stats = await service.getDashboardStats();

      expect(stats).toHaveProperty('totalAgents');
      expect(stats).toHaveProperty('activeAgents');
      expect(stats).toHaveProperty('inactiveAgents');
      expect(stats).toHaveProperty('criticalAlerts');
      expect(stats).toHaveProperty('pendingTriggers');
    });
  });

  describe('healthCheck', () => {
    it('calls health endpoint', async () => {
      const mockHealth = { status: 'ok', timestamp: new Date().toISOString() };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
      });

      const result = await service.healthCheck();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/health'));
      expect(result.status).toBe('ok');
    });
  });
});
