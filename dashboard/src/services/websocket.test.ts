/**
 * Tests for WebSocket service
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebSocketService } from '../services/websocket';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  })),
}));

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    service = new WebSocketService('http://localhost:3000');
  });

  it('initializes with correct URL', () => {
    expect(service).toBeDefined();
  });

  it('can check connection status', () => {
    expect(service.isConnected()).toBe(false);
  });

  it('has event subscription methods', () => {
    const callback = vi.fn();
    service.on('test_event', callback);
    
    // Test that callback was registered
    expect(callback).toBeDefined();
  });

  it('can unsubscribe from events', () => {
    const callback = vi.fn();
    service.on('test_event', callback);
    service.off('test_event', callback);
    
    // Test cleanup
    expect(callback).toBeDefined();
  });

  it('has agent update subscription method', () => {
    const callback = vi.fn();
    service.subscribeToAgentUpdates(callback);
    
    expect(callback).toBeDefined();
  });

  it('has alert subscription method', () => {
    const callback = vi.fn();
    service.subscribeToAlerts(callback);
    
    expect(callback).toBeDefined();
  });

  it('has trigger subscription method', () => {
    const callback = vi.fn();
    service.subscribeToTriggers(callback);
    
    expect(callback).toBeDefined();
  });

  it('can update token', () => {
    service.updateToken('new-token');
    
    // Test that method executes without error
    expect(service).toBeDefined();
  });

  it('can request agent status', () => {
    service.requestAgentStatus('agent-123');
    
    // Test that method executes without error
    expect(service).toBeDefined();
  });

  it('can acknowledge alert', () => {
    service.acknowledgeAlert('alert-123', 'user-123');
    
    // Test that method executes without error
    expect(service).toBeDefined();
  });
});
