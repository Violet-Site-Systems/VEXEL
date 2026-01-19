/**
 * Guardian Alert Component
 */
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { GuardianAlert, AlertSeverity } from '../types';
import { formatRelativeTime, getSeverityColor, getSeverityBgColor } from '../utils/helpers';

interface AlertItemProps {
  alert: GuardianAlert;
  onAcknowledge?: (alertId: string) => void;
}

export function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
  const severityColor = getSeverityColor(alert.severity);
  const severityBgColor = getSeverityBgColor(alert.severity);

  const getIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-4 border-l-4 ${severityBgColor} border-l-current`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={severityColor}>
            {getIcon(alert.severity)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold">{alert.type.replace(/_/g, ' ').toUpperCase()}</h4>
              <span className={`text-xs px-2 py-0.5 rounded ${severityBgColor} ${severityColor}`}>
                {alert.severity}
              </span>
            </div>
            <p className="text-sm text-slate-300 mb-2">{alert.message}</p>
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(alert.timestamp)}</span>
              </div>
              <span>Agent: {alert.agentId}</span>
            </div>
            {alert.acknowledged && (
              <div className="mt-2 flex items-center space-x-1 text-xs text-green-400">
                <CheckCircle className="w-3 h-3" />
                <span>
                  Acknowledged by {alert.acknowledgedBy} {formatRelativeTime(alert.acknowledgedAt!)}
                </span>
              </div>
            )}
          </div>
        </div>
        {!alert.acknowledged && onAcknowledge && (
          <button
            onClick={() => onAcknowledge(alert.alertId)}
            className="px-3 py-1 bg-primary-600 hover:bg-primary-700 rounded text-sm transition-colors"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}

interface AlertListProps {
  alerts: GuardianAlert[];
  onAcknowledge?: (alertId: string) => void;
}

export function AlertList({ alerts, onAcknowledge }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-slate-400">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertItem key={alert.alertId} alert={alert} onAcknowledge={onAcknowledge} />
      ))}
    </div>
  );
}
