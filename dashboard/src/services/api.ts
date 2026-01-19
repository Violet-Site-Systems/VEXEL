/**
 * API service for REST API calls to VEXEL API Gateway
 */
import { Agent, GuardianAlert, InheritanceTrigger, DashboardStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiService {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  private async fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  /**
   * Authentication
   */
  async login(userId: string, role: string): Promise<{ token: string; user: any }> {
    const response = await this.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      return response.data;
    }
    
    throw new Error('Login failed');
  }

  async verifyToken(): Promise<{ valid: boolean; user: any }> {
    const response = await this.fetch('/api/auth/verify');
    return response.data;
  }

  /**
   * Agent management
   */
  async getAgents(): Promise<Agent[]> {
    const response = await this.fetch('/api/agents');
    return response.data || [];
  }

  async getAgent(agentId: string): Promise<Agent> {
    const response = await this.fetch(`/api/agents/${agentId}`);
    return response.data;
  }

  async getAgentCapabilities(agentId: string): Promise<string[]> {
    const response = await this.fetch(`/api/agents/${agentId}/capabilities`);
    return response.data || [];
  }

  async updateAgentStatus(agentId: string, status: string): Promise<Agent> {
    const response = await this.fetch(`/api/agents/${agentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.data;
  }

  /**
   * Guardian alerts (mock implementation - to be connected to actual backend)
   */
  async getAlerts(): Promise<GuardianAlert[]> {
    // Mock data for now - will be replaced with actual API call
    return [];
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    // Mock implementation
    console.log('Acknowledging alert:', alertId, 'by', userId);
  }

  /**
   * Inheritance triggers (mock implementation - to be connected to actual backend)
   */
  async getTriggers(): Promise<InheritanceTrigger[]> {
    // Mock data for now - will be replaced with actual API call
    return [];
  }

  /**
   * Dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const agents = await this.getAgents();
    const alerts = await this.getAlerts();
    const triggers = await this.getTriggers();

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter((a) => a.status === 'active').length,
      inactiveAgents: agents.filter((a) => a.status === 'inactive').length,
      criticalAlerts: alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length,
      pendingTriggers: triggers.filter((t) => t.status === 'pending').length,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
}

// Singleton instance
export const apiService = new ApiService();
