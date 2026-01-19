/**
 * Event Bus - Maestro Agent
 * Handles publish/subscribe for inter-agent communication and choreography events
 */

import { ChoreographyEvent, EventSubscription, AgentEventType } from './types';

export class MaestroEventBus {
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventHistory: ChoreographyEvent[] = [];
  private maxHistorySize: number = 10000;

  /**
   * Publish an event to all interested subscribers
   */
  async publish(event: ChoreographyEvent): Promise<void> {
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify subscribers
    const relevantSubscriptions = this.getRelevantSubscriptions(event);

    const promises = relevantSubscriptions.map((sub) => {
      if (!sub.active) return Promise.resolve();

      return sub.callback(event).catch((error) => {
        console.error(`Error in event subscription ${sub.id}:`, error);
      });
    });

    await Promise.allSettled(promises);
  }

  /**
   * Subscribe to events
   */
  subscribe(
    types: AgentEventType[],
    agentId?: string,
    callback?: (event: ChoreographyEvent) => Promise<void>,
  ): EventSubscription {
    const subscription: EventSubscription = {
      id: this.generateSubscriptionId(),
      eventTypes: types,
      agentId,
      active: true,
      callback: callback || (async () => {}),
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Pause a subscription
   */
  pauseSubscription(subscriptionId: string): void {
    const sub = this.subscriptions.get(subscriptionId);
    if (sub) {
      sub.active = false;
    }
  }

  /**
   * Resume a subscription
   */
  resumeSubscription(subscriptionId: string): void {
    const sub = this.subscriptions.get(subscriptionId);
    if (sub) {
      sub.active = true;
    }
  }

  /**
   * Get all subscriptions
   */
  getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get subscriptions for a specific agent
   */
  getAgentSubscriptions(agentId: string): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter((sub) => sub.agentId === agentId);
  }

  /**
   * Get event history
   */
  getEventHistory(
    filter?: {
      eventTypes?: AgentEventType[];
      sourceAgent?: string;
      workflowId?: string;
      limit?: number;
      since?: number;
    },
  ): ChoreographyEvent[] {
    let result = [...this.eventHistory];

    if (filter?.since) {
      result = result.filter((e) => e.timestamp >= filter.since!);
    }

    if (filter?.eventTypes && filter.eventTypes.length > 0) {
      result = result.filter((e) => filter.eventTypes!.includes(e.type));
    }

    if (filter?.sourceAgent) {
      result = result.filter((e) => e.sourceAgent === filter.sourceAgent);
    }

    if (filter?.workflowId) {
      result = result.filter((e) => e.workflowId === filter.workflowId);
    }

    if (filter?.limit) {
      result = result.slice(-filter.limit);
    }

    return result;
  }

  /**
   * Get events by correlation ID
   */
  getEventsByCorrelation(correlationId: string): ChoreographyEvent[] {
    return this.eventHistory.filter((e) => e.correlationId === correlationId);
  }

  /**
   * Get relevant subscriptions for an event
   */
  private getRelevantSubscriptions(event: ChoreographyEvent): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter((sub) => {
      if (!sub.active) return false;

      // Check event type
      if (!sub.eventTypes.includes(event.type)) return false;

      // Check agent filter if specified
      if (sub.agentId && event.sourceAgent !== sub.agentId && event.targetAgent !== sub.agentId) {
        return false;
      }

      // Check workflow filter if specified
      if (sub.workflowId && event.workflowId !== sub.workflowId) {
        return false;
      }

      return true;
    });
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all subscriptions and history (for testing)
   */
  clear(): void {
    this.subscriptions.clear();
    this.eventHistory = [];
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get event history size
   */
  getHistorySize(): number {
    return this.eventHistory.length;
  }
}
