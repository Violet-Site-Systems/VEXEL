// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { 
  KYCStatus, 
  KYCProvider, 
  KYCVerificationRequest, 
  KYCVerificationResult 
} from './types';

/**
 * Abstract KYC Provider Interface
 */
export interface IKYCProvider {
  verify(request: KYCVerificationRequest): Promise<KYCVerificationResult>;
  checkStatus(verificationId: string): Promise<KYCStatus>;
  getProviderName(): KYCProvider;
}

/**
 * Mock KYC Provider for Testing and Development
 */
export class MockKYCProvider implements IKYCProvider {
  getProviderName(): KYCProvider {
    return KYCProvider.MOCK;
  }

  async verify(request: KYCVerificationRequest): Promise<KYCVerificationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock verification ID
    const verificationId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Simulate approval (can be configured for testing)
    const shouldApprove = !request.metadata?.shouldReject;

    const result: KYCVerificationResult = {
      id: `kyc_${Date.now()}`,
      userId: request.userId,
      status: shouldApprove ? KYCStatus.APPROVED : KYCStatus.REJECTED,
      provider: KYCProvider.MOCK,
      verificationId,
      verifiedAt: shouldApprove ? new Date() : undefined,
      expiresAt: shouldApprove ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined, // 1 year
      metadata: {
        email: request.email,
        mockProvider: true,
        ...request.metadata
      }
    };

    return result;
  }

  async checkStatus(verificationId: string): Promise<KYCStatus> {
    // Mock status check
    await new Promise(resolve => setTimeout(resolve, 50));
    return KYCStatus.APPROVED;
  }
}

/**
 * KYC Service for managing human verification
 */
export class KYCService {
  private provider: IKYCProvider;
  private verifications: Map<string, KYCVerificationResult> = new Map();

  constructor(provider?: IKYCProvider) {
    // Default to mock provider for development
    this.provider = provider || new MockKYCProvider();
  }

  /**
   * Initiate KYC verification for a user
   */
  async initiateVerification(request: KYCVerificationRequest): Promise<KYCVerificationResult> {
    const result = await this.provider.verify(request);
    
    // Store verification result
    this.verifications.set(result.id, result);
    this.verifications.set(result.userId, result); // Also index by userId

    return result;
  }

  /**
   * Check KYC verification status
   */
  async checkVerificationStatus(verificationId: string): Promise<KYCStatus> {
    const verification = this.verifications.get(verificationId);
    
    if (verification) {
      return verification.status;
    }

    // Check with provider
    return await this.provider.checkStatus(verificationId);
  }

  /**
   * Get verification result by ID or userId
   */
  getVerification(idOrUserId: string): KYCVerificationResult | undefined {
    return this.verifications.get(idOrUserId);
  }

  /**
   * Check if user is verified
   */
  isUserVerified(userId: string): boolean {
    const verification = this.verifications.get(userId);
    return verification?.status === KYCStatus.APPROVED;
  }

  /**
   * Set KYC provider
   */
  setProvider(provider: IKYCProvider): void {
    this.provider = provider;
  }

  /**
   * Get current provider
   */
  getProvider(): IKYCProvider {
    return this.provider;
  }
}
