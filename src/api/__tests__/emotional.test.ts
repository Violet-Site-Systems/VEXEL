// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Tests for Emotional State Tracker
 */

import { EmotionalStateTracker } from '../emotional/EmotionalStateTracker';
import { EmotionType, EmotionalState } from '../types';

describe('EmotionalStateTracker', () => {
  let tracker: EmotionalStateTracker;

  beforeEach(() => {
    tracker = new EmotionalStateTracker();
  });

  describe('updateState', () => {
    it('should update emotional state for an entity', () => {
      const entityId = 'agent-123';
      const state: EmotionalState = {
        emotion: EmotionType.JOY,
        intensity: 0.8,
        timestamp: new Date(),
      };

      tracker.updateState(entityId, state);
      const current = tracker.getCurrentState(entityId);

      expect(current).toEqual(state);
    });

    it('should maintain state history', () => {
      const entityId = 'agent-123';

      for (let i = 0; i < 5; i++) {
        const state: EmotionalState = {
          emotion: EmotionType.JOY,
          intensity: 0.5 + i * 0.1,
          timestamp: new Date(),
        };
        tracker.updateState(entityId, state);
      }

      const history = tracker.getStateHistory(entityId);
      expect(history.length).toBeGreaterThan(0);
      expect(history.length).toBeLessThanOrEqual(5);
    });

    it('should limit history to 50 states', () => {
      const entityId = 'agent-123';

      for (let i = 0; i < 60; i++) {
        const state: EmotionalState = {
          emotion: EmotionType.NEUTRAL,
          intensity: 0.5,
          timestamp: new Date(),
        };
        tracker.updateState(entityId, state);
      }

      const history = tracker.getStateHistory(entityId, 100);
      expect(history.length).toBe(50);
    });
  });

  describe('getCurrentState', () => {
    it('should return null for unknown entity', () => {
      const state = tracker.getCurrentState('unknown');
      expect(state).toBeNull();
    });

    it('should return current state', () => {
      const entityId = 'agent-123';
      const state: EmotionalState = {
        emotion: EmotionType.TRUST,
        intensity: 0.7,
        timestamp: new Date(),
      };

      tracker.updateState(entityId, state);
      const current = tracker.getCurrentState(entityId);

      expect(current).toEqual(state);
    });
  });

  describe('analyzeEmotionalPattern', () => {
    it('should analyze dominant emotion', () => {
      const entityId = 'agent-123';

      // Add mostly JOY emotions
      for (let i = 0; i < 7; i++) {
        tracker.updateState(entityId, {
          emotion: EmotionType.JOY,
          intensity: 0.8,
          timestamp: new Date(),
        });
      }

      // Add a few other emotions
      tracker.updateState(entityId, {
        emotion: EmotionType.TRUST,
        intensity: 0.6,
        timestamp: new Date(),
      });

      const analysis = tracker.analyzeEmotionalPattern(entityId);

      expect(analysis.dominantEmotion).toBe(EmotionType.JOY);
      expect(analysis.emotionCounts[EmotionType.JOY]).toBe(7);
    });

    it('should calculate average intensity', () => {
      const entityId = 'agent-123';

      tracker.updateState(entityId, {
        emotion: EmotionType.JOY,
        intensity: 0.5,
        timestamp: new Date(),
      });

      tracker.updateState(entityId, {
        emotion: EmotionType.JOY,
        intensity: 0.9,
        timestamp: new Date(),
      });

      const analysis = tracker.analyzeEmotionalPattern(entityId);

      expect(analysis.averageIntensity).toBe(0.7);
    });

    it('should handle entity with no history', () => {
      const analysis = tracker.analyzeEmotionalPattern('unknown');

      expect(analysis.dominantEmotion).toBe(EmotionType.NEUTRAL);
      expect(analysis.averageIntensity).toBe(0);
      expect(Object.keys(analysis.emotionCounts)).toHaveLength(0);
    });
  });

  describe('detectTransition', () => {
    it('should detect emotional transition', () => {
      const entityId = 'agent-123';

      tracker.updateState(entityId, {
        emotion: EmotionType.JOY,
        intensity: 0.8,
        timestamp: new Date(),
      });

      tracker.updateState(entityId, {
        emotion: EmotionType.SADNESS,
        intensity: 0.6,
        timestamp: new Date(),
      });

      const transition = tracker.detectTransition(entityId);

      expect(transition.hasTransition).toBe(true);
      expect(transition.from).toBe(EmotionType.JOY);
      expect(transition.to).toBe(EmotionType.SADNESS);
      expect(transition.intensityChange).toBeCloseTo(-0.2, 10);
    });

    it('should not detect transition when emotion stays the same', () => {
      const entityId = 'agent-123';

      tracker.updateState(entityId, {
        emotion: EmotionType.JOY,
        intensity: 0.8,
        timestamp: new Date(),
      });

      tracker.updateState(entityId, {
        emotion: EmotionType.JOY,
        intensity: 0.9,
        timestamp: new Date(),
      });

      const transition = tracker.detectTransition(entityId);

      expect(transition.hasTransition).toBe(false);
    });

    it('should handle entity with insufficient history', () => {
      const entityId = 'agent-123';

      tracker.updateState(entityId, {
        emotion: EmotionType.JOY,
        intensity: 0.8,
        timestamp: new Date(),
      });

      const transition = tracker.detectTransition(entityId);

      expect(transition.hasTransition).toBe(false);
    });
  });

  describe('inferEmotionalState', () => {
    it('should infer JOY from positive text', () => {
      const state = tracker.inferEmotionalState('I am so happy and excited!');

      expect(state.emotion).toBe(EmotionType.JOY);
      expect(state.intensity).toBeGreaterThan(0);
    });

    it('should infer SADNESS from negative text', () => {
      const state = tracker.inferEmotionalState('I feel sad and disappointed');

      expect(state.emotion).toBe(EmotionType.SADNESS);
    });

    it('should infer ANGER from angry text', () => {
      const state = tracker.inferEmotionalState('I am so angry about this');

      expect(state.emotion).toBe(EmotionType.ANGER);
    });

    it('should default to NEUTRAL for neutral text', () => {
      const state = tracker.inferEmotionalState('The meeting is at 3pm');

      expect(state.emotion).toBe(EmotionType.NEUTRAL);
    });

    it('should include context if provided', () => {
      const context = 'conversation-123';
      const state = tracker.inferEmotionalState('Hello', context);

      expect(state.context).toBe(context);
    });
  });

  describe('clearState', () => {
    it('should clear state for an entity', () => {
      const entityId = 'agent-123';

      tracker.updateState(entityId, {
        emotion: EmotionType.JOY,
        intensity: 0.8,
        timestamp: new Date(),
      });

      expect(tracker.getCurrentState(entityId)).toBeTruthy();

      tracker.clearState(entityId);

      expect(tracker.getCurrentState(entityId)).toBeNull();
      expect(tracker.getStateHistory(entityId)).toHaveLength(0);
    });
  });
});
