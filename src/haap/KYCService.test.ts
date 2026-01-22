// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { KYCService, MockKYCProvider } from './KYCService';
import { KYCProvider, KYCStatus } from './types';

describe('KYCService', () => {
  let kycService: KYCService;

  beforeEach(() => {
    kycService = new KYCService();
  });

  describe('initiateVerification', () => {
    it('should successfully verify a user', async () => {
      const request = {
        userId: 'user123',
        email: 'user@example.com',
        provider: KYCProvider.MOCK
      };

      const result = await kycService.initiateVerification(request);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.userId).toBe('user123');
      expect(result.status).toBe(KYCStatus.APPROVED);
      expect(result.provider).toBe(KYCProvider.MOCK);
      expect(result.verificationId).toBeDefined();
      expect(result.verifiedAt).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it('should reject verification when configured', async () => {
      const request = {
        userId: 'user456',
        email: 'user@example.com',
        provider: KYCProvider.MOCK,
        metadata: {
          shouldReject: true
        }
      };

      const result = await kycService.initiateVerification(request);

      expect(result.status).toBe(KYCStatus.REJECTED);
      expect(result.verifiedAt).toBeUndefined();
    });

    it('should store verification result', async () => {
      const request = {
        userId: 'user789',
        email: 'user@example.com',
        provider: KYCProvider.MOCK
      };

      const result = await kycService.initiateVerification(request);
      const stored = kycService.getVerification(result.id);

      expect(stored).toBeDefined();
      expect(stored?.id).toBe(result.id);
    });
  });

  describe('checkVerificationStatus', () => {
    it('should return status for existing verification', async () => {
      const request = {
        userId: 'user123',
        email: 'user@example.com',
        provider: KYCProvider.MOCK
      };

      const result = await kycService.initiateVerification(request);
      const status = await kycService.checkVerificationStatus(result.id);

      expect(status).toBe(KYCStatus.APPROVED);
    });

    it('should check with provider for unknown verification', async () => {
      const status = await kycService.checkVerificationStatus('unknown_id');
      expect(status).toBeDefined();
    });
  });

  describe('getVerification', () => {
    it('should get verification by ID', async () => {
      const request = {
        userId: 'user123',
        email: 'user@example.com',
        provider: KYCProvider.MOCK
      };

      const result = await kycService.initiateVerification(request);
      const verification = kycService.getVerification(result.id);

      expect(verification).toBeDefined();
      expect(verification?.id).toBe(result.id);
    });

    it('should get verification by userId', async () => {
      const request = {
        userId: 'user123',
        email: 'user@example.com',
        provider: KYCProvider.MOCK
      };

      await kycService.initiateVerification(request);
      const verification = kycService.getVerification('user123');

      expect(verification).toBeDefined();
      expect(verification?.userId).toBe('user123');
    });

    it('should return undefined for non-existent verification', () => {
      const verification = kycService.getVerification('non-existent');
      expect(verification).toBeUndefined();
    });
  });

  describe('isUserVerified', () => {
    it('should return true for verified user', async () => {
      const request = {
        userId: 'user123',
        email: 'user@example.com',
        provider: KYCProvider.MOCK
      };

      await kycService.initiateVerification(request);
      const isVerified = kycService.isUserVerified('user123');

      expect(isVerified).toBe(true);
    });

    it('should return false for non-verified user', () => {
      const isVerified = kycService.isUserVerified('non-existent');
      expect(isVerified).toBe(false);
    });

    it('should return false for rejected user', async () => {
      const request = {
        userId: 'user456',
        email: 'user@example.com',
        provider: KYCProvider.MOCK,
        metadata: {
          shouldReject: true
        }
      };

      await kycService.initiateVerification(request);
      const isVerified = kycService.isUserVerified('user456');

      expect(isVerified).toBe(false);
    });
  });

  describe('setProvider and getProvider', () => {
    it('should set and get custom provider', () => {
      const customProvider = new MockKYCProvider();
      kycService.setProvider(customProvider);
      
      const provider = kycService.getProvider();
      expect(provider).toBe(customProvider);
    });

    it('should use default MockKYCProvider', () => {
      const provider = kycService.getProvider();
      expect(provider).toBeInstanceOf(MockKYCProvider);
      expect(provider.getProviderName()).toBe(KYCProvider.MOCK);
    });
  });
});

describe('MockKYCProvider', () => {
  let provider: MockKYCProvider;

  beforeEach(() => {
    provider = new MockKYCProvider();
  });

  it('should return MOCK as provider name', () => {
    expect(provider.getProviderName()).toBe(KYCProvider.MOCK);
  });

  it('should verify successfully by default', async () => {
    const request = {
      userId: 'user123',
      email: 'user@example.com',
      provider: KYCProvider.MOCK
    };

    const result = await provider.verify(request);

    expect(result.status).toBe(KYCStatus.APPROVED);
    expect(result.verifiedAt).toBeDefined();
  });

  it('should reject when configured', async () => {
    const request = {
      userId: 'user123',
      email: 'user@example.com',
      provider: KYCProvider.MOCK,
      metadata: {
        shouldReject: true
      }
    };

    const result = await provider.verify(request);

    expect(result.status).toBe(KYCStatus.REJECTED);
    expect(result.verifiedAt).toBeUndefined();
  });

  it('should check status', async () => {
    const status = await provider.checkStatus('any_id');
    expect(status).toBe(KYCStatus.APPROVED);
  });
});
