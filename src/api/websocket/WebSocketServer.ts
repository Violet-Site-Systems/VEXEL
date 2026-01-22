// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * WebSocket server for real-time communication
 * Handles agent-human bidirectional communication
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { WebSocketMessage, WebSocketEvent, EmotionalState } from '../types';
import { SemanticLayer } from '../semantic/SemanticLayer';
import { EmotionalStateTracker } from '../emotional/EmotionalStateTracker';

export interface WebSocketConfig {
  cors?: {
    origin: string | string[];
    credentials?: boolean;
  };
}

export class WebSocketServer {
  private io: SocketIOServer;
  private semanticLayer: SemanticLayer;
  private emotionalTracker: EmotionalStateTracker;
  private connectedClients: Map<string, Socket> = new Map();

  constructor(httpServer: HTTPServer, config?: WebSocketConfig) {
    this.io = new SocketIOServer(httpServer, {
      cors: config?.cors || {
        origin: '*',
        credentials: true,
      },
    });

    this.semanticLayer = new SemanticLayer();
    this.emotionalTracker = new EmotionalStateTracker();
    this.setupEventHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Store client connection
      const userId = (socket.handshake.auth?.userId || socket.id) as string;
      this.connectedClients.set(userId, socket);

      // Handle message events
      socket.on(WebSocketEvent.MESSAGE, (data) => this.handleMessage(socket, data));
      socket.on(WebSocketEvent.EMOTIONAL_STATE, (data) => this.handleEmotionalState(socket, data));
      socket.on(WebSocketEvent.ACTION_REQUEST, (data) => this.handleActionRequest(socket, data));
      socket.on(WebSocketEvent.AGENT_STATUS, (data) => this.handleAgentStatus(socket, data));

      // Handle disconnection
      socket.on(WebSocketEvent.DISCONNECT, () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(userId);
      });

      // Send connection acknowledgment
      socket.emit(WebSocketEvent.CONNECT, {
        message: 'Connected to VEXEL WebSocket server',
        timestamp: new Date(),
      });
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(socket: Socket, data: any): void {
    try {
      const { from, to, message, conversationId } = data;
      
      // Infer emotional state from message
      const emotionalState = this.emotionalTracker.inferEmotionalState(message);
      
      // Get conversation context
      const context = this.semanticLayer.getContext(conversationId || socket.id);
      
      // Translate message based on direction
      let semanticMessage;
      if (from === 'human') {
        semanticMessage = this.semanticLayer.translateHumanToCopilot(message, emotionalState, context);
      } else {
        semanticMessage = this.semanticLayer.translateCopilotToHuman(message, emotionalState, context);
      }
      
      // Store message in history
      this.semanticLayer.storeMessage(conversationId || socket.id, semanticMessage);
      
      // Update emotional state
      const userId = socket.handshake.auth?.userId || socket.id;
      this.emotionalTracker.updateState(userId, emotionalState);
      
      // Send to recipient or broadcast
      const wsMessage: WebSocketMessage = {
        event: WebSocketEvent.MESSAGE,
        data: semanticMessage,
        timestamp: new Date(),
        sender: from,
        recipient: to,
      };

      if (to && this.connectedClients.has(to)) {
        this.connectedClients.get(to)!.emit(WebSocketEvent.MESSAGE, wsMessage);
      } else {
        socket.broadcast.emit(WebSocketEvent.MESSAGE, wsMessage);
      }
      
      // Acknowledge to sender
      socket.emit(WebSocketEvent.MESSAGE, {
        ...wsMessage,
        data: { ...semanticMessage, status: 'delivered' },
      });
    } catch (error) {
      socket.emit(WebSocketEvent.ERROR, {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle emotional state updates
   */
  private handleEmotionalState(socket: Socket, data: any): void {
    try {
      const { entityId, emotionalState } = data as { entityId: string; emotionalState: EmotionalState };
      
      this.emotionalTracker.updateState(entityId, emotionalState);
      
      // Broadcast emotional state change
      socket.broadcast.emit(WebSocketEvent.EMOTIONAL_STATE, {
        entityId,
        emotionalState,
        timestamp: new Date(),
      });
      
      // Check for emotional transitions
      const transition = this.emotionalTracker.detectTransition(entityId);
      if (transition.hasTransition) {
        socket.broadcast.emit(WebSocketEvent.EMOTIONAL_STATE, {
          entityId,
          transition,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      socket.emit(WebSocketEvent.ERROR, {
        error: 'Failed to update emotional state',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle action requests
   */
  private handleActionRequest(socket: Socket, data: any): void {
    // Broadcast action request to relevant parties
    socket.broadcast.emit(WebSocketEvent.ACTION_REQUEST, {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Handle agent status updates
   */
  private handleAgentStatus(socket: Socket, data: any): void {
    // Broadcast agent status to all connected clients
    this.io.emit(WebSocketEvent.AGENT_STATUS, {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Send message to specific client
   */
  sendToClient(userId: string, event: WebSocketEvent, data: any): boolean {
    const client = this.connectedClients.get(userId);
    if (client) {
      client.emit(event, { ...data, timestamp: new Date() });
      return true;
    }
    return false;
  }

  /**
   * Broadcast to all clients
   */
  broadcast(event: WebSocketEvent, data: any): void {
    this.io.emit(event, { ...data, timestamp: new Date() });
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get semantic layer instance
   */
  getSemanticLayer(): SemanticLayer {
    return this.semanticLayer;
  }

  /**
   * Get emotional tracker instance
   */
  getEmotionalTracker(): EmotionalStateTracker {
    return this.emotionalTracker;
  }
}
