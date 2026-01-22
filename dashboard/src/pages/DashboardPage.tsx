// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Main Dashboard Page Component
 */
import { useState, useMemo } from 'react';
import { Activity, AlertCircle, Users, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatsCard } from '../components/StatsCard';
import { AgentCard } from '../components/AgentCard';
import { AlertList } from '../components/AlertList';
import { TriggerList } from '../components/TriggerList';
import { AgentStatusChart, AgentActivityChart } from '../components/Charts';
import { SearchBar, StatusFilter, AlertSeverityFilter } from '../components/Filters';
import { useAgents, useDashboardStats, useAuth } from '../hooks/useApi';
import { useWebSocket, useAgentUpdates, useAlerts, useTriggers } from '../hooks/useWebSocket';
import { AgentStatus, AlertSeverity } from '../types';
import { filterAgents } from '../utils/helpers';

export function DashboardPage() {
  const { token, user } = useAuth();
  const { isConnected } = useWebSocket(token);
  const { data: initialAgents, loading: agentsLoading } = useAgents();
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const realtimeAgents = useAgentUpdates();
  const { alerts, acknowledgeAlert } = useAlerts();
  const triggers = useTriggers();

  // Merge initial agents with real-time updates
  const agents = useMemo(() => {
    const baseAgents = initialAgents || [];

    // If there are no realtime updates yet, just return the initial list
    if (!realtimeAgents || realtimeAgents.length === 0) {
      return baseAgents;
    }

    // Merge by agent ID: start from initial agents, then overlay realtime ones
    const agentsById = new Map<string, (typeof baseAgents)[number]>();

    for (const agent of baseAgents) {
      // Use REST agent as the initial version
      agentsById.set((agent as any).id, agent);
    }

    for (const rtAgent of realtimeAgents) {
      const existing = agentsById.get((rtAgent as any).id);
      // Overlay realtime data on top of any existing agent data
      agentsById.set((rtAgent as any).id, existing ? { ...existing, ...rtAgent } : rtAgent);
    }

    return Array.from(agentsById.values());
  }, [initialAgents, realtimeAgents]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus[]>([]);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<AlertSeverity[]>([]);

  // Apply filters
  const filteredAgents = useMemo(() => {
    return filterAgents(agents, searchQuery, statusFilter);
  }, [agents, searchQuery, statusFilter]);

  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    if (alertSeverityFilter.length > 0) {
      filtered = filtered.filter((alert) => alertSeverityFilter.includes(alert.severity));
    }
    return filtered;
  }, [alerts, alertSeverityFilter]);

  const handleAcknowledgeAlert = (alertId: string) => {
    const userId = user?.userId || 'unknown';
    acknowledgeAlert(alertId, userId);
  };

  if (agentsLoading || statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Activity className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Connection Status */}
      <div className="mb-6">
        <div className={`flex items-center space-x-2 text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span>{isConnected ? 'Connected to real-time updates' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Agents"
          value={stats?.totalAgents || 0}
          icon={<Users className="w-6 h-6" />}
          color="bg-primary-600"
        />
        <StatsCard
          title="Active Agents"
          value={stats?.activeAgents || 0}
          icon={<Activity className="w-6 h-6" />}
          color="bg-green-600"
        />
        <StatsCard
          title="Critical Alerts"
          value={stats?.criticalAlerts || 0}
          icon={<AlertCircle className="w-6 h-6" />}
          color="bg-red-600"
        />
        <StatsCard
          title="Pending Triggers"
          value={stats?.pendingTriggers || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-yellow-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AgentStatusChart agents={agents} />
        <AgentActivityChart agents={agents} />
      </div>

      {/* Agents Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Agents</h2>
          <div className="flex items-center space-x-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search agents..."
            />
            <StatusFilter selected={statusFilter} onChange={setStatusFilter} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <AgentCard key={agent.agentId} agent={agent} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-400">
              No agents found
            </div>
          )}
        </div>
      </section>

      {/* Alerts Section */}
      <section id="alerts-section" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Guardian Alerts</h2>
          <AlertSeverityFilter selected={alertSeverityFilter} onChange={setAlertSeverityFilter} />
        </div>
        <AlertList alerts={filteredAlerts} onAcknowledge={handleAcknowledgeAlert} />
      </section>

      {/* Inheritance Triggers Section */}
      <section id="settings-section">
        <h2 className="text-2xl font-bold mb-4">Inheritance Triggers</h2>
        <TriggerList triggers={triggers} />
      </section>
    </DashboardLayout>
  );
}
