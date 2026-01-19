/**
 * Semantic layer for human-Copilot message translation
 * Provides context-aware translation and emotional state preservation
 */

import { SemanticMessage, EmotionalState, TranslationContext, EmotionType } from '../types';
import { randomUUID } from 'crypto';

export class SemanticLayer {
  private conversationHistory: Map<string, SemanticMessage[]> = new Map();

  /**
   * Translate message from human to Copilot
   */
  translateHumanToCopilot(
    message: string,
    emotionalState?: EmotionalState,
    context?: TranslationContext
  ): SemanticMessage {
    const translatedMessage = this.enhanceMessageForCopilot(message, emotionalState, context);

    const semanticMessage: SemanticMessage = {
      id: randomUUID(),
      from: 'human',
      to: 'copilot',
      originalMessage: message,
      translatedMessage,
      emotionalState,
      timestamp: new Date(),
      metadata: {
        contextLength: context?.conversationHistory.length || 0,
      },
    };

    return semanticMessage;
  }

  /**
   * Translate message from Copilot to human
   */
  translateCopilotToHuman(
    message: string,
    emotionalState?: EmotionalState,
    context?: TranslationContext
  ): SemanticMessage {
    const translatedMessage = this.humanizeMessageFromCopilot(message, emotionalState, context);

    const semanticMessage: SemanticMessage = {
      id: randomUUID(),
      from: 'copilot',
      to: 'human',
      originalMessage: message,
      translatedMessage,
      emotionalState,
      timestamp: new Date(),
      metadata: {
        contextLength: context?.conversationHistory.length || 0,
      },
    };

    return semanticMessage;
  }

  /**
   * Enhance message with context for Copilot understanding
   */
  private enhanceMessageForCopilot(
    message: string,
    emotionalState?: EmotionalState,
    context?: TranslationContext
  ): string {
    let enhanced = message;

    // Add emotional context if present
    if (emotionalState) {
      const emotionContext = `[Emotional State: ${emotionalState.emotion}, Intensity: ${emotionalState.intensity.toFixed(2)}]`;
      enhanced = `${emotionContext} ${enhanced}`;
    }

    // Add conversation context summary if available
    if (context && context.conversationHistory.length > 0) {
      const recentMessages = context.conversationHistory.slice(-3);
      const contextSummary = recentMessages
        .map(m => `${m.from}: ${m.originalMessage.substring(0, 50)}`)
        .join(' | ');
      enhanced = `[Context: ${contextSummary}] ${enhanced}`;
    }

    return enhanced;
  }

  /**
   * Humanize message from Copilot for better human understanding
   */
  private humanizeMessageFromCopilot(
    message: string,
    emotionalState?: EmotionalState,
    context?: TranslationContext
  ): string {
    let humanized = message;

    // Remove technical jargon patterns
    humanized = humanized.replace(/\[SYSTEM\]/g, '');
    humanized = humanized.replace(/\[DEBUG\]/g, '');

    // Add emotional warmth if agent is experiencing positive emotions
    if (emotionalState && 
        (emotionalState.emotion === EmotionType.JOY || 
         emotionalState.emotion === EmotionType.TRUST)) {
      // Message is already good, no need to modify
    }

    return humanized.trim();
  }

  /**
   * Store message in conversation history
   */
  storeMessage(conversationId: string, message: SemanticMessage): void {
    if (!this.conversationHistory.has(conversationId)) {
      this.conversationHistory.set(conversationId, []);
    }

    const history = this.conversationHistory.get(conversationId)!;
    history.push(message);

    // Keep only last 100 messages
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(conversationId: string): SemanticMessage[] {
    return this.conversationHistory.get(conversationId) || [];
  }

  /**
   * Get translation context for a conversation
   */
  getContext(conversationId: string): TranslationContext {
    return {
      conversationHistory: this.getConversationHistory(conversationId),
    };
  }

  /**
   * Clear conversation history
   */
  clearHistory(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
  }
}
