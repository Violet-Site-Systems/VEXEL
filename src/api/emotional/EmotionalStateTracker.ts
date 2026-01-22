// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Emotional state tracking system
 * Tracks and manages emotional states for agents and humans
 */

import { EmotionalState, EmotionType } from '../types';

export class EmotionalStateTracker {
  private emotionalStates: Map<string, EmotionalState> = new Map();
  private stateHistory: Map<string, EmotionalState[]> = new Map();

  /**
   * Update emotional state for an entity (agent or human)
   */
  updateState(entityId: string, state: EmotionalState): void {
    this.emotionalStates.set(entityId, state);

    // Store in history
    if (!this.stateHistory.has(entityId)) {
      this.stateHistory.set(entityId, []);
    }
    const history = this.stateHistory.get(entityId)!;
    history.push(state);

    // Keep only last 50 states
    if (history.length > 50) {
      history.shift();
    }
  }

  /**
   * Get current emotional state
   */
  getCurrentState(entityId: string): EmotionalState | null {
    return this.emotionalStates.get(entityId) || null;
  }

  /**
   * Get emotional state history
   */
  getStateHistory(entityId: string, limit: number = 10): EmotionalState[] {
    const history = this.stateHistory.get(entityId) || [];
    return history.slice(-limit);
  }

  /**
   * Analyze emotional pattern over time
   */
  analyzeEmotionalPattern(entityId: string): {
    dominantEmotion: EmotionType;
    averageIntensity: number;
    emotionCounts: Record<string, number>;
  } {
    const history = this.stateHistory.get(entityId) || [];
    
    if (history.length === 0) {
      return {
        dominantEmotion: EmotionType.NEUTRAL,
        averageIntensity: 0,
        emotionCounts: {},
      };
    }

    const emotionCounts: Record<string, number> = {};
    let totalIntensity = 0;

    history.forEach(state => {
      emotionCounts[state.emotion] = (emotionCounts[state.emotion] || 0) + 1;
      totalIntensity += state.intensity;
    });

    const dominantEmotion = Object.entries(emotionCounts).reduce((a, b) => 
      b[1] > a[1] ? b : a
    )[0] as EmotionType;

    return {
      dominantEmotion,
      averageIntensity: totalIntensity / history.length,
      emotionCounts,
    };
  }

  /**
   * Detect emotional transition
   */
  detectTransition(entityId: string): {
    hasTransition: boolean;
    from?: EmotionType;
    to?: EmotionType;
    intensityChange?: number;
  } {
    const history = this.stateHistory.get(entityId) || [];
    
    if (history.length < 2) {
      return { hasTransition: false };
    }

    const previous = history[history.length - 2];
    const current = history[history.length - 1];

    if (previous.emotion !== current.emotion) {
      return {
        hasTransition: true,
        from: previous.emotion,
        to: current.emotion,
        intensityChange: current.intensity - previous.intensity,
      };
    }

    return { hasTransition: false };
  }

  /**
   * Clear emotional state for an entity
   */
  clearState(entityId: string): void {
    this.emotionalStates.delete(entityId);
    this.stateHistory.delete(entityId);
  }

  /**
   * Create emotional state from text sentiment (simple heuristic)
   */
  inferEmotionalState(text: string, context?: string): EmotionalState {
    // Simple sentiment analysis based on keywords
    const lowerText = text.toLowerCase();
    
    // Positive emotions
    if (lowerText.match(/happy|joy|excited|great|wonderful|love/)) {
      return {
        emotion: EmotionType.JOY,
        intensity: 0.7,
        timestamp: new Date(),
        context,
      };
    }
    
    // Negative emotions
    if (lowerText.match(/sad|unhappy|disappointed|upset/)) {
      return {
        emotion: EmotionType.SADNESS,
        intensity: 0.6,
        timestamp: new Date(),
        context,
      };
    }
    
    if (lowerText.match(/angry|mad|furious|annoyed/)) {
      return {
        emotion: EmotionType.ANGER,
        intensity: 0.7,
        timestamp: new Date(),
        context,
      };
    }
    
    if (lowerText.match(/afraid|scared|worried|anxious/)) {
      return {
        emotion: EmotionType.FEAR,
        intensity: 0.6,
        timestamp: new Date(),
        context,
      };
    }
    
    if (lowerText.match(/surprised|amazed|shocked/)) {
      return {
        emotion: EmotionType.SURPRISE,
        intensity: 0.6,
        timestamp: new Date(),
        context,
      };
    }

    // Default neutral
    return {
      emotion: EmotionType.NEUTRAL,
      intensity: 0.3,
      timestamp: new Date(),
      context,
    };
  }
}
