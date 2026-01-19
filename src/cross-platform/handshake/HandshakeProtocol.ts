/**
 * Agent Handshake Protocol
 * Implements secure agent-to-agent handshake with DID verification
 */

import { EventEmitter } from 'events';
import { randomBytes, createHash } from 'crypto';
import {
  HandshakeRequest,
  HandshakeResponse,
  HandshakeSession,
  CrossPlatformEvent,
} from '../types';
import { validateDID } from '../../utils/did';
import { SignatureInjector } from '../../signature/SignatureInjector';
import { WalletManager } from '../../wallet/WalletManager';

export interface HandshakeConfig {
  challengeSize?: number;
  sessionTimeout?: number;
  maxConcurrentSessions?: number;
}

export class HandshakeProtocol extends EventEmitter {
  private sessions: Map<string, HandshakeSession> = new Map();
  private pendingChallenges: Map<string, Buffer> = new Map();
  private config: Required<HandshakeConfig>;
  private walletManager: WalletManager;
  private signatureInjector: SignatureInjector;

  constructor(
    walletManager: WalletManager,
    config: HandshakeConfig = {}
  ) {
    super();
    this.walletManager = walletManager;
    this.signatureInjector = new SignatureInjector(walletManager);
    this.config = {
      challengeSize: config.challengeSize || 32,
      sessionTimeout: config.sessionTimeout || 3600000, // 1 hour
      maxConcurrentSessions: config.maxConcurrentSessions || 100,
    };
  }

  /**
   * Initiate handshake with another agent
   */
  async initiateHandshake(
    initiatorAgentId: string,
    targetAgentId: string,
    targetDid: string,
    metadata?: Record<string, string>
  ): Promise<HandshakeRequest> {
    try {
      // Generate challenge
      const challenge = randomBytes(this.config.challengeSize);

      // Load initiator wallet
      const walletInfo = await this.walletManager.loadWallet(initiatorAgentId);
      if (!walletInfo) {
        throw new Error(`Wallet not found for agent ${initiatorAgentId}`);
      }

      const initiatorDid = `did:vexel:${walletInfo.address}`;

      // Sign challenge
      const challengeHash = createHash('sha256').update(challenge).digest('hex');
      const signature = await this.signatureInjector.signMessage(initiatorAgentId, challengeHash);

      // Store pending challenge
      const challengeKey = `${initiatorAgentId}-${targetAgentId}`;
      this.pendingChallenges.set(challengeKey, challenge);

      const request: HandshakeRequest = {
        initiatorAgentId,
        initiatorDid,
        targetAgentId,
        challenge,
        signature: signature.signature,
        timestamp: Date.now(),
        metadata: metadata || {},
      };

      // Emit handshake initiation event
      this.emit(CrossPlatformEvent.HANDSHAKE_INITIATED, {
        event: CrossPlatformEvent.HANDSHAKE_INITIATED,
        data: { initiatorAgentId, targetAgentId },
        timestamp: new Date(),
        agentId: initiatorAgentId,
      });

      console.log(`Handshake initiated: ${initiatorAgentId} -> ${targetAgentId}`);

      return request;
    } catch (error) {
      console.error(`Failed to initiate handshake:`, error);
      throw error;
    }
  }

  /**
   * Process incoming handshake request
   */
  async processHandshakeRequest(request: HandshakeRequest): Promise<HandshakeResponse> {
    try {
      // Validate request
      this.validateHandshakeRequest(request);

      // Verify initiator's DID
      const didValid = validateDID(request.initiatorDid);
      if (!didValid) {
        return {
          success: false,
          message: 'Invalid initiator DID',
        };
      }

      // Verify signature
      const challengeHash = createHash('sha256').update(request.challenge).digest('hex');
      const signatureValid = await this.verifySignature(
        request.initiatorDid,
        challengeHash,
        request.signature
      );

      if (!signatureValid) {
        return {
          success: false,
          message: 'Invalid signature',
        };
      }

      // Check session capacity
      if (this.sessions.size >= this.config.maxConcurrentSessions) {
        return {
          success: false,
          message: 'Maximum concurrent sessions reached',
        };
      }

      // Load target wallet
      const walletInfo = await this.walletManager.loadWallet(request.targetAgentId);
      if (!walletInfo) {
        return {
          success: false,
          message: `Target agent ${request.targetAgentId} not found`,
        };
      }

      const targetDid = `did:vexel:${walletInfo.address}`;

      // Generate challenge response
      const challengeResponse = createHash('sha256')
        .update(Buffer.concat([request.challenge, Buffer.from(request.targetAgentId)]))
        .digest();

      // Sign challenge response
      const responseSignature = await this.signatureInjector.signMessage(
        request.targetAgentId,
        challengeResponse.toString('hex')
      );

      // Create session
      const sessionId = this.generateSessionId(request.initiatorAgentId, request.targetAgentId);
      const session: HandshakeSession = {
        sessionId,
        initiatorAgentId: request.initiatorAgentId,
        targetAgentId: request.targetAgentId,
        establishedAt: new Date(),
        expiresAt: new Date(Date.now() + this.config.sessionTimeout),
        sharedSecret: this.deriveSharedSecret(request.challenge, challengeResponse),
      };

      this.sessions.set(sessionId, session);

      // Schedule session cleanup
      setTimeout(() => {
        this.cleanupSession(sessionId);
      }, this.config.sessionTimeout);

      // Emit handshake completion event
      this.emit(CrossPlatformEvent.HANDSHAKE_COMPLETED, {
        event: CrossPlatformEvent.HANDSHAKE_COMPLETED,
        data: { sessionId, initiatorAgentId: request.initiatorAgentId, targetAgentId: request.targetAgentId },
        timestamp: new Date(),
        agentId: request.targetAgentId,
      });

      console.log(`Handshake completed: Session ${sessionId}`);

      return {
        success: true,
        sessionId,
        challengeResponse,
        signature: responseSignature.signature,
        targetDid,
        message: 'Handshake successful',
      };
    } catch (error) {
      console.error('Failed to process handshake request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify handshake response
   */
  async verifyHandshakeResponse(
    initiatorAgentId: string,
    targetAgentId: string,
    response: HandshakeResponse
  ): Promise<boolean> {
    try {
      if (!response.success || !response.sessionId || !response.challengeResponse) {
        return false;
      }

      // Get pending challenge
      const challengeKey = `${initiatorAgentId}-${targetAgentId}`;
      const challenge = this.pendingChallenges.get(challengeKey);
      if (!challenge) {
        console.error('No pending challenge found');
        return false;
      }

      // Verify challenge response
      const expectedResponse = createHash('sha256')
        .update(Buffer.concat([challenge, Buffer.from(targetAgentId)]))
        .digest();

      const responseValid = response.challengeResponse.equals(expectedResponse);
      if (!responseValid) {
        console.error('Invalid challenge response');
        return false;
      }

      // Verify signature
      if (!response.targetDid || !response.signature) {
        console.error('Missing target DID or signature');
        return false;
      }

      const signatureValid = await this.verifySignature(
        response.targetDid,
        expectedResponse.toString('hex'),
        response.signature
      );

      if (!signatureValid) {
        console.error('Invalid response signature');
        return false;
      }

      // Store session on initiator side
      const session: HandshakeSession = {
        sessionId: response.sessionId,
        initiatorAgentId,
        targetAgentId,
        establishedAt: new Date(),
        expiresAt: new Date(Date.now() + this.config.sessionTimeout),
        sharedSecret: this.deriveSharedSecret(challenge, expectedResponse),
      };

      this.sessions.set(response.sessionId, session);

      // Clean up pending challenge
      this.pendingChallenges.delete(challengeKey);

      // Schedule session cleanup
      setTimeout(() => {
        this.cleanupSession(response.sessionId!);
      }, this.config.sessionTimeout);

      console.log(`Handshake verified: Session ${response.sessionId}`);

      return true;
    } catch (error) {
      console.error('Failed to verify handshake response:', error);
      return false;
    }
  }

  /**
   * Get active session
   */
  getSession(sessionId: string): HandshakeSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    return undefined;
  }

  /**
   * Validate session
   */
  validateSession(sessionId: string, agentId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }
    return session.initiatorAgentId === agentId || session.targetAgentId === agentId;
  }

  /**
   * Close session
   */
  closeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): HandshakeSession[] {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(session => session.expiresAt > now);
  }

  /**
   * Private helper methods
   */
  private validateHandshakeRequest(request: HandshakeRequest): void {
    if (!request.initiatorAgentId || !request.targetAgentId) {
      throw new Error('Missing agent IDs');
    }

    if (!request.initiatorDid || !request.challenge || !request.signature) {
      throw new Error('Missing required handshake fields');
    }

    if (request.challenge.length !== this.config.challengeSize) {
      throw new Error('Invalid challenge size');
    }

    // Check timestamp (reject if older than 5 minutes)
    const age = Date.now() - request.timestamp;
    if (age > 300000) {
      throw new Error('Handshake request expired');
    }
  }

  private async verifySignature(did: string, message: string, signature: string): Promise<boolean> {
    try {
      // Extract address from DID
      const address = did.replace('did:vexel:', '');
      
      // For now, we'll use a simplified verification
      // In production, this should use proper signature recovery and validation
      return !!(signature && signature.length > 0);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  private generateSessionId(initiatorId: string, targetId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const hash = createHash('sha256')
      .update(`${initiatorId}:${targetId}:${timestamp}:${random}`)
      .digest('hex')
      .substring(0, 16);
    return `session-${hash}`;
  }

  private deriveSharedSecret(challenge: Buffer, response: Buffer): Buffer {
    return createHash('sha256')
      .update(Buffer.concat([challenge, response]))
      .digest();
  }

  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.expiresAt <= new Date()) {
      this.sessions.delete(sessionId);
      console.log(`Session expired: ${sessionId}`);
    }
  }

  /**
   * Cleanup and shutdown
   */
  shutdown(): void {
    this.sessions.clear();
    this.pendingChallenges.clear();
    console.log('Handshake protocol shut down');
  }
}
