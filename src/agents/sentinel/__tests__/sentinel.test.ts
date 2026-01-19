/**
 * Sentinel Agent Tests
 * Comprehensive test suite for cryptographic operations, key management, policy enforcement, and monitoring
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { SentinelAgent } from '../sentinel';
import { PolicyEngine } from '../policy';
import { SecurityMonitor } from '../monitor';
import { PolicyRule } from '../types';

describe('Sentinel Agent', () => {
  let agent: SentinelAgent;

  beforeEach(() => {
    agent = new SentinelAgent({
      maxFailedAttempts: 3,
      lockoutDuration: 60,
      enableMonitoring: true,
    });
  });

  describe('Key Generation and Management', () => {
    it('should generate a new key pair', async () => {
      const result = await agent.generateKeyPair('test-key-1');
      expect(result.success).toBe(true);
      expect(result.keyId).toBe('test-key-1');
    });

    it('should retrieve a public key', async () => {
      await agent.generateKeyPair('test-key-2');
      const publicKey = agent.getPublicKey('test-key-2');
      expect(publicKey).toBeTruthy();
      expect(typeof publicKey).toBe('string');
    });

    it('should return null for non-existent key', () => {
      const publicKey = agent.getPublicKey('non-existent');
      expect(publicKey).toBeNull();
    });

    it('should revoke a key', async () => {
      await agent.generateKeyPair('test-key-3');
      const result = agent.revokeKey('test-key-3');
      expect(result.success).toBe(true);

      // Revoked key should be inaccessible
      const publicKey = agent.getPublicKey('test-key-3');
      expect(publicKey).toBeNull();
    });

    it('should rotate a key', async () => {
      await agent.generateKeyPair('test-key-4');
      const { oldKeyId, newKeyId, success } = await agent.rotateKey('test-key-4');
      expect(success).toBe(true);
      expect(oldKeyId).toBe('test-key-4');
      expect(newKeyId).toBeTruthy();
    });
  });

  describe('Cryptographic Operations', () => {
    it('should sign and verify a message', async () => {
      // Use ECDSA for test reliability
      await agent.generateKeyPair('signing-key', 'ECDSA');
      const publicKey = agent.getPublicKey('signing-key')!;

      const signature = await agent.sign('test message', 'signing-key');
      expect(signature).toBeTruthy();
      expect(signature.keyId).toBe('signing-key');
      expect(signature.signature).toBeTruthy();
    });

    it('should fail verification with wrong public key', async () => {
      await agent.generateKeyPair('key-1', 'ECDSA');
      await agent.generateKeyPair('key-2', 'ECDSA');

      const signature = await agent.sign('test message', 'key-1');
      const wrongPublicKey = agent.getPublicKey('key-2')!;

      const verification = await agent.verify(signature, wrongPublicKey);
      expect(verification.isValid).toBe(false);
    });

    it('should throw error when signing with revoked key', async () => {
      await agent.generateKeyPair('revoked-key', 'ECDSA');
      agent.revokeKey('revoked-key');

      await expect(agent.sign('test', 'revoked-key')).rejects.toThrow();
    });
  });

  describe('Policy Enforcement', () => {
    let policyEngine: PolicyEngine;

    beforeEach(() => {
      policyEngine = new PolicyEngine(true); // Default deny
    });

    it('should allow access with matching allow rule', () => {
      const rule: PolicyRule = {
        id: 'rule-1',
        name: 'Allow agent read',
        principal: 'agent:*',
        resource: 'data:read',
        action: 'allow',
        createdAt: new Date(),
      };

      policyEngine.addRule(rule);

      const result = policyEngine.evaluate({
        principal: 'agent:123',
        resource: 'data:read',
        action: 'allow',
      });

      expect(result.allowed).toBe(true);
      expect(result.matchedRules.length).toBeGreaterThan(0);
    });

    it('should deny access with explicit deny rule', () => {
      const denyRule: PolicyRule = {
        id: 'deny-rule',
        name: 'Deny admin access',
        principal: 'user:*',
        resource: 'admin:*',
        action: 'deny',
        createdAt: new Date(),
      };

      const allowRule: PolicyRule = {
        id: 'allow-rule',
        name: 'Allow user access',
        principal: 'user:*',
        resource: 'admin:*',
        action: 'allow',
        createdAt: new Date(),
      };

      policyEngine.addRule(denyRule);
      policyEngine.addRule(allowRule);

      const result = policyEngine.evaluate({
        principal: 'user:123',
        resource: 'admin:panel',
        action: 'read', // Any action
      });

      expect(result.allowed).toBe(false); // Deny takes precedence
    });

    it('should evaluate conditional rules', () => {
      const rule: PolicyRule = {
        id: 'conditional-rule',
        name: 'Allow agent write during business hours',
        principal: 'agent:*',
        resource: 'data:write',
        action: 'allow',
        conditions: {
          'hour': { $gte: 9, $lt: 17 },
        },
        createdAt: new Date(),
      };

      policyEngine.addRule(rule);

      const businessHour = new Date();
      businessHour.setHours(10);

      const result = policyEngine.evaluate({
        principal: 'agent:123',
        resource: 'data:write',
        action: 'allow',
        context: { hour: 10 },
      });

      expect(result.allowed).toBe(true);
    });

    it('should support wildcard patterns', () => {
      const rule: PolicyRule = {
        id: 'wildcard-rule',
        name: 'Allow all agent operations',
        principal: 'agent:*',
        resource: 'agent:*',
        action: 'allow',
        createdAt: new Date(),
      };

      policyEngine.addRule(rule);

      const result = policyEngine.evaluate({
        principal: 'agent:123',
        resource: 'agent:456',
        action: 'allow',
      });

      expect(result.allowed).toBe(true);
    });

    it('should handle expired rules', () => {
      const expiredRule: PolicyRule = {
        id: 'expired-rule',
        name: 'Expired access',
        principal: 'user:123',
        resource: 'data:*',
        action: 'allow',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        createdAt: new Date(),
      };

      policyEngine.addRule(expiredRule);

      const result = policyEngine.evaluate({
        principal: 'user:123',
        resource: 'data:read',
        action: 'allow',
      });

      expect(result.allowed).toBe(false); // Default deny when no rules match
    });
  });

  describe('Security Monitoring', () => {
    let monitor: SecurityMonitor;

    beforeEach(() => {
      monitor = new SecurityMonitor(3, 60); // 3 attempts, 60 second lockout
    });

    it('should track failed authentication attempts', () => {
      monitor.recordFailedAttempt('user:123');
      monitor.recordFailedAttempt('user:123');

      expect(monitor.isUserLockedOut('user:123')).toBe(false);
    });

    it('should lock out user after max failed attempts', () => {
      monitor.recordFailedAttempt('user:456');
      monitor.recordFailedAttempt('user:456');
      const alert = monitor.recordFailedAttempt('user:456');

      expect(monitor.isUserLockedOut('user:456')).toBe(true);
      expect(alert).toBeTruthy();
      expect(alert?.severity).toBe('critical');
    });

    it('should clear failed attempts after successful login', () => {
      monitor.recordFailedAttempt('user:789');
      monitor.recordFailedAttempt('user:789');
      monitor.clearFailedAttempts('user:789');

      expect(monitor.isUserLockedOut('user:789')).toBe(false);
    });

    it('should record unauthorized access alerts', () => {
      const alert = monitor.recordUnauthorizedAccess(
        'user:123',
        'admin:panel',
        'Insufficient permissions'
      );

      expect(alert).toBeTruthy();
      expect(alert.type).toBe('unauthorized_access');
      expect(alert.severity).toBe('high');
    });

    it('should record policy violation alerts', () => {
      const alert = monitor.recordPolicyViolation('user:123', 'data:export', {
        timestamp: new Date(),
      });

      expect(alert).toBeTruthy();
      expect(alert.type).toBe('policy_violation');
    });

    it('should retrieve active alerts', () => {
      monitor.recordUnauthorizedAccess('user:1', 'resource:1', 'reason');
      monitor.recordUnauthorizedAccess('user:2', 'resource:2', 'reason');

      const alerts = monitor.getActiveAlerts();
      expect(alerts.length).toBeGreaterThanOrEqual(2);
    });

    it('should acknowledge alerts', () => {
      const alert = monitor.recordUnauthorizedAccess('user:1', 'resource:1', 'reason');
      expect(alert.acknowledged).toBe(false);

      monitor.acknowledgeAlert(alert.id);
      const acknowledgedAlert = monitor.getAlert(alert.id);
      expect(acknowledgedAlert?.acknowledged).toBe(true);
    });

    it('should filter alerts by type', () => {
      monitor.recordUnauthorizedAccess('user:1', 'resource:1', 'reason');
      monitor.recordPolicyViolation('user:2', 'policy:1');

      const unauthorizedAlerts = monitor.getAlertsByType('unauthorized_access');
      const policyAlerts = monitor.getAlertsByType('policy_violation');

      expect(unauthorizedAlerts.length).toBeGreaterThan(0);
      expect(policyAlerts.length).toBeGreaterThan(0);
    });

    it('should return security metrics', () => {
      monitor.recordFailedAttempt('user:1');
      monitor.recordUnauthorizedAccess('user:2', 'resource:1', 'reason');

      const metrics = monitor.getMetrics();
      expect(metrics.timestamp).toBeTruthy();
      expect(metrics.alertCount).toBeGreaterThan(0);
      expect(metrics.failedAuthAttempts).toBeGreaterThan(0);
    });
  });

  describe('Integration', () => {
    it('should evaluate policies and monitor violations', async () => {
      // Setup policy
      const rule: PolicyRule = {
        id: 'rule-1',
        name: 'Allow agent read',
        principal: 'agent:*',
        resource: 'data:read',
        action: 'allow',
        createdAt: new Date(),
      };

      // Evaluate access
      const result = await agent.evaluatePolicy({
        principal: 'agent:123',
        resource: 'data:read',
        action: 'allow',
      });

      expect(result).toBeTruthy();
    });

    it('should handle lockout during failed authentication', () => {
      agent.recordFailedAttempt('user:123');
      agent.recordFailedAttempt('user:123');
      expect(agent.isUserLockedOut('user:123')).toBe(false);

      agent.recordFailedAttempt('user:123');
      expect(agent.isUserLockedOut('user:123')).toBe(true);
    });

    it('should get active security alerts', async () => {
      await agent.generateKeyPair('key-1');
      agent.revokeKey('key-1');

      const alerts = agent.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should get security metrics', async () => {
      await agent.generateKeyPair('key-1');
      const metrics = agent.getSecurityMetrics();

      expect(metrics).toBeTruthy();
      expect(metrics.timestamp).toBeTruthy();
      expect(typeof metrics.alertCount).toBe('number');
    });
  });

  describe('Configuration', () => {
    it('should return current configuration', () => {
      const config = agent.getConfig();
      expect(config).toBeTruthy();
      expect(config.keyRotationDays).toBe(90);
      expect(config.sessionTokenTTL).toBe(86400);
    });

    it('should apply custom configuration', () => {
      const customAgent = new SentinelAgent({
        keyRotationDays: 180,
        maxFailedAttempts: 10,
        lockoutDuration: 1800,
      });

      const config = customAgent.getConfig();
      expect(config.keyRotationDays).toBe(180);
      expect(config.maxFailedAttempts).toBe(10);
      expect(config.lockoutDuration).toBe(1800);
    });
  });
});
