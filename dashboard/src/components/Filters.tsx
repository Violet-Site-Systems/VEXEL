// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Search and Filter Components
 */
import { Search, X, Filter } from 'lucide-react';
import { useState } from 'react';
import { AgentStatus, AlertSeverity } from '../types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

interface StatusFilterProps {
  selected: AgentStatus[];
  onChange: (statuses: AgentStatus[]) => void;
}

export function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const statuses: AgentStatus[] = ['active', 'inactive', 'paused', 'error'];

  const toggleStatus = (status: AgentStatus) => {
    if (selected.includes(status)) {
      onChange(selected.filter((s) => s !== status));
    } else {
      onChange([...selected, status]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
      >
        <Filter className="w-5 h-5" />
        <span>Status</span>
        {selected.length > 0 && (
          <span className="px-2 py-0.5 bg-primary-600 rounded-full text-xs">
            {selected.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20 min-w-[200px]">
            <div className="p-2">
              {statuses.map((status) => (
                <label
                  key={status}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-700 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="rounded border-slate-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="capitalize">{status}</span>
                </label>
              ))}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-slate-700 p-2">
                <button
                  onClick={() => {
                    onChange([]);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-1 text-sm text-slate-400 hover:text-white"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface AlertSeverityFilterProps {
  selected: AlertSeverity[];
  onChange: (severities: AlertSeverity[]) => void;
}

export function AlertSeverityFilter({ selected, onChange }: AlertSeverityFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const severities: AlertSeverity[] = ['info', 'warning', 'critical'];

  const toggleSeverity = (severity: AlertSeverity) => {
    if (selected.includes(severity)) {
      onChange(selected.filter((s) => s !== severity));
    } else {
      onChange([...selected, severity]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
      >
        <Filter className="w-5 h-5" />
        <span>Severity</span>
        {selected.length > 0 && (
          <span className="px-2 py-0.5 bg-primary-600 rounded-full text-xs">
            {selected.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20 min-w-[200px]">
            <div className="p-2">
              {severities.map((severity) => (
                <label
                  key={severity}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-700 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(severity)}
                    onChange={() => toggleSeverity(severity)}
                    className="rounded border-slate-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="capitalize">{severity}</span>
                </label>
              ))}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-slate-700 p-2">
                <button
                  onClick={() => {
                    onChange([]);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-1 text-sm text-slate-400 hover:text-white"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
