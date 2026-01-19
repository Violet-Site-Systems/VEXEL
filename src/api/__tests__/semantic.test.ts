/**
 * Tests for Semantic Layer
 */

import { SemanticLayer } from '../semantic/SemanticLayer';
import { EmotionType } from '../types';

describe('SemanticLayer', () => {
  let semanticLayer: SemanticLayer;

  beforeEach(() => {
    semanticLayer = new SemanticLayer();
  });

  describe('translateHumanToCopilot', () => {
    it('should translate a simple message', () => {
      const message = 'Hello, agent!';
      const result = semanticLayer.translateHumanToCopilot(message);

      expect(result).toBeDefined();
      expect(result.from).toBe('human');
      expect(result.to).toBe('copilot');
      expect(result.originalMessage).toBe(message);
      expect(result.translatedMessage).toContain(message);
    });

    it('should enhance message with emotional state', () => {
      const message = 'I need help with this task';
      const emotionalState = {
        emotion: EmotionType.TRUST,
        intensity: 0.8,
        timestamp: new Date(),
      };

      const result = semanticLayer.translateHumanToCopilot(message, emotionalState);

      expect(result.emotionalState).toEqual(emotionalState);
      expect(result.translatedMessage).toContain('TRUST');
      expect(result.translatedMessage).toContain('0.80');
    });

    it('should include conversation context', () => {
      const conversationId = 'conv-123';

      // Add some conversation history
      const msg1 = semanticLayer.translateHumanToCopilot('First message');
      semanticLayer.storeMessage(conversationId, msg1);

      const msg2 = semanticLayer.translateCopilotToHuman('Response');
      semanticLayer.storeMessage(conversationId, msg2);

      // Get context and translate with it
      const context = semanticLayer.getContext(conversationId);
      const result = semanticLayer.translateHumanToCopilot('Follow-up message', undefined, context);

      expect(result.translatedMessage).toContain('[Context:');
      expect(result.metadata?.contextLength).toBe(2);
    });
  });

  describe('translateCopilotToHuman', () => {
    it('should humanize technical message', () => {
      const message = '[SYSTEM] Task completed [DEBUG] Execution time: 100ms';
      const result = semanticLayer.translateCopilotToHuman(message);

      expect(result.from).toBe('copilot');
      expect(result.to).toBe('human');
      expect(result.translatedMessage).not.toContain('[SYSTEM]');
      expect(result.translatedMessage).not.toContain('[DEBUG]');
    });

    it('should preserve message with emotional context', () => {
      const message = 'Task completed successfully';
      const emotionalState = {
        emotion: EmotionType.JOY,
        intensity: 0.9,
        timestamp: new Date(),
      };

      const result = semanticLayer.translateCopilotToHuman(message, emotionalState);

      expect(result.emotionalState).toEqual(emotionalState);
      expect(result.translatedMessage).toBeTruthy();
    });
  });

  describe('conversation history', () => {
    it('should store message in history', () => {
      const conversationId = 'conv-123';
      const message = semanticLayer.translateHumanToCopilot('Test message');

      semanticLayer.storeMessage(conversationId, message);
      const history = semanticLayer.getConversationHistory(conversationId);

      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(message);
    });

    it('should maintain history limit', () => {
      const conversationId = 'conv-123';

      // Add more than 100 messages
      for (let i = 0; i < 150; i++) {
        const message = semanticLayer.translateHumanToCopilot(`Message ${i}`);
        semanticLayer.storeMessage(conversationId, message);
      }

      const history = semanticLayer.getConversationHistory(conversationId);
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('should clear conversation history', () => {
      const conversationId = 'conv-123';
      const message = semanticLayer.translateHumanToCopilot('Test message');

      semanticLayer.storeMessage(conversationId, message);
      expect(semanticLayer.getConversationHistory(conversationId)).toHaveLength(1);

      semanticLayer.clearHistory(conversationId);
      expect(semanticLayer.getConversationHistory(conversationId)).toHaveLength(0);
    });
  });

  describe('getContext', () => {
    it('should return conversation context', () => {
      const conversationId = 'conv-123';
      const message = semanticLayer.translateHumanToCopilot('Test message');
      semanticLayer.storeMessage(conversationId, message);

      const context = semanticLayer.getContext(conversationId);

      expect(context).toBeDefined();
      expect(context.conversationHistory).toHaveLength(1);
    });

    it('should return empty context for new conversation', () => {
      const context = semanticLayer.getContext('new-conv');

      expect(context).toBeDefined();
      expect(context.conversationHistory).toHaveLength(0);
    });
  });
});
