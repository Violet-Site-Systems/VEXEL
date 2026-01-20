/**
 * Authentication routes
 */

import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../middleware/auth';
import { APIResponse, JWTPayload, AuthRequest } from '../types';

export function createAuthRoutes(authMiddleware: AuthMiddleware): Router {
  const router = Router();

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Authenticate user and get JWT token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - role
   *             properties:
   *               userId:
   *                 type: string
   *               agentId:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [human, agent, admin]
   *               did:
   *                 type: string
   *     responses:
   *       200:
   *         description: Authentication successful
   *       400:
   *         description: Invalid request
   */
  router.post('/login', (req: Request, res: Response) => {
    try {
      const { userId, agentId, role, did } = req.body;

      if (!userId || !role) {
        const response: APIResponse = {
          success: false,
          error: 'userId and role are required',
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      if (!['human', 'agent', 'admin'].includes(role)) {
        const response: APIResponse = {
          success: false,
          error: 'Invalid role. Must be human, agent, or admin',
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const payload: JWTPayload = {
        userId,
        agentId,
        role,
        did,
      };

      const token = authMiddleware.generateToken(payload);

      const response: APIResponse = {
        success: true,
        data: {
          token,
          expiresIn: '24h',
          user: payload,
        },
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      const response: APIResponse = {
        success: false,
        error: 'Authentication failed',
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  });

  /**
   * @swagger
   * /api/auth/verify:
   *   get:
   *     summary: Verify JWT token
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token is valid
   *       401:
   *         description: Invalid token
   */
  router.get('/verify', authMiddleware.authenticate(), (req: AuthRequest, res: Response) => {
    const response: APIResponse = {
      success: true,
      data: {
        valid: true,
        user: req.user,
      },
      timestamp: new Date(),
    };
    res.json(response);
  });

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     summary: Refresh JWT token
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *       401:
   *         description: Invalid token
   */
  router.post('/refresh', authMiddleware.authenticate(), (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        const response: APIResponse = {
          success: false,
          error: 'User not authenticated',
          timestamp: new Date(),
        };
        return res.status(401).json(response);
      }

      const newToken = authMiddleware.generateToken(req.user);

      const response: APIResponse = {
        success: true,
        data: {
          token: newToken,
          expiresIn: '24h',
        },
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      const response: APIResponse = {
        success: false,
        error: 'Token refresh failed',
        timestamp: new Date(),
      };
      res.status(500).json(response);
    }
  });

  return router;
}
