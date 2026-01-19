/**
 * Type definitions for API Gateway and WebSocket Layer
 */

import { Request } from 'express';

/**
 * Emotional state types
 */
export enum EmotionType {
  JOY = 'JOY',
  SADNESS = 'SADNESS',
  ANGER = 'ANGER',
  FEAR = 'FEAR',
  SURPRISE = 'SURPRISE',
  TRUST = 'TRUST',
  ANTICIPATION = 'ANTICIPATION',
  NEUTRAL = 'NEUTRAL',
}

export interface EmotionalState {
  emotion: EmotionType;
  intensity: number; // 0-1 scale
  timestamp: Date;
  context?: string;
  metadata?: Record<string, any>;
}

/**
 * Semantic layer types for human-Copilot translation
 */
export interface SemanticMessage {
  id: string;
  from: 'human' | 'copilot';
  to: 'human' | 'copilot';
  originalMessage: string;
  translatedMessage: string;
  emotionalState?: EmotionalState;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TranslationContext {
  conversationHistory: SemanticMessage[];
  currentEmotion?: EmotionalState;
  agentCapabilities?: string[];
}

/**
 * WebSocket event types
 */
export enum WebSocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message',
  AGENT_STATUS = 'agent_status',
  EMOTIONAL_STATE = 'emotional_state',
  ACTION_REQUEST = 'action_request',
  ACTION_RESPONSE = 'action_response',
  ERROR = 'error',
}

export interface WebSocketMessage {
  event: WebSocketEvent;
  data: any;
  timestamp: Date;
  sender?: string;
  recipient?: string;
}

/**
 * Action verification types
 */
export enum ActionType {
  AGENT_CREATE = 'AGENT_CREATE',
  AGENT_UPDATE = 'AGENT_UPDATE',
  AGENT_DELETE = 'AGENT_DELETE',
  CAPABILITY_ADD = 'CAPABILITY_ADD',
  STATUS_CHANGE = 'STATUS_CHANGE',
  MESSAGE_SEND = 'MESSAGE_SEND',
}

export interface ActionRequest {
  id: string;
  type: ActionType;
  agentId: string;
  payload: Record<string, any>;
  requestedBy: string;
  timestamp: Date;
}

export interface ActionVerificationResult {
  allowed: boolean;
  reason?: string;
  requiresConfirmation?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Authentication types
 */
export interface JWTPayload {
  userId: string;
  agentId?: string;
  role: 'human' | 'agent' | 'admin';
  did?: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * API Response types
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}
