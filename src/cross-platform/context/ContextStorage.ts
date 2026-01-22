// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Context Preservation Storage
 * Stores and retrieves conversation context for agent-to-agent communication
 */

import { EventEmitter } from 'events';
import {
  ConversationContext,
  AgentMessage,
  EmotionalStateData,
  IContextStorage,
  CrossPlatformEvent,
} from '../types';

export interface ContextStorageConfig {
  maxHistorySize?: number;
  contextTTL?: number;
  enablePersistence?: boolean;
  redisUrl?: string;
  ipfsUrl?: string;
}

export class ContextStorage extends EventEmitter implements IContextStorage {
  private contexts: Map<string, ConversationContext> = new Map();
  private config: Required<Omit<ContextStorageConfig, 'redisUrl' | 'ipfsUrl'>>;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: ContextStorageConfig = {}) {
    super();
    this.config = {
      maxHistorySize: config.maxHistorySize || 100,
      contextTTL: config.contextTTL || 86400000, // 24 hours
      enablePersistence: config.enablePersistence || false,
    };

    // Start periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredContexts();
    }, 300000); // 5 minutes
  }

  /**
   * Save conversation context
   */
  async saveContext(context: ConversationContext): Promise<void> {
    try {
      // Validate context
      this.validateContext(context);

      // Limit message history size
      if (context.messageHistory.length > this.config.maxHistorySize) {
        context.messageHistory = context.messageHistory.slice(-this.config.maxHistorySize);
      }

      // Store context
      this.contexts.set(context.sessionId, context);

      // Emit context update event
      this.emit(CrossPlatformEvent.CONTEXT_UPDATED, {
        event: CrossPlatformEvent.CONTEXT_UPDATED,
        data: { sessionId: context.sessionId, messageCount: context.messageHistory.length },
        timestamp: new Date(),
      });

      console.log(`Context saved for session: ${context.sessionId}`);
    } catch (error) {
      console.error('Failed to save context:', error);
      throw error;
    }
  }

  /**
   * Get conversation context
   */
  async getContext(sessionId: string): Promise<ConversationContext | null> {
    try {
      const context = this.contexts.get(sessionId);
      
      if (!context) {
        return null;
      }

      // Check if context has expired
      const age = Date.now() - context.lastUpdatedAt.getTime();
      if (age > this.config.contextTTL) {
        await this.deleteContext(sessionId);
        return null;
      }

      return context;
    } catch (error) {
      console.error(`Failed to get context for session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Update conversation context
   */
  async updateContext(sessionId: string, updates: Partial<ConversationContext>): Promise<void> {
    try {
      const context = await this.getContext(sessionId);
      
      if (!context) {
        throw new Error(`Context not found for session: ${sessionId}`);
      }

      // Apply updates
      Object.assign(context, updates);
      context.lastUpdatedAt = new Date();

      // Save updated context
      await this.saveContext(context);

      console.log(`Context updated for session: ${sessionId}`);
    } catch (error) {
      console.error(`Failed to update context for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete conversation context
   */
  async deleteContext(sessionId: string): Promise<void> {
    try {
      const deleted = this.contexts.delete(sessionId);
      
      if (deleted) {
        console.log(`Context deleted for session: ${sessionId}`);
      }
    } catch (error) {
      console.error(`Failed to delete context for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Add message to context
   */
  async addMessage(sessionId: string, message: AgentMessage): Promise<void> {
    try {
      let context = await this.getContext(sessionId);

      // Create new context if it doesn't exist
      if (!context) {
        context = this.createContext(sessionId, [message.fromAgentId, message.toAgentId]);
      }

      // Add message to history
      context.messageHistory.push(message);

      // Update emotional state if present
      if (message.emotionalState) {
        context.currentEmotionalStates.set(message.fromAgentId, message.emotionalState);
      }

      // Update timestamps
      context.lastUpdatedAt = new Date();

      // Save context
      await this.saveContext(context);
    } catch (error) {
      console.error(`Failed to add message to context:`, error);
      throw error;
    }
  }

  /**
   * Get message history for session
   */
  async getMessageHistory(sessionId: string, limit?: number): Promise<AgentMessage[]> {
    try {
      const context = await this.getContext(sessionId);
      
      if (!context) {
        return [];
      }

      const messages = context.messageHistory;
      
      if (limit && limit > 0) {
        return messages.slice(-limit);
      }

      return messages;
    } catch (error) {
      console.error(`Failed to get message history for session ${sessionId}:`, error);
      return [];
    }
  }

  /**
   * Get shared context data
   */
  async getSharedContext(sessionId: string): Promise<Record<string, any>> {
    try {
      const context = await this.getContext(sessionId);
      return context?.sharedContext || {};
    } catch (error) {
      console.error(`Failed to get shared context for session ${sessionId}:`, error);
      return {};
    }
  }

  /**
   * Update shared context data
   */
  async updateSharedContext(sessionId: string, data: Record<string, any>): Promise<void> {
    try {
      await this.updateContext(sessionId, {
        sharedContext: data,
      });
    } catch (error) {
      console.error(`Failed to update shared context for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get emotional states for session
   */
  async getEmotionalStates(sessionId: string): Promise<Map<string, EmotionalStateData>> {
    try {
      const context = await this.getContext(sessionId);
      return context?.currentEmotionalStates || new Map();
    } catch (error) {
      console.error(`Failed to get emotional states for session ${sessionId}:`, error);
      return new Map();
    }
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): string[] {
    return Array.from(this.contexts.keys());
  }

  /**
   * Get context statistics
   */
  getStatistics(): {
    totalContexts: number;
    totalMessages: number;
    averageMessagesPerContext: number;
  } {
    const contexts = Array.from(this.contexts.values());
    const totalMessages = contexts.reduce((sum, ctx) => sum + ctx.messageHistory.length, 0);
    
    return {
      totalContexts: contexts.length,
      totalMessages,
      averageMessagesPerContext: contexts.length > 0 ? totalMessages / contexts.length : 0,
    };
  }

  /**
   * Private helper methods
   */
  private validateContext(context: ConversationContext): void {
    if (!context.sessionId) {
      throw new Error('Session ID is required');
    }

    if (!context.participants || context.participants.length < 2) {
      throw new Error('At least two participants are required');
    }

    if (!context.messageHistory) {
      context.messageHistory = [];
    }

    if (!context.sharedContext) {
      context.sharedContext = {};
    }

    if (!context.currentEmotionalStates) {
      context.currentEmotionalStates = new Map();
    }
  }

  private createContext(sessionId: string, participants: string[]): ConversationContext {
    return {
      sessionId,
      participants,
      messageHistory: [],
      sharedContext: {},
      currentEmotionalStates: new Map(),
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
    };
  }

  private cleanupExpiredContexts(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, context] of this.contexts.entries()) {
      const age = now - context.lastUpdatedAt.getTime();
      if (age > this.config.contextTTL) {
        this.contexts.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired contexts`);
    }
  }

  /**
   * Cleanup and shutdown
   */
  shutdown(): void {
    clearInterval(this.cleanupInterval);
    this.contexts.clear();
    console.log('Context storage shut down');
  }
}
