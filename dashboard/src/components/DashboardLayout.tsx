// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Main Dashboard Layout Component
 */
import { ReactNode } from 'react';
import { Activity, Bell, Home, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useApi';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Activity className="w-8 h-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold">VEXEL Dashboard</h1>
                <p className="text-sm text-slate-400">Real-time Agent Monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.userId || 'Guest'}</p>
                <p className="text-xs text-slate-400">{user?.role || 'viewer'}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-600 text-white"
            >
              <Home className="w-5 h-5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => {
                const alertsSection = document.getElementById('alerts-section');
                alertsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors text-left"
            >
              <Bell className="w-5 h-5" />
              <span>Alerts</span>
            </button>
            <button
              onClick={() => {
                const settingsSection = document.getElementById('settings-section');
                settingsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors text-left"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto scrollbar-thin">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
