// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Agent Status Card Component
 */
import { Activity, Heart, Clock, Zap } from 'lucide-react';
import { Agent } from '../types';
import { formatRelativeTime, getStatusColor, getStatusBgColor, calculateAgentHealth, truncate } from '../utils/helpers';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const health = calculateAgentHealth(agent);
  const statusColor = getStatusColor(agent.status);
  const statusBgColor = getStatusBgColor(agent.status);

  return (
    <div
      className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer hover:shadow-lg"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{truncate(agent.agentId, 20)}</h3>
          <p className="text-xs text-slate-400">{truncate(agent.did, 30)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusBgColor} ${statusColor}`}>
          {agent.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-red-400" />
          <div>
            <p className="text-xs text-slate-400">Last Heartbeat</p>
            <p className="text-sm font-medium">{formatRelativeTime(agent.lastHeartbeat)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-xs text-slate-400">Health Score</p>
            <p className="text-sm font-medium">{health}%</p>
          </div>
        </div>
      </div>

      {agent.emotionalState && (
        <div className="flex items-center space-x-2 mb-3 p-2 bg-slate-700/50 rounded">
          <Zap className="w-4 h-4 text-yellow-400" />
          <div className="flex-1">
            <p className="text-xs text-slate-400">Emotional State</p>
            <p className="text-sm font-medium capitalize">{agent.emotionalState.emotion}</p>
          </div>
          <div className="w-16 bg-slate-600 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full"
              style={{ width: `${agent.emotionalState.intensity * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {agent.capabilities.slice(0, 3).map((capability) => (
          <span
            key={capability}
            className="text-xs px-2 py-1 bg-primary-600/20 text-primary-400 rounded"
          >
            {capability}
          </span>
        ))}
        {agent.capabilities.length > 3 && (
          <span className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded">
            +{agent.capabilities.length - 3} more
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Created {formatRelativeTime(agent.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
