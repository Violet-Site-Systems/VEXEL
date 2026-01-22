// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { ethers } from 'ethers';
import { WalletManager } from '../wallet/WalletManager';
import { BadgeMinter } from '../badge/BadgeMinter';
import { KYCService } from './KYCService';
import { 
  KYCProvider, 
  KYCVerificationRequest, 
  HumanAttestationToken,
  TokenValidationResult,
  HAAPFlowResult
} from './types';

/**
 * HAAP Protocol Configuration
 */
export interface HAAPConfig {
  walletManager: WalletManager;
  badgeMinter: BadgeMinter;
  kycService?: KYCService;
  tokenExpiryDays?: number;
}

/**
 * Human Attestation and Authentication Protocol (HAAP)
 * Implements the complete flow: KYC → DID → Badge → Attestation Token
 */
export class HAAPProtocol {
  private walletManager: WalletManager;
  private badgeMinter: BadgeMinter;
  private kycService: KYCService;
  private tokenExpiryDays: number;
  private tokens: Map<string, HumanAttestationToken> = new Map();

  constructor(config: HAAPConfig) {
    this.walletManager = config.walletManager;
    this.badgeMinter = config.badgeMinter;
    this.kycService = config.kycService || new KYCService();
    this.tokenExpiryDays = config.tokenExpiryDays || 365; // Default 1 year
  }

  /**
   * Execute complete HAAP flow: KYC → DID → Badge → Token
   */
  async executeHAAPFlow(
    userId: string,
    email: string,
    provider: KYCProvider = KYCProvider.MOCK,
    metadata?: Record<string, any>
  ): Promise<HAAPFlowResult> {
    // Step 1: KYC Verification
    const kycRequest: KYCVerificationRequest = {
      userId,
      email,
      provider,
      metadata
    };

    const kycVerification = await this.kycService.initiateVerification(kycRequest);

    if (kycVerification.status !== 'APPROVED') {
      throw new Error(`KYC verification failed with status: ${kycVerification.status}`);
    }

    // Step 2: Create Wallet and DID
    const agentId = `human_${userId}`;
    const wallet = await this.walletManager.createWallet(agentId);
    const did = `did:vexel:${wallet.address}`;

    // Step 3: Mint VERIFIED_HUMAN Badge
    const badge = await this.badgeMinter.mintVerifiedHumanBadge(agentId, {
      name: 'HAAP Verified Human Badge',
      description: 'This badge certifies human identity via HAAP protocol',
      attributes: [
        { trait_type: 'Verification Type', value: 'HAAP' },
        { trait_type: 'KYC Provider', value: provider },
        { trait_type: 'User ID', value: userId },
        { trait_type: 'Verified At', value: new Date().toISOString() }
      ]
    });

    // Step 4: Mint Human Attestation Token
    const attestationToken = await this.mintAttestationToken(
      userId,
      did,
      kycVerification.id,
      badge.tokenId
    );

    return {
      success: true,
      userId,
      did,
      kycVerification,
      badge: {
        tokenId: badge.tokenId,
        transactionHash: badge.transactionHash
      },
      attestationToken
    };
  }

  /**
   * Mint human attestation token
   */
  private async mintAttestationToken(
    userId: string,
    did: string,
    kycVerificationId: string,
    badgeTokenId: string
  ): Promise<HumanAttestationToken> {
    const tokenId = `haap_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + this.tokenExpiryDays * 24 * 60 * 60 * 1000);

    // Create token payload
    const payload = {
      tokenId,
      did,
      userId,
      kycVerificationId,
      badgeTokenId,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    // Sign the token
    const agentId = `human_${userId}`;
    const wallet = await this.walletManager.loadWallet(agentId);
    const payloadString = JSON.stringify(payload);
    const signature = await wallet.signMessage(payloadString);

    const token: HumanAttestationToken = {
      tokenId,
      did,
      userId,
      kycVerificationId,
      badgeTokenId,
      issuedAt,
      expiresAt,
      signature
    };

    // Store token
    this.tokens.set(tokenId, token);
    this.tokens.set(userId, token); // Also index by userId

    return token;
  }

  /**
   * Validate a human attestation token
   */
  async validateToken(tokenId: string): Promise<TokenValidationResult> {
    const token = this.tokens.get(tokenId);

    if (!token) {
      return {
        valid: false,
        reason: 'Token not found'
      };
    }

    // Check expiration
    if (token.expiresAt && new Date() > token.expiresAt) {
      return {
        valid: false,
        token,
        reason: 'Token expired'
      };
    }

    // Verify signature
    const payload = {
      tokenId: token.tokenId,
      did: token.did,
      userId: token.userId,
      kycVerificationId: token.kycVerificationId,
      badgeTokenId: token.badgeTokenId,
      issuedAt: token.issuedAt.toISOString(),
      expiresAt: token.expiresAt?.toISOString()
    };

    const payloadString = JSON.stringify(payload);
    
    try {
      const recoveredAddress = ethers.verifyMessage(payloadString, token.signature);
      const expectedAddress = token.did.replace('did:vexel:', '');

      if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
        return {
          valid: false,
          token,
          reason: 'Invalid signature'
        };
      }
    } catch (error) {
      return {
        valid: false,
        token,
        reason: `Signature verification failed: ${error}`
      };
    }

    // Check KYC verification status
    const kycStatus = await this.kycService.checkVerificationStatus(token.kycVerificationId);
    if (kycStatus !== 'APPROVED') {
      return {
        valid: false,
        token,
        reason: `KYC verification not approved: ${kycStatus}`
      };
    }

    return {
      valid: true,
      token
    };
  }

  /**
   * Get token by ID or userId
   */
  getToken(idOrUserId: string): HumanAttestationToken | undefined {
    return this.tokens.get(idOrUserId);
  }

  /**
   * Check if user has valid attestation
   */
  async hasValidAttestation(userId: string): Promise<boolean> {
    const token = this.tokens.get(userId);
    if (!token) {
      return false;
    }

    const validation = await this.validateToken(token.tokenId);
    return validation.valid;
  }

  /**
   * Get DID for user
   */
  getDIDForUser(userId: string): string | undefined {
    const token = this.tokens.get(userId);
    return token?.did;
  }

  /**
   * Get KYC service
   */
  getKYCService(): KYCService {
    return this.kycService;
  }
}
