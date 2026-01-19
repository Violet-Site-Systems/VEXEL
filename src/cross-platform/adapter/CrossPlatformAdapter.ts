/**
 * Cross-Platform Communication Adapter
 * Integrates gRPC, discovery, handshake, and context for agent-to-agent communication
 */

import { EventEmitter } from 'events';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import {
  CrossPlatformConfig,
  AgentRegistration,
  AgentInfo,
  AgentStatus,
  DiscoveryRequest,
  DiscoveryResponse,
  HandshakeRequest,
  HandshakeResponse,
  AgentMessage,
  MessageResponse,
  MessageType,
  DeliveryStatus,
  ContextRequest,
  ContextResponse,
  CrossPlatformEvent,
} from '../types';
import { AgentDiscoveryService } from '../discovery/AgentDiscoveryService';
import { HandshakeProtocol } from '../handshake/HandshakeProtocol';
import { ContextStorage } from '../context/ContextStorage';
import { WalletManager } from '../../wallet/WalletManager';

export class CrossPlatformAdapter extends EventEmitter {
  private config: Required<CrossPlatformConfig>;
  private discoveryService: AgentDiscoveryService;
  private handshakeProtocol: HandshakeProtocol;
  private contextStorage: ContextStorage;
  private walletManager: WalletManager;
  private grpcServer?: grpc.Server;
  private protoDescriptor: any;
  private currentAgentId?: string;
  private currentSessionId?: string;

  constructor(walletManager: WalletManager, config: CrossPlatformConfig = {}) {
    super();
    this.walletManager = walletManager;
    this.config = {
      grpcPort: config.grpcPort || 50051,
      grpcHost: config.grpcHost || '0.0.0.0',
      discoveryServiceUrl: config.discoveryServiceUrl || 'localhost:50051',
      heartbeatInterval: config.heartbeatInterval || 30000,
      sessionTimeout: config.sessionTimeout || 3600000,
      maxMessageSize: config.maxMessageSize || 4 * 1024 * 1024, // 4MB
      enableCompression: config.enableCompression !== false,
      redisUrl: config.redisUrl || 'redis://localhost:6379',
      ipfsUrl: config.ipfsUrl || 'http://127.0.0.1:5001',
    };

    // Initialize services
    this.discoveryService = new AgentDiscoveryService({
      heartbeatInterval: this.config.heartbeatInterval,
      heartbeatTimeout: this.config.heartbeatInterval * 3,
    });

    this.handshakeProtocol = new HandshakeProtocol(walletManager, {
      sessionTimeout: this.config.sessionTimeout,
    });

    this.contextStorage = new ContextStorage({
      contextTTL: this.config.sessionTimeout,
    });

    // Forward events
    this.setupEventForwarding();
  }

  /**
   * Initialize gRPC server
   */
  async initializeServer(): Promise<void> {
    try {
      // Load proto file
      const PROTO_PATH = join(__dirname, '../proto/agent.proto');
      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      this.protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

      // Create gRPC server
      this.grpcServer = new grpc.Server({
        'grpc.max_receive_message_length': this.config.maxMessageSize,
        'grpc.max_send_message_length': this.config.maxMessageSize,
      });

      // Add services
      this.addDiscoveryService();
      this.addCommunicationService();

      // Bind and start server
      const bindAddress = `${this.config.grpcHost}:${this.config.grpcPort}`;
      
      await new Promise<void>((resolve, reject) => {
        this.grpcServer!.bindAsync(
          bindAddress,
          grpc.ServerCredentials.createInsecure(),
          (error, port) => {
            if (error) {
              reject(error);
            } else {
              console.log(`gRPC server listening on ${bindAddress}`);
              resolve();
            }
          }
        );
      });

      console.log('Cross-platform communication adapter initialized');
    } catch (error) {
      console.error('Failed to initialize gRPC server:', error);
      throw error;
    }
  }

  /**
   * Register agent with discovery service
   */
  async registerAgent(registration: AgentRegistration): Promise<string> {
    try {
      const result = await this.discoveryService.registerAgent(registration);
      
      if (result.success) {
        this.currentAgentId = registration.agentId;
        this.currentSessionId = result.sessionId;

        // Start heartbeat
        this.startHeartbeat(registration.agentId, result.sessionId);

        return result.sessionId;
      }

      throw new Error('Failed to register agent');
    } catch (error) {
      console.error('Agent registration failed:', error);
      throw error;
    }
  }

  /**
   * Discover agents
   */
  async discoverAgents(request: DiscoveryRequest): Promise<DiscoveryResponse> {
    return this.discoveryService.discoverAgents(request);
  }

  /**
   * Initiate handshake with another agent
   */
  async initiateHandshake(
    initiatorAgentId: string,
    targetAgentId: string,
    targetDid: string,
    metadata?: Record<string, string>
  ): Promise<HandshakeResponse> {
    try {
      // Create handshake request
      const request = await this.handshakeProtocol.initiateHandshake(
        initiatorAgentId,
        targetAgentId,
        targetDid,
        metadata
      );

      // Process handshake (simulated for now - in real implementation, this would be sent via gRPC)
      const response = await this.handshakeProtocol.processHandshakeRequest(request);

      // Verify response
      if (response.success && response.sessionId) {
        await this.handshakeProtocol.verifyHandshakeResponse(
          initiatorAgentId,
          targetAgentId,
          response
        );
      }

      return response;
    } catch (error) {
      console.error('Handshake initiation failed:', error);
      throw error;
    }
  }

  /**
   * Send message to another agent
   */
  async sendMessage(message: AgentMessage): Promise<MessageResponse> {
    try {
      // Validate session
      if (!this.handshakeProtocol.validateSession(message.sessionId, message.fromAgentId)) {
        return {
          success: false,
          messageId: message.messageId,
          deliveryStatus: DeliveryStatus.FAILED,
        };
      }

      // Add message to context
      await this.contextStorage.addMessage(message.sessionId, message);

      // Emit message sent event
      this.emit(CrossPlatformEvent.MESSAGE_SENT, {
        event: CrossPlatformEvent.MESSAGE_SENT,
        data: message,
        timestamp: new Date(),
        agentId: message.fromAgentId,
      });

      return {
        success: true,
        messageId: message.messageId,
        deliveryStatus: DeliveryStatus.DELIVERED,
        deliveredAt: Date.now(),
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      return {
        success: false,
        messageId: message.messageId,
        deliveryStatus: DeliveryStatus.FAILED,
      };
    }
  }

  /**
   * Get conversation context
   */
  async getContext(request: ContextRequest): Promise<ContextResponse> {
    try {
      const context = await this.contextStorage.getContext(request.sessionId);
      
      if (!context) {
        throw new Error(`Context not found for session: ${request.sessionId}`);
      }

      // Apply history limit
      const messageHistory = request.historyLimit
        ? context.messageHistory.slice(-request.historyLimit)
        : context.messageHistory;

      // Get emotional state for requesting agent
      const emotionalState = context.currentEmotionalStates.get(request.agentId);

      return {
        sessionId: context.sessionId,
        messageHistory,
        sharedContext: context.sharedContext,
        currentEmotionalState: emotionalState,
        contextCreatedAt: context.createdAt.getTime(),
        lastUpdatedAt: context.lastUpdatedAt.getTime(),
      };
    } catch (error) {
      console.error('Failed to get context:', error);
      throw error;
    }
  }

  /**
   * Get agent info
   */
  getAgentInfo(agentId: string): AgentInfo | undefined {
    return this.discoveryService.getAgent(agentId);
  }

  /**
   * Get active session
   */
  getSession(sessionId: string) {
    return this.handshakeProtocol.getSession(sessionId);
  }

  /**
   * Unregister agent
   */
  async unregisterAgent(): Promise<boolean> {
    if (this.currentAgentId && this.currentSessionId) {
      return this.discoveryService.unregisterAgent(this.currentAgentId, this.currentSessionId);
    }
    return false;
  }

  /**
   * Private helper methods
   */
  private addDiscoveryService(): void {
    const discoveryService = (this.protoDescriptor as any).vexel.agent.AgentDiscovery?.service;
    if (!discoveryService) {
      console.warn('AgentDiscovery service not found in proto descriptor');
      return;
    }

    this.grpcServer!.addService(discoveryService, {
      RegisterAgent: async (call: any, callback: any) => {
        try {
          const registration: AgentRegistration = {
            agentId: call.request.agent_id,
            did: call.request.did,
            address: call.request.address,
            capabilities: call.request.capabilities || [],
            metadata: call.request.metadata || {},
            endpoint: call.request.endpoint,
            timestamp: parseInt(call.request.timestamp),
          };

          const result = await this.discoveryService.registerAgent(registration);
          callback(null, {
            success: result.success,
            message: 'Agent registered successfully',
            session_id: result.sessionId,
          });
        } catch (error) {
          callback(error);
        }
      },

      DiscoverAgents: async (call: any, callback: any) => {
        try {
          const request: DiscoveryRequest = {
            capabilities: call.request.capabilities || [],
            filters: call.request.filters || {},
            maxResults: call.request.max_results || 10,
          };

          const response = await this.discoveryService.discoverAgents(request);
          callback(null, {
            agents: response.agents,
            total_count: response.totalCount,
          });
        } catch (error) {
          callback(error);
        }
      },

      Heartbeat: async (call: any, callback: any) => {
        try {
          const success = await this.discoveryService.heartbeat(
            call.request.agent_id,
            call.request.session_id,
            call.request.status as AgentStatus
          );
          callback(null, {
            success,
            next_heartbeat_interval: this.config.heartbeatInterval,
          });
        } catch (error) {
          callback(error);
        }
      },

      UnregisterAgent: async (call: any, callback: any) => {
        try {
          const success = await this.discoveryService.unregisterAgent(
            call.request.agent_id,
            call.request.session_id
          );
          callback(null, {
            success,
            message: success ? 'Agent unregistered' : 'Failed to unregister agent',
          });
        } catch (error) {
          callback(error);
        }
      },
    });
  }

  private addCommunicationService(): void {
    const communicationService = (this.protoDescriptor as any).vexel.agent.AgentCommunication?.service;
    if (!communicationService) {
      console.warn('AgentCommunication service not found in proto descriptor');
      return;
    }

    this.grpcServer!.addService(communicationService, {
      InitiateHandshake: async (call: any, callback: any) => {
        try {
          const request: HandshakeRequest = {
            initiatorAgentId: call.request.initiator_agent_id,
            initiatorDid: call.request.initiator_did,
            targetAgentId: call.request.target_agent_id,
            challenge: Buffer.from(call.request.challenge),
            signature: call.request.signature,
            timestamp: parseInt(call.request.timestamp),
            metadata: call.request.metadata || {},
          };

          const response = await this.handshakeProtocol.processHandshakeRequest(request);
          callback(null, response);
        } catch (error) {
          callback(error);
        }
      },

      SendMessage: async (call: any, callback: any) => {
        try {
          const message: AgentMessage = {
            messageId: call.request.message_id,
            fromAgentId: call.request.from_agent_id,
            toAgentId: call.request.to_agent_id,
            sessionId: call.request.session_id,
            type: call.request.type as MessageType,
            payload: Buffer.from(call.request.payload),
            timestamp: parseInt(call.request.timestamp),
            metadata: call.request.metadata || {},
          };

          const response = await this.sendMessage(message);
          callback(null, response);
        } catch (error) {
          callback(error);
        }
      },

      GetContext: async (call: any, callback: any) => {
        try {
          const request: ContextRequest = {
            sessionId: call.request.session_id,
            agentId: call.request.agent_id,
            historyLimit: call.request.history_limit,
          };

          const response = await this.getContext(request);
          callback(null, response);
        } catch (error) {
          callback(error);
        }
      },
    });
  }

  private setupEventForwarding(): void {
    // Forward discovery events
    this.discoveryService.on(CrossPlatformEvent.AGENT_REGISTERED, (data) => {
      this.emit(CrossPlatformEvent.AGENT_REGISTERED, data);
    });

    this.discoveryService.on(CrossPlatformEvent.AGENT_DISCOVERED, (data) => {
      this.emit(CrossPlatformEvent.AGENT_DISCOVERED, data);
    });

    this.discoveryService.on(CrossPlatformEvent.AGENT_DISCONNECTED, (data) => {
      this.emit(CrossPlatformEvent.AGENT_DISCONNECTED, data);
    });

    // Forward handshake events
    this.handshakeProtocol.on(CrossPlatformEvent.HANDSHAKE_INITIATED, (data) => {
      this.emit(CrossPlatformEvent.HANDSHAKE_INITIATED, data);
    });

    this.handshakeProtocol.on(CrossPlatformEvent.HANDSHAKE_COMPLETED, (data) => {
      this.emit(CrossPlatformEvent.HANDSHAKE_COMPLETED, data);
    });

    // Forward context events
    this.contextStorage.on(CrossPlatformEvent.CONTEXT_UPDATED, (data) => {
      this.emit(CrossPlatformEvent.CONTEXT_UPDATED, data);
    });
  }

  private startHeartbeat(agentId: string, sessionId: string): void {
    setInterval(async () => {
      try {
        await this.discoveryService.heartbeat(agentId, sessionId, AgentStatus.ACTIVE);
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Shutdown adapter
   */
  async shutdown(): Promise<void> {
    // Unregister agent
    await this.unregisterAgent();

    // Shutdown services
    this.discoveryService.shutdown();
    this.handshakeProtocol.shutdown();
    this.contextStorage.shutdown();

    // Shutdown gRPC server
    if (this.grpcServer) {
      await new Promise<void>((resolve) => {
        this.grpcServer!.tryShutdown(() => {
          console.log('gRPC server shut down');
          resolve();
        });
      });
    }

    console.log('Cross-platform adapter shut down');
  }
}
