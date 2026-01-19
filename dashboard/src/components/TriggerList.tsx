/**
 * Inheritance Trigger Monitor Component
 */
import { Clock, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import { InheritanceTrigger } from '../types';
import { formatRelativeTime, truncate } from '../utils/helpers';

interface TriggerItemProps {
  trigger: InheritanceTrigger;
}

export function TriggerItem({ trigger }: TriggerItemProps) {
  const getStatusColor = () => {
    switch (trigger.status) {
      case 'completed':
        return 'text-green-500';
      case 'active':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      case 'pending':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (trigger.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'active':
        return <AlertCircle className="w-5 h-5" />;
      case 'failed':
        return <XCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const progress = (trigger.missedHeartbeats / trigger.threshold) * 100;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold">{truncate(trigger.agentId, 25)}</h4>
            <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="text-sm capitalize">{trigger.status}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">Type: {trigger.type.replace(/_/g, ' ')}</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Heartbeat Progress</span>
          <span className="font-medium">
            {trigger.missedHeartbeats} / {trigger.threshold}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              progress >= 100 ? 'bg-red-500' : progress >= 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm mb-3">
        <div className="flex items-center space-x-1 text-slate-400">
          <Users className="w-4 h-4" />
          <span>{trigger.beneficiaries.length} beneficiaries</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400">
          <Clock className="w-4 h-4" />
          <span>Last check {formatRelativeTime(trigger.lastCheckTimestamp)}</span>
        </div>
      </div>

      {trigger.triggeredAt && (
        <p className="text-xs text-yellow-400">
          Triggered {formatRelativeTime(trigger.triggeredAt)}
        </p>
      )}
      {trigger.completedAt && (
        <p className="text-xs text-green-400">
          Completed {formatRelativeTime(trigger.completedAt)}
        </p>
      )}
    </div>
  );
}

interface TriggerListProps {
  triggers: InheritanceTrigger[];
}

export function TriggerList({ triggers }: TriggerListProps) {
  if (triggers.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-slate-400">No inheritance triggers</p>
      </div>
    );
  }

  // Sort by status priority: pending > active > failed > completed
  const sortedTriggers = [...triggers].sort((a, b) => {
    const priority = { pending: 0, active: 1, failed: 2, completed: 3 };
    return priority[a.status] - priority[b.status];
  });

  return (
    <div className="space-y-3">
      {sortedTriggers.map((trigger) => (
        <TriggerItem key={trigger.triggerId} trigger={trigger} />
      ))}
    </div>
  );
}
