// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Tests for Context Storage
 */

import { ContextStorage } from '../context/ContextStorage';
import {
  ConversationContext,
  AgentMessage,
  MessageType,
  EmotionalStateData,
  CrossPlatformEvent,
} from '../types';

describe('ContextStorage', () => {
  let contextStorage: ContextStorage;

  beforeEach(() => {
    contextStorage = new ContextStorage({
      maxHistorySize: 100,
      contextTTL: 86400000, // 24 hours
    });
  });

  afterEach(() => {
    contextStorage.shutdown();
  });

  describe('saveContext', () => {
    it('should save conversation context', async () => {
      const context: ConversationContext = {
        sessionId: 'session-001',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: {},
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await contextStorage.saveContext(context);

      const retrieved = await contextStorage.getContext('session-001');

      expect(retrieved).toBeDefined();
      expect(retrieved?.sessionId).toBe('session-001');
      expect(retrieved?.participants).toEqual(['agent-1', 'agent-2']);
    });

    it('should emit context update event', (done) => {
      const context: ConversationContext = {
        sessionId: 'session-002',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: {},
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      contextStorage.on(CrossPlatformEvent.CONTEXT_UPDATED, (data) => {
        expect(data.event).toBe(CrossPlatformEvent.CONTEXT_UPDATED);
        expect(data.data.sessionId).toBe('session-002');
        done();
      });

      contextStorage.saveContext(context);
    });

    it('should limit message history size', async () => {
      const messages: AgentMessage[] = [];
      for (let i = 0; i < 150; i++) {
        messages.push({
          messageId: `msg-${i}`,
          fromAgentId: 'agent-1',
          toAgentId: 'agent-2',
          sessionId: 'session-003',
          type: MessageType.TEXT,
          payload: `Message ${i}`,
          timestamp: Date.now(),
        });
      }

      const context: ConversationContext = {
        sessionId: 'session-003',
        participants: ['agent-1', 'agent-2'],
        messageHistory: messages,
        sharedContext: {},
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await contextStorage.saveContext(context);

      const retrieved = await contextStorage.getContext('session-003');

      expect(retrieved?.messageHistory.length).toBe(100);
    });
  });

  describe('getContext', () => {
    it('should return saved context', async () => {
      const context: ConversationContext = {
        sessionId: 'session-004',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: { topic: 'AI' },
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await contextStorage.saveContext(context);
      const retrieved = await contextStorage.getContext('session-004');

      expect(retrieved).toBeDefined();
      expect(retrieved?.sharedContext.topic).toBe('AI');
    });

    it('should return null for non-existent context', async () => {
      const retrieved = await contextStorage.getContext('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should return null for expired context', async () => {
      const shortTTLStorage = new ContextStorage({
        contextTTL: 100, // 100ms
      });

      const context: ConversationContext = {
        sessionId: 'session-expired',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: {},
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await shortTTLStorage.saveContext(context);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      const retrieved = await shortTTLStorage.getContext('session-expired');

      expect(retrieved).toBeNull();

      shortTTLStorage.shutdown();
    });
  });

  describe('updateContext', () => {
    it('should update existing context', async () => {
      const context: ConversationContext = {
        sessionId: 'session-005',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: { topic: 'AI' },
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await contextStorage.saveContext(context);

      await contextStorage.updateContext('session-005', {
        sharedContext: { topic: 'ML' },
      });

      const retrieved = await contextStorage.getContext('session-005');

      expect(retrieved?.sharedContext.topic).toBe('ML');
    });

    it('should update lastUpdatedAt timestamp', async () => {
      const context: ConversationContext = {
        sessionId: 'session-006',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: {},
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await contextStorage.saveContext(context);
      const initialUpdatedAt = (await contextStorage.getContext('session-006'))!.lastUpdatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      await contextStorage.updateContext('session-006', {
        sharedContext: { updated: true },
      });

      const retrieved = await contextStorage.getContext('session-006');

      expect(retrieved?.lastUpdatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });

    it('should throw error for non-existent context', async () => {
      await expect(
        contextStorage.updateContext('non-existent', { sharedContext: {} })
      ).rejects.toThrow('Context not found');
    });
  });

  describe('deleteContext', () => {
    it('should delete existing context', async () => {
      const context: ConversationContext = {
        sessionId: 'session-007',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: {},
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await contextStorage.saveContext(context);
      await contextStorage.deleteContext('session-007');

      const retrieved = await contextStorage.getContext('session-007');

      expect(retrieved).toBeNull();
    });

    it('should not throw for non-existent context', async () => {
      await expect(
        contextStorage.deleteContext('non-existent')
      ).resolves.not.toThrow();
    });
  });

  describe('addMessage', () => {
    it('should add message to existing context', async () => {
      const context: ConversationContext = {
        sessionId: 'session-008',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: {},
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await contextStorage.saveContext(context);

      const message: AgentMessage = {
        messageId: 'msg-001',
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        sessionId: 'session-008',
        type: MessageType.TEXT,
        payload: 'Hello',
        timestamp: Date.now(),
      };

      await contextStorage.addMessage('session-008', message);

      const retrieved = await contextStorage.getContext('session-008');

      expect(retrieved?.messageHistory.length).toBe(1);
      expect(retrieved?.messageHistory[0].messageId).toBe('msg-001');
    });

    it('should create context if not exists', async () => {
      const message: AgentMessage = {
        messageId: 'msg-002',
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        sessionId: 'session-009',
        type: MessageType.TEXT,
        payload: 'Hello',
        timestamp: Date.now(),
      };

      await contextStorage.addMessage('session-009', message);

      const retrieved = await contextStorage.getContext('session-009');

      expect(retrieved).toBeDefined();
      expect(retrieved?.messageHistory.length).toBe(1);
    });

    it('should update emotional state', async () => {
      const emotionalState: EmotionalStateData = {
        emotion: 'JOY',
        intensity: 0.8,
        timestamp: Date.now(),
        context: 'positive interaction',
      };

      const message: AgentMessage = {
        messageId: 'msg-003',
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        sessionId: 'session-010',
        type: MessageType.TEXT,
        payload: 'Great!',
        emotionalState,
        timestamp: Date.now(),
      };

      await contextStorage.addMessage('session-010', message);

      const retrieved = await contextStorage.getContext('session-010');

      expect(retrieved?.currentEmotionalStates.get('agent-1')).toEqual(emotionalState);
    });
  });

  describe('getMessageHistory', () => {
    it('should return all messages', async () => {
      const messages: AgentMessage[] = [
        {
          messageId: 'msg-1',
          fromAgentId: 'agent-1',
          toAgentId: 'agent-2',
          sessionId: 'session-011',
          type: MessageType.TEXT,
          payload: 'Message 1',
          timestamp: Date.now(),
        },
        {
          messageId: 'msg-2',
          fromAgentId: 'agent-2',
          toAgentId: 'agent-1',
          sessionId: 'session-011',
          type: MessageType.TEXT,
          payload: 'Message 2',
          timestamp: Date.now(),
        },
      ];

      for (const msg of messages) {
        await contextStorage.addMessage('session-011', msg);
      }

      const history = await contextStorage.getMessageHistory('session-011');

      expect(history.length).toBe(2);
    });

    it('should respect limit', async () => {
      for (let i = 0; i < 10; i++) {
        await contextStorage.addMessage('session-012', {
          messageId: `msg-${i}`,
          fromAgentId: 'agent-1',
          toAgentId: 'agent-2',
          sessionId: 'session-012',
          type: MessageType.TEXT,
          payload: `Message ${i}`,
          timestamp: Date.now(),
        });
      }

      const history = await contextStorage.getMessageHistory('session-012', 5);

      expect(history.length).toBe(5);
    });

    it('should return empty array for non-existent session', async () => {
      const history = await contextStorage.getMessageHistory('non-existent');
      expect(history).toEqual([]);
    });
  });

  describe('getSharedContext', () => {
    it('should return shared context', async () => {
      const context: ConversationContext = {
        sessionId: 'session-013',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: { topic: 'AI', language: 'en' },
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await contextStorage.saveContext(context);

      const sharedContext = await contextStorage.getSharedContext('session-013');

      expect(sharedContext).toEqual({ topic: 'AI', language: 'en' });
    });

    it('should return empty object for non-existent session', async () => {
      const sharedContext = await contextStorage.getSharedContext('non-existent');
      expect(sharedContext).toEqual({});
    });
  });

  describe('updateSharedContext', () => {
    it('should update shared context', async () => {
      const context: ConversationContext = {
        sessionId: 'session-014',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: {},
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await contextStorage.saveContext(context);

      await contextStorage.updateSharedContext('session-014', { topic: 'ML' });

      const retrieved = await contextStorage.getContext('session-014');

      expect(retrieved?.sharedContext).toEqual({ topic: 'ML' });
    });
  });

  describe('getEmotionalStates', () => {
    it('should return emotional states', async () => {
      const emotionalStates = new Map<string, EmotionalStateData>();
      emotionalStates.set('agent-1', {
        emotion: 'JOY',
        intensity: 0.8,
        timestamp: Date.now(),
      });

      const context: ConversationContext = {
        sessionId: 'session-015',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: {},
        currentEmotionalStates: emotionalStates,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      await contextStorage.saveContext(context);

      const states = await contextStorage.getEmotionalStates('session-015');

      expect(states.get('agent-1')?.emotion).toBe('JOY');
    });

    it('should return empty map for non-existent session', async () => {
      const states = await contextStorage.getEmotionalStates('non-existent');
      expect(states.size).toBe(0);
    });
  });

  describe('getActiveSessions', () => {
    it('should return all active session IDs', async () => {
      await contextStorage.saveContext({
        sessionId: 'session-016',
        participants: ['agent-1', 'agent-2'],
        messageHistory: [],
        sharedContext: {},
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      });

      await contextStorage.saveContext({
        sessionId: 'session-017',
        participants: ['agent-3', 'agent-4'],
        messageHistory: [],
        sharedContext: {},
        currentEmotionalStates: new Map(),
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      });

      const sessions = contextStorage.getActiveSessions();

      expect(sessions.length).toBeGreaterThanOrEqual(2);
      expect(sessions).toContain('session-016');
      expect(sessions).toContain('session-017');
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', async () => {
      await contextStorage.addMessage('session-018', {
        messageId: 'msg-1',
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        sessionId: 'session-018',
        type: MessageType.TEXT,
        payload: 'Message 1',
        timestamp: Date.now(),
      });

      await contextStorage.addMessage('session-018', {
        messageId: 'msg-2',
        fromAgentId: 'agent-2',
        toAgentId: 'agent-1',
        sessionId: 'session-018',
        type: MessageType.TEXT,
        payload: 'Message 2',
        timestamp: Date.now(),
      });

      const stats = contextStorage.getStatistics();

      expect(stats.totalContexts).toBeGreaterThan(0);
      expect(stats.totalMessages).toBeGreaterThanOrEqual(2);
      expect(stats.averageMessagesPerContext).toBeGreaterThan(0);
    });
  });
});
