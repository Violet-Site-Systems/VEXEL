/**
 * Sentinel Agent - Security Monitoring
 * Anomaly detection, alerts, and security event tracking
 */

import { SecurityAlert, SecurityMetric, SessionToken } from './types';

/**
 * Security monitoring and alerting system
 */
export class SecurityMonitor {
  private alerts: Map<string, SecurityAlert> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private lockedOutUsers: Map<string, Date> = new Map();
  private maxFailedAttempts: number;
  private lockoutDuration: number; // in seconds
  private alertWebhook?: string;

  constructor(maxFailedAttempts: number = 5, lockoutDuration: number = 900, alertWebhook?: string) {
    this.maxFailedAttempts = maxFailedAttempts;
    this.lockoutDuration = lockoutDuration;
    this.alertWebhook = alertWebhook;
  }

  /**
   * Record a failed authentication attempt
   * @param userId - User identifier
   * @returns Alert if user is locked out
   */
  recordFailedAttempt(userId: string): SecurityAlert | null {
    const attempts = this.failedAttempts.get(userId) || { count: 0, lastAttempt: new Date() };
    attempts.count += 1;
    attempts.lastAttempt = new Date();
    this.failedAttempts.set(userId, attempts);

    if (attempts.count >= this.maxFailedAttempts) {
      const lockoutExpiry = new Date(Date.now() + this.lockoutDuration * 1000);
      this.lockedOutUsers.set(userId, lockoutExpiry);

      const alert = this.createAlert(
        'unauthorized_access',
        'critical',
        `User ${userId} locked out after ${attempts.count} failed authentication attempts`,
        { userId, attemptCount: attempts.count }
      );

      this.alerts.set(alert.id, alert);
      this.sendAlert(alert);

      return alert;
    } else if (attempts.count === this.maxFailedAttempts - 1) {
      // Warning when approaching limit
      const alert = this.createAlert(
        'anomaly',
        'high',
        `${this.maxFailedAttempts - attempts.count} more failed attempts will lock out user ${userId}`,
        { userId, attemptCount: attempts.count, remainingAttempts: this.maxFailedAttempts - attempts.count }
      );

      this.alerts.set(alert.id, alert);
      this.sendAlert(alert);

      return alert;
    }

    return null;
  }

  /**
   * Check if a user is locked out
   * @param userId - User identifier
   * @returns True if user is currently locked out
   */
  isUserLockedOut(userId: string): boolean {
    const lockoutExpiry = this.lockedOutUsers.get(userId);
    if (!lockoutExpiry) return false;

    if (lockoutExpiry < new Date()) {
      // Lockout has expired
      this.lockedOutUsers.delete(userId);
      this.failedAttempts.delete(userId);
      return false;
    }

    return true;
  }

  /**
   * Clear failed attempts for a user after successful authentication
   * @param userId - User identifier
   */
  clearFailedAttempts(userId: string): void {
    this.failedAttempts.delete(userId);
  }

  /**
   * Record an unauthorized access attempt
   * @param userId - User identifier
   * @param resource - Resource attempted to access
   * @param reason - Reason for denial
   * @returns Generated alert
   */
  recordUnauthorizedAccess(userId: string, resource: string, reason: string): SecurityAlert {
    const alert = this.createAlert(
      'unauthorized_access',
      'high',
      `Unauthorized access attempt by ${userId} to resource ${resource}: ${reason}`,
      { userId, resource, reason }
    );

    this.alerts.set(alert.id, alert);
    this.sendAlert(alert);

    return alert;
  }

  /**
   * Record a policy violation
   * @param userId - User identifier
   * @param policy - Policy that was violated
   * @param context - Additional context
   * @returns Generated alert
   */
  recordPolicyViolation(userId: string, policy: string, context?: Record<string, any>): SecurityAlert {
    const alert = this.createAlert(
      'policy_violation',
      'high',
      `Policy violation by ${userId}: ${policy}`,
      { userId, policy, ...context }
    );

    this.alerts.set(alert.id, alert);
    this.sendAlert(alert);

    return alert;
  }

  /**
   * Record a potential key compromise
   * @param keyId - Key identifier
   * @param reason - Reason for suspicion
   * @returns Generated alert
   */
  recordKeyCompromise(keyId: string, reason: string): SecurityAlert {
    const alert = this.createAlert(
      'key_compromise',
      'critical',
      `Potential key compromise detected for key ${keyId}: ${reason}`,
      { keyId, reason }
    );

    this.alerts.set(alert.id, alert);
    this.sendAlert(alert);

    return alert;
  }

  /**
   * Record an invalid signature
   * @param keyId - Key identifier
   * @param message - Message that failed verification
   * @returns Generated alert
   */
  recordInvalidSignature(keyId: string, message: string): SecurityAlert {
    const alert = this.createAlert(
      'signature_invalid',
      'medium',
      `Invalid signature detected for key ${keyId}`,
      { keyId, messageHash: message }
    );

    this.alerts.set(alert.id, alert);
    this.sendAlert(alert);

    return alert;
  }

  /**
   * Record a generic anomaly
   * @param anomalyType - Type of anomaly
   * @param message - Description
   * @param severity - Alert severity
   * @returns Generated alert
   */
  recordAnomaly(anomalyType: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical'): SecurityAlert {
    const alert = this.createAlert('anomaly', severity, message, { anomalyType });

    this.alerts.set(alert.id, alert);
    this.sendAlert(alert);

    return alert;
  }

  /**
   * Get an alert by ID
   * @param alertId - Alert identifier
   * @returns Alert or undefined
   */
  getAlert(alertId: string): SecurityAlert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Get all active alerts
   * @returns Array of unacknowledged alerts
   */
  getActiveAlerts(): SecurityAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => !alert.acknowledged);
  }

  /**
   * Get all alerts
   * @returns All recorded alerts
   */
  getAllAlerts(): SecurityAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Acknowledge an alert
   * @param alertId - Alert identifier
   * @returns True if alert was acknowledged
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Get alerts of a specific type
   * @param type - Alert type
   * @returns Array of alerts matching type
   */
  getAlertsByType(type: string): SecurityAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => alert.type === type);
  }

  /**
   * Get alerts of a specific severity
   * @param severity - Alert severity level
   * @returns Array of alerts matching severity
   */
  getAlertsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): SecurityAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => alert.severity === severity);
  }

  /**
   * Clear all alerts
   */
  clearAllAlerts(): void {
    this.alerts.clear();
  }

  /**
   * Get current security metrics
   * @returns Security metrics snapshot
   */
  getMetrics(): SecurityMetric {
    return {
      timestamp: new Date(),
      alertCount: this.alerts.size,
      failedAuthAttempts: this.failedAttempts.size,
      keyRotationsDue: 0, // Would be populated by KeyManager
      revokedKeys: 0, // Would be populated by KeyManager
      policyViolations: this.getAlertsByType('policy_violation').length,
    };
  }

  /**
   * Create a new security alert
   * @param type - Alert type
   * @param severity - Alert severity
   * @param message - Alert message
   * @param context - Additional context
   * @returns Generated alert
   */
  private createAlert(
    type: SecurityAlert['type'],
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    context: Record<string, any>
  ): SecurityAlert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      context,
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  /**
   * Send alert to webhook if configured
   * @param alert - Alert to send
   */
  private async sendAlert(alert: SecurityAlert): Promise<void> {
    if (!this.alertWebhook) return;

    try {
      await fetch(this.alertWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error(`Failed to send alert to webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
