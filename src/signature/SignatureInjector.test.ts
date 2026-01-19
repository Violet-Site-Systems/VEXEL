import { SignatureInjector } from './SignatureInjector';
import { WalletManager } from '../wallet/WalletManager';
import { ethers } from 'ethers';
import * as path from 'path';
import * as fs from 'fs';

describe('SignatureInjector', () => {
  const testWalletDir = path.join(__dirname, '../../../test-wallets-sig');
  let walletManager: WalletManager;
  let signatureInjector: SignatureInjector;
  const testAgentId = 'sig-test-agent';

  beforeAll(async () => {
    walletManager = new WalletManager({
      network: 'polygon-mumbai',
      walletDir: testWalletDir
    });
    
    signatureInjector = new SignatureInjector(walletManager);
    await walletManager.createWallet(testAgentId);
  });

  afterAll(() => {
    if (fs.existsSync(testWalletDir)) {
      fs.rmSync(testWalletDir, { recursive: true, force: true });
    }
  });

  describe('signMessage', () => {
    it('should sign a message', async () => {
      const message = 'Hello, VEXEL!';
      const signatureData = await signatureInjector.signMessage(testAgentId, message);
      
      expect(signatureData).toBeDefined();
      expect(signatureData.message).toBe(message);
      expect(signatureData.signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
      expect(signatureData.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(signatureData.timestamp).toBeGreaterThan(0);
    });

    it('should produce different signatures for different messages', async () => {
      const message1 = 'Message 1';
      const message2 = 'Message 2';
      
      const sig1 = await signatureInjector.signMessage(testAgentId, message1);
      const sig2 = await signatureInjector.signMessage(testAgentId, message2);
      
      expect(sig1.signature).not.toBe(sig2.signature);
    });
  });

  describe('verifySignature', () => {
    it('should verify a valid signature', async () => {
      const message = 'Test verification';
      const signatureData = await signatureInjector.signMessage(testAgentId, message);
      
      const isValid = signatureInjector.verifySignature(
        message,
        signatureData.signature,
        signatureData.address
      );
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', async () => {
      const message = 'Test message';
      const signatureData = await signatureInjector.signMessage(testAgentId, message);
      
      const isValid = signatureInjector.verifySignature(
        'Different message',
        signatureData.signature,
        signatureData.address
      );
      
      expect(isValid).toBe(false);
    });

    it('should reject signature from wrong address', async () => {
      const message = 'Test message';
      const signatureData = await signatureInjector.signMessage(testAgentId, message);
      
      const isValid = signatureInjector.verifySignature(
        message,
        signatureData.signature,
        '0x0000000000000000000000000000000000000000'
      );
      
      expect(isValid).toBe(false);
    });
  });

  describe('signTransaction', () => {
    it('should sign a transaction', async () => {
      const transaction = {
        to: '0x0000000000000000000000000000000000000000',
        value: '0.1',
        gasLimit: '21000'
      };
      
      const signedTx = await signatureInjector.signTransaction(testAgentId, transaction);
      
      expect(signedTx).toBeDefined();
      expect(signedTx).toMatch(/^0x/);
    });

    it('should sign transaction with data', async () => {
      const transaction = {
        to: '0x0000000000000000000000000000000000000000',
        data: '0x1234',
        gasLimit: '50000'
      };
      
      const signedTx = await signatureInjector.signTransaction(testAgentId, transaction);
      
      expect(signedTx).toBeDefined();
    });
  });

  describe('signDIDDocument', () => {
    it('should sign a DID document', async () => {
      const didDocument = {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: 'did:vexel:test',
        verificationMethod: []
      };
      
      const signatureData = await signatureInjector.signDIDDocument(testAgentId, didDocument);
      
      expect(signatureData).toBeDefined();
      expect(signatureData.message).toBe(JSON.stringify(didDocument));
      expect(signatureData.signature).toMatch(/^0x/);
    });
  });

  describe('injectSignature', () => {
    it('should inject signature into payload', async () => {
      const payload = {
        action: 'test',
        data: 'some data'
      };
      
      const authenticatedPayload = await signatureInjector.injectSignature(testAgentId, payload);
      
      expect(authenticatedPayload).toBeDefined();
      expect(authenticatedPayload.action).toBe(payload.action);
      expect(authenticatedPayload.data).toBe(payload.data);
      expect(authenticatedPayload.signature).toBeDefined();
      expect(authenticatedPayload.signer).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(authenticatedPayload.timestamp).toBeGreaterThan(0);
    });

    it('should inject signature into string payload', async () => {
      const payload = 'Simple string payload';
      
      const authenticatedPayload = await signatureInjector.injectSignature(testAgentId, payload);
      
      expect(authenticatedPayload.signature).toBeDefined();
      expect(authenticatedPayload.signer).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe('signTypedData', () => {
    it('should sign typed data (EIP-712)', async () => {
      const domain = {
        name: 'VEXEL',
        version: '1',
        chainId: 80001,
        verifyingContract: '0x0000000000000000000000000000000000000000'
      };

      const types = {
        Badge: [
          { name: 'recipient', type: 'address' },
          { name: 'badgeType', type: 'string' }
        ]
      };

      const value = {
        recipient: '0x0000000000000000000000000000000000000000',
        badgeType: 'VERIFIED_HUMAN'
      };

      const signature = await signatureInjector.signTypedData(testAgentId, domain, types, value);
      
      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
    });
  });
});
