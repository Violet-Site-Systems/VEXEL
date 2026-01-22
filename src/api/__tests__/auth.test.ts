// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Tests for Authentication Middleware
 */

import { Request, Response } from 'express';
import { AuthMiddleware } from '../middleware/auth';
import { JWTPayload, AuthRequest } from '../types';

describe('AuthMiddleware', () => {
  let authMiddleware: AuthMiddleware;
  const testSecret = 'test-secret-key';

  beforeEach(() => {
    authMiddleware = new AuthMiddleware(testSecret);
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        role: 'human',
      };

      const token = authMiddleware.generateToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should include payload data in token', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        agentId: 'agent-456',
        role: 'agent',
        did: 'did:vexel:0x123',
      };

      const token = authMiddleware.generateToken(payload);
      const decoded = authMiddleware.verifyToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.agentId).toBe(payload.agentId);
      expect(decoded?.role).toBe(payload.role);
      expect(decoded?.did).toBe(payload.did);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        role: 'human',
      };

      const token = authMiddleware.generateToken(payload);
      const verified = authMiddleware.verifyToken(token);

      expect(verified).toBeTruthy();
      expect(verified?.userId).toBe(payload.userId);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.jwt.token';
      const verified = authMiddleware.verifyToken(invalidToken);

      expect(verified).toBeNull();
    });

    it('should return null for tampered token', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        role: 'human',
      };

      const token = authMiddleware.generateToken(payload);
      const tamperedToken = token + 'x'; // Tamper with token

      const verified = authMiddleware.verifyToken(tamperedToken);
      expect(verified).toBeNull();
    });
  });

  describe('authenticate middleware', () => {
    it('should allow request with valid token', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        role: 'human',
      };

      const token = authMiddleware.generateToken(payload);
      const middleware = authMiddleware.authenticate();

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as AuthRequest;

      const res = {} as Response;
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(payload.userId);
    });

    it('should reject request without authorization header', () => {
      const middleware = authMiddleware.authenticate();

      const req = {
        headers: {},
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      const middleware = authMiddleware.authenticate();

      const req = {
        headers: {
          authorization: 'Bearer invalid.token',
        },
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('authorize middleware', () => {
    it('should allow user with correct role', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        role: 'admin',
      };

      const req = {
        user: payload,
      } as AuthRequest;

      const res = {} as Response;
      const next = jest.fn();

      const middleware = authMiddleware.authorize(['admin', 'human']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject user with incorrect role', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        role: 'agent',
      };

      const req = {
        user: payload,
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      const middleware = authMiddleware.authorize(['human', 'admin']);
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should reject request without user', () => {
      const req = {} as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      const middleware = authMiddleware.authorize(['human']);
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
