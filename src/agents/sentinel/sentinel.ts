/**
 * Sentinel Agent - Main Guardian
 * Orchestrates cryptographic operations, key management, policy enforcement, and security monitoring
 */

import { SentinelConfig, Signature, VerificationResult, PolicyEvaluationResult, PolicyContext, CryptoKey, KeyManagementResult } from './types';
import { CryptoOperations } from './crypto';
import { KeyManager } from './keys';
import { PolicyEngine } from './policy';
import { SecurityMonitor } from './monitor';

/**
 * Sentinel Agent - Main entry point for security operations
 */
export class SentinelAgent {
  private crypto: CryptoOperations;
  private keyManager: KeyManager;
  private policyEngine: PolicyEngine;
  private monitor: SecurityMonitor;
  private config: SentinelConfig;

  constructor(config: SentinelConfig = {}) {
    this.config = {
      defaultCurve: config.defaultCurve || 'secp256k1',
      defaultKDF: config.defaultKDF || 'PBKDF2',
      keyRotationDays: config.keyRotationDays || 90,
      sessionTokenTTL: config.sessionTokenTTL || 86400,
      maxFailedAttempts: config.maxFailedAttempts || 5,
      lockoutDuration: config.lockoutDuration || 900,
      enableMonitoring: config.enableMonitoring ?? true,
      alertWebhookUrl: config.alertWebhookUrl,
    };

    this.crypto = new CryptoOperations('Ed25519');
    this.keyManager = new KeyManager(this.config.keyRotationDays);
    this.policyEngine = new PolicyEngine(true);
    this.monitor = new SecurityMonitor(
      this.config.maxFailedAttempts,
      this.config.lockoutDuration,
      this.config.alertWebhookUrl
    );
  }

  async sign(message: string, keyId: string): Promise<Signature> {
    const key = this.keyManager.getKey(keyId);
    if (!key || !key.privateKey) {
      throw new Error(`Key not found or inaccessible: ${keyId}`);
    }
    if (key.expiresAt && key.expiresAt < new Date()) {
      this.monitor.recordAnomaly('key_expired', `Key ${keyId} has expired`, 'high');
      throw new Error(`Key has expired: ${keyId}`);
    }
    return this.crypto.sign(message, key.privateKey, keyId);
  }

  async verify(signature: Signature, publicKey: string): Promise<VerificationResult> {
    const result = await this.crypto.verify(signature, publicKey);
    if (!result.isValid && this.config.enableMonitoring) {
      this.monitor.recordInvalidSignature(signature.keyId, signature.message);
    }
    return result;
  }

  async generateKeyPair(keyId: string, algorithm: 'Ed25519' | 'ECDSA' = 'Ed25519'): Promise<KeyManagementResult> {
    return this.keyManager.generateKeyPair(keyId, algorithm, this.config.defaultCurve);
  }

  async importKey(keyId: string, publicKey: string, privateKey?: string): Promise<KeyManagementResult> {
    return this.keyManager.importKey(keyId, publicKey, privateKey, 'Ed25519');
  }

  getPublicKey(keyId: string): string | null {
    return this.keyManager.getPublicKey(keyId);
  }

  revokeKey(keyId: string): KeyManagementResult {
    const result = this.keyManager.revokeKey(keyId);
    if (result.success && this.config.enableMonitoring) {
      this.monitor.recordKeyCompromise(keyId, 'Key revoked');
    }
    return result;
  }

  async rotateKey(oldKeyId: string): Promise<{ oldKeyId: string; newKeyId: string; success: boolean }> {
    const { result, newKeyId } = await this.keyManager.rotateKey(oldKeyId);
    return { oldKeyId, newKeyId, success: result.success };
  }

  getKeysForRotation(): CryptoKey[] {
    return this.keyManager.getKeysForRotation();
  }

  async evaluatePolicy(context: PolicyContext): Promise<PolicyEvaluationResult> {
    const result = this.policyEngine.evaluate(context);
    if (!result.allowed && this.config.enableMonitoring) {
      this.monitor.recordPolicyViolation(context.principal, `Access to ${context.resource} denied`, { action: context.action, context: context.context });
    }
    return result;
  }

  isUserLockedOut(userId: string): boolean {
    return this.monitor.isUserLockedOut(userId);
  }

  recordFailedAttempt(userId: string): void {
    this.monitor.recordFailedAttempt(userId);
  }

  clearFailedAttempts(userId: string): void {
    this.monitor.clearFailedAttempts(userId);
  }

  getActiveAlerts() {
    return this.monitor.getActiveAlerts();
  }

  acknowledgeAlert(alertId: string): boolean {
    return this.monitor.acknowledgeAlert(alertId);
  }

  getSecurityMetrics() {
    return this.monitor.getMetrics();
  }

  getConfig(): SentinelConfig {
    return this.config;
  }
}
