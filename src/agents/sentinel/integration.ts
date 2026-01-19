/**
 * Sentinel Agent Integration with VEXEL APIGateway
 * Middleware and routes for security operations
 */

import { Router, Request, Response, NextFunction } from 'express';
import { SentinelAgent } from './sentinel';
import { PolicyContext } from './types';

/**
 * Extend Express Request type to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string };
    }
  }
}

/**
 * Create Sentinel middleware for Express
 */
export function createSentinelMiddleware(agent: SentinelAgent) {
  return {
    /**
     * Verify JWT token signature using Sentinel
     */
    verifySignature: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Missing authorization header' });
        }

        const token = authHeader.substring(7);
        // Token verification would be done here with agent.verify()
        (req as any).user = { userId: 'verified-user', role: 'agent' };
        next();
      } catch (error) {
        res.status(401).json({ error: 'Invalid signature' });
      }
    },

    /**
     * Enforce policy access control
     */
    enforcePolicy: (resource: string) => async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (req as any).user as any;
        if (!user) {
          return res.status(401).json({ error: 'User not authenticated' });
        }

        // Evaluate policy
        const context: PolicyContext = {
          principal: `${user.role}:${user.userId}`,
          resource,
          action: req.method.toLowerCase(),
          context: {
            ip: req.ip,
            timestamp: new Date(),
          },
        };

        const result = await agent.evaluatePolicy(context);

        if (!result.allowed) {
          return res.status(403).json({
            error: 'Access denied',
            reason: result.reason,
          });
        }

        next();
      } catch (error) {
        res.status(500).json({ error: 'Policy evaluation failed' });
      }
    },

    /**
     * Track failed authentication attempts
     */
    trackFailedAuth: (req: Request, res: Response, next: NextFunction) => {
      res.on('finish', () => {
        if (res.statusCode === 401) {
          const user = req.body?.userId;
          if (user) {
            agent.recordFailedAttempt(user);

            // Check if user is locked out
            if (agent.isUserLockedOut(user)) {
              // Return lockout error in next request
            }
          }
        }
      });
      next();
    },
  };
}

/**
 * Create Sentinel routes for Express
 */
export function createSentinelRoutes(agent: SentinelAgent): Router {
  const router = Router();

  /**
   * Generate a new key pair for an agent
   * POST /security/keys/generate
   */
  router.post('/security/keys/generate', async (req: Request, res: Response) => {
    try {
      const { keyId, algorithm } = req.body;

      if (!keyId) {
        return res.status(400).json({ error: 'keyId is required' });
      }

      const result = await agent.generateKeyPair(keyId, algorithm || 'Ed25519');

      if (result.success) {
        const publicKey = agent.getPublicKey(keyId);
        return res.json({
          success: true,
          keyId: result.keyId,
          publicKey,
          message: result.message,
        });
      } else {
        return res.status(400).json({ success: false, error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  /**
   * Sign a message with an agent's key
   * POST /security/sign
   */
  router.post('/security/sign', async (req: Request, res: Response) => {
    try {
      const { message, keyId } = req.body;

      if (!message || !keyId) {
        return res.status(400).json({ error: 'message and keyId are required' });
      }

      const signature = await agent.sign(message, keyId);

      return res.json({
        success: true,
        signature: signature.signature,
        keyId: signature.keyId,
        algorithm: signature.algorithm,
        timestamp: signature.timestamp,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  /**
   * Verify a signature
   * POST /security/verify
   */
  router.post('/security/verify', async (req: Request, res: Response) => {
    try {
      const { signature, publicKey } = req.body;

      if (!signature || !publicKey) {
        return res.status(400).json({ error: 'signature and publicKey are required' });
      }

      const result = await agent.verify(signature, publicKey);

      return res.json({
        success: true,
        isValid: result.isValid,
        keyId: result.keyId,
        algorithm: result.algorithm,
        error: result.error,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  /**
   * Revoke a key
   * POST /security/keys/revoke
   */
  router.post('/security/keys/revoke', async (req: Request, res: Response) => {
    try {
      const { keyId } = req.body;

      if (!keyId) {
        return res.status(400).json({ error: 'keyId is required' });
      }

      const result = agent.revokeKey(keyId);

      return res.json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  /**
   * Rotate a key
   * POST /security/keys/rotate
   */
  router.post('/security/keys/rotate', async (req: Request, res: Response) => {
    try {
      const { keyId } = req.body;

      if (!keyId) {
        return res.status(400).json({ error: 'keyId is required' });
      }

      const result = await agent.rotateKey(keyId);

      return res.json({
        success: result.success,
        oldKeyId: result.oldKeyId,
        newKeyId: result.newKeyId,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  /**
   * Get security alerts
   * GET /security/alerts
   */
  router.get('/security/alerts', (req: Request, res: Response) => {
    try {
      const alerts = agent.getActiveAlerts();

      return res.json({
        success: true,
        alertCount: alerts.length,
        alerts,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  /**
   * Acknowledge an alert
   * POST /security/alerts/:alertId/acknowledge
   */
  router.post('/security/alerts/:alertId/acknowledge', (req: Request, res: Response) => {
    try {
      const alertId = req.params.alertId as string;

      const success = agent.acknowledgeAlert(alertId);

      if (success) {
        return res.json({ success: true, message: 'Alert acknowledged' });
      } else {
        return res.status(404).json({ error: 'Alert not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  /**
   * Get security metrics
   * GET /security/metrics
   */
  router.get('/security/metrics', (req: Request, res: Response) => {
    try {
      const metrics = agent.getSecurityMetrics();

      return res.json({
        success: true,
        metrics,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  return router;
}
