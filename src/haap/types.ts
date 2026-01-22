// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Type definitions for HAAP Protocol
 * Human Attestation and Authentication Protocol
 */

/**
 * KYC Verification Status
 */
export enum KYCStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

/**
 * KYC Provider Types
 */
export enum KYCProvider {
  PERSONA = 'PERSONA',
  ONFIDO = 'ONFIDO',
  VERIFF = 'VERIFF',
  MOCK = 'MOCK', // For testing
}

/**
 * KYC Verification Request
 */
export interface KYCVerificationRequest {
  userId: string;
  email: string;
  provider: KYCProvider;
  metadata?: Record<string, any>;
}

/**
 * KYC Verification Result
 */
export interface KYCVerificationResult {
  id: string;
  userId: string;
  status: KYCStatus;
  provider: KYCProvider;
  verificationId: string;
  verifiedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Human Attestation Token
 */
export interface HumanAttestationToken {
  tokenId: string;
  did: string;
  userId: string;
  kycVerificationId: string;
  badgeTokenId: string;
  issuedAt: Date;
  expiresAt?: Date;
  signature: string;
}

/**
 * Token Validation Result
 */
export interface TokenValidationResult {
  valid: boolean;
  token?: HumanAttestationToken;
  reason?: string;
}

/**
 * HAAP Flow Result
 */
export interface HAAPFlowResult {
  success: boolean;
  userId: string;
  did: string;
  kycVerification: KYCVerificationResult;
  badge: {
    tokenId: string;
    transactionHash: string;
  };
  attestationToken: HumanAttestationToken;
}
