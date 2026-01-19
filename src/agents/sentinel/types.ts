/**
 * Sentinel Agent Type Definitions
 * Guardian of cryptographic operations and security enforcement
 */

/**
 * Supported cryptographic curves
 */
export type CryptoCurve = 'Ed25519' | 'secp256k1' | 'P-256';

/**
 * Key derivation function algorithm
 */
export type KDFAlgorithm = 'PBKDF2' | 'Argon2' | 'scrypt';

/**
 * Signature algorithm type
 */
export type SignatureAlgorithm = 'Ed25519' | 'ECDSA' | 'RSA';

/**
 * Key material for cryptographic operations
 */
export interface CryptoKey {
  id: string;
  algorithm: SignatureAlgorithm;
  curve?: CryptoCurve;
  publicKey: string;
  privateKey?: string; // Only available in secure context
  createdAt: Date;
  expiresAt?: Date;
  isRevoked: boolean;
}

/**
 * Signature result from signing operation
 */
export interface Signature {
  algorithm: SignatureAlgorithm;
  signature: string; // Hex-encoded signature
  message: string; // Original message hash
  timestamp: Date;
  keyId: string;
}

/**
 * Result of signature verification
 */
export interface VerificationResult {
  isValid: boolean;
  keyId: string;
  algorithm: SignatureAlgorithm;
  message: string;
  timestamp: Date;
  error?: string;
}

/**
 * Session token for authenticated operations
 */
export interface SessionToken {
  token: string;
  userId: string;
  role: 'human' | 'agent' | 'service';
  expiresAt: Date;
  permissions: string[];
  isRevoked: boolean;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  isValid: boolean;
  token?: SessionToken;
  error?: string;
}

/**
 * Policy rule for access control
 */
export interface PolicyRule {
  id: string;
  name: string;
  resource: string; // e.g., 'agent:*', 'credential:read'
  action: string; // 'allow' or 'deny'
  principal: string; // User/role identifier
  conditions?: Record<string, any>; // Conditional constraints
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Policy evaluation context
 */
export interface PolicyContext {
  principal: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

/**
 * Policy evaluation result
 */
export interface PolicyEvaluationResult {
  allowed: boolean;
  matchedRules: PolicyRule[];
  reason?: string;
}

/**
 * Security anomaly detection alert
 */
export interface SecurityAlert {
  id: string;
  type: 'unauthorized_access' | 'key_compromise' | 'policy_violation' | 'signature_invalid' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
}

/**
 * Sentinel Agent configuration
 */
export interface SentinelConfig {
  defaultCurve?: CryptoCurve;
  defaultKDF?: KDFAlgorithm;
  keyRotationDays?: number;
  sessionTokenTTL?: number; // in seconds
  maxFailedAttempts?: number;
  lockoutDuration?: number; // in seconds
  enableMonitoring?: boolean;
  alertWebhookUrl?: string;
}

/**
 * Key management operation result
 */
export interface KeyManagementResult {
  success: boolean;
  keyId?: string;
  message: string;
  error?: string;
}

/**
 * Attestation chain for cryptographic proof
 */
export interface AttestationChain {
  id: string;
  chainType: 'signature_chain' | 'credential_chain';
  signatures: Signature[];
  metadata: Record<string, any>;
  createdAt: Date;
  verifiedAt?: Date;
}

/**
 * Key backup/export format
 */
export interface KeyExport {
  keyId: string;
  algorithm: SignatureAlgorithm;
  publicKey: string;
  encryptedPrivateKey: string; // Encrypted with KDF-derived key
  kdfAlgorithm: KDFAlgorithm;
  kdfParams: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Security metric for monitoring
 */
export interface SecurityMetric {
  timestamp: Date;
  alertCount: number;
  failedAuthAttempts: number;
  keyRotationsDue: number;
  revokedKeys: number;
  policyViolations: number;
}
