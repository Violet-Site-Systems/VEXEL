// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Custom hook for WebSocket connection and real-time updates
 */
import { useEffect, useState, useCallback } from 'react';
import { websocketService } from '../services/websocket';
import { Agent, GuardianAlert, InheritanceTrigger } from '../types';

export function useWebSocket(token?: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connect = async () => {
      try {
        await websocketService.connect(token || undefined);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect');
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, [token]);

  return { isConnected, error };
}

export function useAgentUpdates() {
  const [agents, setAgents] = useState<Map<string, Agent>>(new Map());

  useEffect(() => {
    const handleAgentUpdate = (agent: Agent) => {
      setAgents((prev) => {
        const newMap = new Map(prev);
        newMap.set(agent.agentId, agent);
        
        // Limit to last 100 agents to prevent memory leak
        if (newMap.size > 100) {
          const firstKey = newMap.keys().next().value;
          if (firstKey) {
            newMap.delete(firstKey);
          }
        }
        
        return newMap;
      });
    };

    websocketService.subscribeToAgentUpdates(handleAgentUpdate);

    return () => {
      websocketService.off('agent_status', handleAgentUpdate);
    };
  }, []);

  return Array.from(agents.values());
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<GuardianAlert[]>([]);

  useEffect(() => {
    const handleAlert = (alert: GuardianAlert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 100)); // Keep last 100 alerts
    };

    websocketService.subscribeToAlerts(handleAlert);

    return () => {
      websocketService.off('guardian_alert', handleAlert);
    };
  }, []);

  const acknowledgeAlert = useCallback((alertId: string, userId: string) => {
    websocketService.acknowledgeAlert(alertId, userId);
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.alertId === alertId
          ? { ...alert, acknowledged: true, acknowledgedBy: userId, acknowledgedAt: new Date() }
          : alert
      )
    );
  }, []);

  return { alerts, acknowledgeAlert };
}

export function useTriggers() {
  const [triggers, setTriggers] = useState<InheritanceTrigger[]>([]);

  useEffect(() => {
    const handleTrigger = (trigger: InheritanceTrigger) => {
      setTriggers((prev) => {
        const existing = prev.findIndex((t) => t.triggerId === trigger.triggerId);
        if (existing >= 0) {
          const newTriggers = [...prev];
          newTriggers[existing] = trigger;
          return newTriggers;
        }
        return [trigger, ...prev].slice(0, 50); // Keep last 50 triggers
      });
    };

    websocketService.subscribeToTriggers(handleTrigger);

    return () => {
      websocketService.off('inheritance_trigger', handleTrigger);
    };
  }, []);

  return triggers;
}
