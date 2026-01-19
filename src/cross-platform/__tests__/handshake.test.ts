/**
 * Tests for Handshake Protocol
 */

import { HandshakeProtocol } from '../handshake/HandshakeProtocol';
import { WalletManager } from '../../wallet/WalletManager';
import { CrossPlatformEvent } from '../types';
import { tmpdir } from 'os';
import { join } from 'path';

describe('HandshakeProtocol', () => {
  let handshakeProtocol: HandshakeProtocol;
  let walletManager: WalletManager;
  const testWalletDir = join(tmpdir(), 'vexel-test-wallets-handshake');

  beforeAll(async () => {
    walletManager = new WalletManager({
      walletDir: testWalletDir,
      network: 'polygon-mumbai',
    });

    // Create test wallets
    await walletManager.createWallet('agent-initiator');
    await walletManager.createWallet('agent-target');
  });

  beforeEach(() => {
    handshakeProtocol = new HandshakeProtocol(walletManager, {
      challengeSize: 32,
      sessionTimeout: 3600000,
    });
  });

  afterEach(() => {
    handshakeProtocol.shutdown();
  });

  describe('initiateHandshake', () => {
    it('should create handshake request', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123',
        { purpose: 'collaboration' }
      );

      expect(request.initiatorAgentId).toBe('agent-initiator');
      expect(request.targetAgentId).toBe('agent-target');
      expect(request.challenge).toBeDefined();
      expect(request.challenge.length).toBe(32);
      expect(request.signature).toBeDefined();
      expect(request.metadata?.purpose).toBe('collaboration');
    });

    it('should emit handshake initiation event', (done) => {
      handshakeProtocol.on(CrossPlatformEvent.HANDSHAKE_INITIATED, (data) => {
        expect(data.event).toBe(CrossPlatformEvent.HANDSHAKE_INITIATED);
        expect(data.data.initiatorAgentId).toBe('agent-initiator');
        expect(data.data.targetAgentId).toBe('agent-target');
        done();
      });

      handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );
    });

    it('should fail with non-existent wallet', async () => {
      await expect(
        handshakeProtocol.initiateHandshake(
          'non-existent-agent',
          'agent-target',
          'did:vexel:0x123'
        )
      ).rejects.toThrow('Wallet not found');
    });
  });

  describe('processHandshakeRequest', () => {
    it('should process valid handshake request', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      const response = await handshakeProtocol.processHandshakeRequest(request);

      expect(response.success).toBe(true);
      expect(response.sessionId).toBeDefined();
      expect(response.challengeResponse).toBeDefined();
      expect(response.signature).toBeDefined();
      expect(response.targetDid).toBeDefined();
    });

    it('should emit handshake completion event', (done) => {
      handshakeProtocol.on(CrossPlatformEvent.HANDSHAKE_COMPLETED, (data) => {
        expect(data.event).toBe(CrossPlatformEvent.HANDSHAKE_COMPLETED);
        expect(data.data.sessionId).toBeDefined();
        done();
      });

      handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      ).then(request => {
        handshakeProtocol.processHandshakeRequest(request);
      });
    });

    it('should reject expired handshake request', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      // Modify timestamp to be old
      request.timestamp = Date.now() - 400000; // 6+ minutes ago

      const response = await handshakeProtocol.processHandshakeRequest(request);

      expect(response.success).toBe(false);
      expect(response.message).toContain('expired');
    });

    it('should reject request with invalid challenge size', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      // Modify challenge size
      request.challenge = Buffer.alloc(16); // Wrong size

      const response = await handshakeProtocol.processHandshakeRequest(request);

      expect(response.success).toBe(false);
      expect(response.message).toContain('challenge size');
    });

    it('should reject request with invalid DID', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      // Use invalid DID format
      request.initiatorDid = 'invalid-did-format';

      const response = await handshakeProtocol.processHandshakeRequest(request);

      expect(response.success).toBe(false);
      expect(response.message).toContain('Invalid initiator DID');
    });

    it('should reject request for non-existent target', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'non-existent-target',
        'did:vexel:0x123'
      );

      const response = await handshakeProtocol.processHandshakeRequest(request);

      expect(response.success).toBe(false);
      expect(response.message).toContain('not found');
    });
  });

  describe('verifyHandshakeResponse', () => {
    it('should verify valid handshake response', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      const response = await handshakeProtocol.processHandshakeRequest(request);

      const verified = await handshakeProtocol.verifyHandshakeResponse(
        'agent-initiator',
        'agent-target',
        response
      );

      expect(verified).toBe(true);
    });

    it('should reject response with invalid challenge', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      const response = await handshakeProtocol.processHandshakeRequest(request);

      // Modify challenge response
      response.challengeResponse = Buffer.alloc(32);

      const verified = await handshakeProtocol.verifyHandshakeResponse(
        'agent-initiator',
        'agent-target',
        response
      );

      expect(verified).toBe(false);
    });

    it('should reject response without pending challenge', async () => {
      const response = {
        success: true,
        sessionId: 'test-session',
        challengeResponse: Buffer.alloc(32),
        signature: 'test-sig',
        targetDid: 'did:vexel:0x123',
      };

      const verified = await handshakeProtocol.verifyHandshakeResponse(
        'agent-initiator',
        'agent-target',
        response
      );

      expect(verified).toBe(false);
    });
  });

  describe('getSession', () => {
    it('should return active session', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      const response = await handshakeProtocol.processHandshakeRequest(request);

      const session = handshakeProtocol.getSession(response.sessionId!);

      expect(session).toBeDefined();
      expect(session?.sessionId).toBe(response.sessionId);
      expect(session?.initiatorAgentId).toBe('agent-initiator');
      expect(session?.targetAgentId).toBe('agent-target');
    });

    it('should return undefined for non-existent session', () => {
      const session = handshakeProtocol.getSession('non-existent-session');
      expect(session).toBeUndefined();
    });

    it('should return undefined for expired session', async () => {
      // Create handshake protocol with short timeout
      const shortTimeoutProtocol = new HandshakeProtocol(walletManager, {
        sessionTimeout: 100, // 100ms
      });

      const request = await shortTimeoutProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      const response = await shortTimeoutProtocol.processHandshakeRequest(request);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      const session = shortTimeoutProtocol.getSession(response.sessionId!);

      expect(session).toBeUndefined();

      shortTimeoutProtocol.shutdown();
    });
  });

  describe('validateSession', () => {
    it('should validate session for initiator', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      const response = await handshakeProtocol.processHandshakeRequest(request);

      const valid = handshakeProtocol.validateSession(response.sessionId!, 'agent-initiator');

      expect(valid).toBe(true);
    });

    it('should validate session for target', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      const response = await handshakeProtocol.processHandshakeRequest(request);

      const valid = handshakeProtocol.validateSession(response.sessionId!, 'agent-target');

      expect(valid).toBe(true);
    });

    it('should reject session for non-participant', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      const response = await handshakeProtocol.processHandshakeRequest(request);

      const valid = handshakeProtocol.validateSession(response.sessionId!, 'other-agent');

      expect(valid).toBe(false);
    });

    it('should reject invalid session ID', () => {
      const valid = handshakeProtocol.validateSession('invalid-session', 'agent-initiator');
      expect(valid).toBe(false);
    });
  });

  describe('closeSession', () => {
    it('should close active session', async () => {
      const request = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );

      const response = await handshakeProtocol.processHandshakeRequest(request);

      const closed = handshakeProtocol.closeSession(response.sessionId!);

      expect(closed).toBe(true);
      expect(handshakeProtocol.getSession(response.sessionId!)).toBeUndefined();
    });

    it('should return false for non-existent session', () => {
      const closed = handshakeProtocol.closeSession('non-existent-session');
      expect(closed).toBe(false);
    });
  });

  describe('getActiveSessions', () => {
    it('should return all active sessions', async () => {
      await walletManager.createWallet('agent-target-2');

      const request1 = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );
      await handshakeProtocol.processHandshakeRequest(request1);

      const request2 = await handshakeProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target-2',
        'did:vexel:0x456'
      );
      await handshakeProtocol.processHandshakeRequest(request2);

      const sessions = handshakeProtocol.getActiveSessions();

      expect(sessions.length).toBeGreaterThanOrEqual(2);
    });

    it('should not include expired sessions', async () => {
      const shortTimeoutProtocol = new HandshakeProtocol(walletManager, {
        sessionTimeout: 100,
      });

      const request = await shortTimeoutProtocol.initiateHandshake(
        'agent-initiator',
        'agent-target',
        'did:vexel:0x123'
      );
      await shortTimeoutProtocol.processHandshakeRequest(request);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      const sessions = shortTimeoutProtocol.getActiveSessions();

      expect(sessions.length).toBe(0);

      shortTimeoutProtocol.shutdown();
    });
  });
});
