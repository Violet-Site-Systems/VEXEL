import { HAAPProtocol } from './HAAPProtocol';
import { KYCService } from './KYCService';
import { WalletManager } from '../wallet/WalletManager';
import { BadgeMinter } from '../badge/BadgeMinter';
import { KYCProvider } from './types';
import * as path from 'path';
import * as fs from 'fs';

describe('HAAPProtocol', () => {
  const testWalletDir = path.join(__dirname, '../../../test-wallets-haap');
  let walletManager: WalletManager;
  let badgeMinter: BadgeMinter;
  let kycService: KYCService;
  let haapProtocol: HAAPProtocol;

  beforeAll(() => {
    walletManager = new WalletManager({
      network: 'polygon-mumbai',
      walletDir: testWalletDir
    });

    badgeMinter = new BadgeMinter(walletManager);
    kycService = new KYCService();

    haapProtocol = new HAAPProtocol({
      walletManager,
      badgeMinter,
      kycService,
      tokenExpiryDays: 365
    });
  });

  afterAll(() => {
    if (fs.existsSync(testWalletDir)) {
      fs.rmSync(testWalletDir, { recursive: true, force: true });
    }
  });

  describe('executeHAAPFlow', () => {
    it('should successfully execute complete HAAP flow', async () => {
      const result = await haapProtocol.executeHAAPFlow(
        'user_001',
        'user001@example.com',
        KYCProvider.MOCK
      );

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_001');
      expect(result.did).toMatch(/^did:vexel:0x[a-fA-F0-9]{40}$/);
      
      // Check KYC verification
      expect(result.kycVerification).toBeDefined();
      expect(result.kycVerification.status).toBe('APPROVED');
      expect(result.kycVerification.userId).toBe('user_001');

      // Check badge
      expect(result.badge).toBeDefined();
      expect(result.badge.tokenId).toBeDefined();
      expect(result.badge.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);

      // Check attestation token
      expect(result.attestationToken).toBeDefined();
      expect(result.attestationToken.tokenId).toMatch(/^haap_/);
      expect(result.attestationToken.did).toBe(result.did);
      expect(result.attestationToken.userId).toBe('user_001');
      expect(result.attestationToken.signature).toBeDefined();
      expect(result.attestationToken.issuedAt).toBeInstanceOf(Date);
      expect(result.attestationToken.expiresAt).toBeInstanceOf(Date);
    }, 30000);

    it('should fail HAAP flow if KYC is rejected', async () => {
      await expect(
        haapProtocol.executeHAAPFlow(
          'user_rejected', 
          'rejected@example.com',
          KYCProvider.MOCK,
          { shouldReject: true }
        )
      ).rejects.toThrow('KYC verification failed');
    });

    it('should create unique DIDs for different users', async () => {
      const result1 = await haapProtocol.executeHAAPFlow(
        'user_002',
        'user002@example.com'
      );

      const result2 = await haapProtocol.executeHAAPFlow(
        'user_003',
        'user003@example.com'
      );

      expect(result1.did).not.toBe(result2.did);
      expect(result1.attestationToken.tokenId).not.toBe(result2.attestationToken.tokenId);
    }, 30000);
  });

  describe('validateToken', () => {
    let tokenId: string;

    beforeAll(async () => {
      const result = await haapProtocol.executeHAAPFlow(
        'user_validate',
        'validate@example.com'
      );
      tokenId = result.attestationToken.tokenId;
    }, 30000);

    it('should validate a valid token', async () => {
      const validation = await haapProtocol.validateToken(tokenId);

      expect(validation.valid).toBe(true);
      expect(validation.token).toBeDefined();
      expect(validation.reason).toBeUndefined();
    });

    it('should reject non-existent token', async () => {
      const validation = await haapProtocol.validateToken('non_existent_token');

      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('Token not found');
    });

    it('should reject expired token', async () => {
      // Create a protocol that mints already-expired tokens
      const expiredProtocol = new HAAPProtocol({
        walletManager,
        badgeMinter,
        kycService,
        tokenExpiryDays: -1 // Negative means already expired
      });

      const result = await expiredProtocol.executeHAAPFlow(
        'user_expired',
        'expired@example.com'
      );

      const validation = await expiredProtocol.validateToken(
        result.attestationToken.tokenId
      );

      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('Token expired');
    }, 30000);
  });

  describe('getToken', () => {
    it('should retrieve token by tokenId', async () => {
      const result = await haapProtocol.executeHAAPFlow(
        'user_get_token',
        'gettoken@example.com'
      );

      const token = haapProtocol.getToken(result.attestationToken.tokenId);

      expect(token).toBeDefined();
      expect(token?.tokenId).toBe(result.attestationToken.tokenId);
    }, 30000);

    it('should retrieve token by userId', async () => {
      const result = await haapProtocol.executeHAAPFlow(
        'user_get_by_id',
        'getbyid@example.com'
      );

      const token = haapProtocol.getToken('user_get_by_id');

      expect(token).toBeDefined();
      expect(token?.userId).toBe('user_get_by_id');
    }, 30000);

    it('should return undefined for non-existent token', () => {
      const token = haapProtocol.getToken('non_existent');
      expect(token).toBeUndefined();
    });
  });

  describe('hasValidAttestation', () => {
    it('should return true for user with valid attestation', async () => {
      await haapProtocol.executeHAAPFlow(
        'user_valid_attestation',
        'validatt@example.com'
      );

      const hasValid = await haapProtocol.hasValidAttestation('user_valid_attestation');

      expect(hasValid).toBe(true);
    }, 30000);

    it('should return false for user without attestation', async () => {
      const hasValid = await haapProtocol.hasValidAttestation('user_no_attestation');

      expect(hasValid).toBe(false);
    });
  });

  describe('getDIDForUser', () => {
    it('should return DID for user with attestation', async () => {
      const result = await haapProtocol.executeHAAPFlow(
        'user_get_did',
        'getdid@example.com'
      );

      const did = haapProtocol.getDIDForUser('user_get_did');

      expect(did).toBeDefined();
      expect(did).toBe(result.did);
    }, 30000);

    it('should return undefined for user without attestation', () => {
      const did = haapProtocol.getDIDForUser('user_no_did');
      expect(did).toBeUndefined();
    });
  });

  describe('getKYCService', () => {
    it('should return KYC service instance', () => {
      const service = haapProtocol.getKYCService();
      expect(service).toBeInstanceOf(KYCService);
    });
  });
});
