// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * WebSocket service for real-time communication with VEXEL API Gateway
 */
import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, Agent, GuardianAlert, InheritanceTrigger } from '../types';

export type EventCallback = (data: any) => void;

export class WebSocketService {
  private socket: Socket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers: Map<string, Set<EventCallback>> = new Map();

  constructor(url: string = 'http://localhost:3000') {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.token = token || null;

        this.socket = io(this.url, {
          auth: {
            token: this.token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from WebSocket server:', reason);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Max reconnection attempts reached'));
          }
        });

        // Set up message handlers
        this.setupMessageHandlers();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  /**
   * Set up message handlers for different event types
   */
  private setupMessageHandlers(): void {
    if (!this.socket) return;

    this.socket.on('message', (data: WebSocketMessage) => {
      this.emit('message', data);
    });

    this.socket.on('agent_status', (data: Agent) => {
      this.emit('agent_status', data);
    });

    this.socket.on('guardian_alert', (data: GuardianAlert) => {
      this.emit('guardian_alert', data);
    });

    this.socket.on('inheritance_trigger', (data: InheritanceTrigger) => {
      this.emit('inheritance_trigger', data);
    });

    this.socket.on('emotional_state', (data: any) => {
      this.emit('emotional_state', data);
    });

    this.socket.on('error', (data: any) => {
      this.emit('error', data);
    });
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(callback);
    }
  }

  /**
   * Emit event to handlers
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((callback) => callback(data));
    }
  }

  /**
   * Send message through WebSocket
   */
  send(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('WebSocket not connected');
    }
  }

  /**
   * Subscribe to agent status updates
   */
  subscribeToAgentUpdates(callback: (agent: Agent) => void): void {
    this.on('agent_status', callback);
  }

  /**
   * Subscribe to guardian alerts
   */
  subscribeToAlerts(callback: (alert: GuardianAlert) => void): void {
    this.on('guardian_alert', callback);
  }

  /**
   * Subscribe to inheritance triggers
   */
  subscribeToTriggers(callback: (trigger: InheritanceTrigger) => void): void {
    this.on('inheritance_trigger', callback);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, userId: string): void {
    this.send('acknowledge_alert', { alertId, userId });
  }

  /**
   * Request agent status update
   */
  requestAgentStatus(agentId?: string): void {
    this.send('request_agent_status', { agentId });
  }

  /**
   * Update authentication token and reconnect
   */
  updateToken(newToken: string): void {
    if (this.token === newToken) {
      return; // No change needed
    }

    this.token = newToken;

    // If connected, reconnect with new token
    if (this.socket && this.socket.connected) {
      this.disconnect();
      this.connect(newToken).catch((err) => {
        console.error('Failed to reconnect with new token:', err);
      });
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
