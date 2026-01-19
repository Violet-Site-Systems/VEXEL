/**
 * Login Page Component
 */
import { useState } from 'react';
import { Activity } from 'lucide-react';
import { useAuth } from '../hooks/useApi';

export function LoginPage() {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('human');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(userId, role);
      if (!success) {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Activity className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">VEXEL Dashboard</h1>
          <p className="text-slate-400">Real-time Agent Monitoring</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-slate-300 mb-2">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your user ID"
                autoComplete="username"
                aria-describedby={error ? 'login-error' : undefined}
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoComplete="organization-title"
                aria-describedby={error ? 'login-error' : undefined}
              >
                <option value="human">Human</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {error && (
              <div 
                id="login-error"
                className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 text-center">
              Phase 3.2: Monitoring Dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
