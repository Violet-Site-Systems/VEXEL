/**
 * Type definitions for cross-platform agent communication
 */

/**
 * Agent discovery and registration
 */
export interface AgentRegistration {
  agentId: string;
  did: string;
  address: string;
  capabilities: string[];
  metadata?: Record<string, string>;
  endpoint: string;  // gRPC endpoint
  timestamp?: number;
}

export interface AgentInfo {
  agentId: string;
  did: string;
  address: string;
  capabilities: string[];
  metadata?: Record<string, string>;
  endpoint: string;
  lastSeen: number;
  status: AgentStatus;
}

export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
}

export interface DiscoveryRequest {
  capabilities?: string[];
  filters?: Record<string, string>;
  maxResults?: number;
}

export interface DiscoveryResponse {
  agents: AgentInfo[];
  totalCount: number;
}

/**
 * Handshake protocol
 */
export interface HandshakeRequest {
  initiatorAgentId: string;
  initiatorDid: string;
  targetAgentId: string;
  challenge: Buffer;
  signature: string;
  timestamp: number;
  metadata?: Record<string, string>;
}

export interface HandshakeResponse {
  success: boolean;
  sessionId?: string;
  challengeResponse?: Buffer;
  signature?: string;
  targetDid?: string;
  message?: string;
}

export interface HandshakeSession {
  sessionId: string;
  initiatorAgentId: string;
  targetAgentId: string;
  establishedAt: Date;
  expiresAt: Date;
  sharedSecret?: Buffer;
}

/**
 * Agent-to-agent messaging
 */
export enum MessageType {
  TEXT = 'TEXT',
  ACTION_REQUEST = 'ACTION_REQUEST',
  ACTION_RESPONSE = 'ACTION_RESPONSE',
  STATUS_UPDATE = 'STATUS_UPDATE',
  CONTEXT_SHARE = 'CONTEXT_SHARE',
  CAPABILITY_QUERY = 'CAPABILITY_QUERY',
}

export interface AgentMessage {
  messageId: string;
  fromAgentId: string;
  toAgentId: string;
  sessionId: string;
  type: MessageType;
  payload: Buffer | string;
  emotionalState?: EmotionalStateData;
  timestamp: number;
  metadata?: Record<string, string>;
}

export interface MessageResponse {
  success: boolean;
  messageId: string;
  deliveryStatus: DeliveryStatus;
  deliveredAt?: number;
}

export enum DeliveryStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

/**
 * Emotional state (compatible with existing EmotionalState)
 */
export interface EmotionalStateData {
  emotion: string;
  intensity: number;
  timestamp: number;
  context?: string;
}

/**
 * Context preservation
 */
export interface ConversationContext {
  sessionId: string;
  participants: string[];
  messageHistory: AgentMessage[];
  sharedContext: Record<string, any>;
  currentEmotionalStates: Map<string, EmotionalStateData>;
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface ContextRequest {
  sessionId: string;
  agentId: string;
  historyLimit?: number;
}

export interface ContextResponse {
  sessionId: string;
  messageHistory: AgentMessage[];
  sharedContext: Record<string, any>;
  currentEmotionalState?: EmotionalStateData;
  contextCreatedAt: number;
  lastUpdatedAt: number;
}

/**
 * Communication adapter configuration
 */
export interface CrossPlatformConfig {
  grpcPort?: number;
  grpcHost?: string;
  discoveryServiceUrl?: string;
  heartbeatInterval?: number;
  sessionTimeout?: number;
  maxMessageSize?: number;
  enableCompression?: boolean;
  redisUrl?: string;
  ipfsUrl?: string;
}

/**
 * Service interfaces
 */
export interface IAgentDiscoveryService {
  registerAgent(registration: AgentRegistration): Promise<{ success: boolean; sessionId: string }>;
  discoverAgents(request: DiscoveryRequest): Promise<DiscoveryResponse>;
  heartbeat(agentId: string, sessionId: string, status: AgentStatus): Promise<boolean>;
  unregisterAgent(agentId: string, sessionId: string): Promise<boolean>;
}

export interface IAgentCommunicationService {
  initiateHandshake(request: HandshakeRequest): Promise<HandshakeResponse>;
  sendMessage(message: AgentMessage): Promise<MessageResponse>;
  getContext(request: ContextRequest): Promise<ContextResponse>;
}

export interface IContextStorage {
  saveContext(context: ConversationContext): Promise<void>;
  getContext(sessionId: string): Promise<ConversationContext | null>;
  updateContext(sessionId: string, updates: Partial<ConversationContext>): Promise<void>;
  deleteContext(sessionId: string): Promise<void>;
}

/**
 * Event types for cross-platform communication
 */
export enum CrossPlatformEvent {
  AGENT_REGISTERED = 'AGENT_REGISTERED',
  AGENT_DISCOVERED = 'AGENT_DISCOVERED',
  HANDSHAKE_INITIATED = 'HANDSHAKE_INITIATED',
  HANDSHAKE_COMPLETED = 'HANDSHAKE_COMPLETED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_SENT = 'MESSAGE_SENT',
  CONTEXT_UPDATED = 'CONTEXT_UPDATED',
  AGENT_DISCONNECTED = 'AGENT_DISCONNECTED',
  ERROR = 'ERROR',
}

export interface CrossPlatformEventData {
  event: CrossPlatformEvent;
  data: any;
  timestamp: Date;
  agentId?: string;
}
