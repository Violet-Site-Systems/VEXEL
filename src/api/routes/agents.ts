/**
 * Agent management routes
 */

import { Router, Response } from 'express';
import { AuthMiddleware } from '../middleware/auth';
import { ActionVerificationMiddleware } from '../middleware/actionVerification';
import { APIResponse, ActionType, AuthRequest } from '../types';
import { RuntimeStatus } from '../../types';

export function createAgentRoutes(
  authMiddleware: AuthMiddleware,
  actionVerification: ActionVerificationMiddleware
): Router {
  const router = Router();

  /**
   * @swagger
   * /api/agents:
   *   get:
   *     summary: List all agents
   *     tags: [Agents]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of agents
   *       401:
   *         description: Unauthorized
   */
  router.get('/', authMiddleware.authenticate(), (req: AuthRequest, res: Response) => {
    const response: APIResponse = {
      success: true,
      data: {
        agents: [],
        message: 'Agent listing requires database integration',
      },
      timestamp: new Date(),
    };
    res.json(response);
  });

  /**
   * @swagger
   * /api/agents/{agentId}:
   *   get:
   *     summary: Get agent details
   *     tags: [Agents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: agentId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Agent details
   *       404:
   *         description: Agent not found
   */
  router.get('/:agentId', authMiddleware.authenticate(), (req: AuthRequest, res: Response) => {
    const { agentId } = req.params;
    const response: APIResponse = {
      success: true,
      data: {
        agentId,
        message: 'Agent details require database integration',
      },
      timestamp: new Date(),
    };
    res.json(response);
  });

  /**
   * @swagger
   * /api/agents:
   *   post:
   *     summary: Create a new agent
   *     tags: [Agents]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - did
   *               - ownerAddress
   *             properties:
   *               name:
   *                 type: string
   *               did:
   *                 type: string
   *               ownerAddress:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Agent created successfully
   *       400:
   *         description: Invalid request
   */
  router.post(
    '/',
    authMiddleware.authenticate(),
    authMiddleware.authorize(['human', 'admin']),
    (req: AuthRequest, res: Response) => {
      // Set actionType for verification
      req.body.actionType = ActionType.AGENT_CREATE;
      return actionVerification.verify()(req, res, () => {
        try {
          const { name, did, ownerAddress, description } = req.body;

          if (!name || !did || !ownerAddress) {
            const response: APIResponse = {
              success: false,
              error: 'name, did, and ownerAddress are required',
              timestamp: new Date(),
            };
            return res.status(400).json(response);
          }

          const response: APIResponse = {
            success: true,
            data: {
              message: 'Agent created (requires database integration for persistence)',
              agent: {
                name,
                did,
                ownerAddress,
                description,
                createdAt: new Date(),
              },
            },
            timestamp: new Date(),
          };

          res.status(201).json(response);
        } catch {
          const response: APIResponse = {
            success: false,
            error: 'Failed to create agent',
            timestamp: new Date(),
          };
          res.status(500).json(response);
        }
      });
    }
  );

  /**
   * @swagger
   * /api/agents/{agentId}/status:
   *   put:
   *     summary: Update agent status
   *     tags: [Agents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: agentId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [ACTIVE, SLEEP, TERMINATED]
   *               reason:
   *                 type: string
   *     responses:
   *       200:
   *         description: Status updated successfully
   *       400:
   *         description: Invalid request
   */
  router.put(
    '/:agentId/status',
    authMiddleware.authenticate(),
    (req: AuthRequest, res: Response) => {
      req.body.actionType = ActionType.STATUS_CHANGE;
      return actionVerification.verify()(req, res, () => {
        try {
          const { agentId } = req.params;
          const { status, reason } = req.body;

          if (!status || !Object.values(RuntimeStatus).includes(status)) {
            const response: APIResponse = {
              success: false,
              error: 'Invalid status. Must be ACTIVE, SLEEP, or TERMINATED',
              timestamp: new Date(),
            };
            return res.status(400).json(response);
          }

          const response: APIResponse = {
            success: true,
            data: {
              agentId,
              status,
              reason,
              updatedAt: new Date(),
            },
            timestamp: new Date(),
          };

          res.json(response);
        } catch {
          const response: APIResponse = {
            success: false,
            error: 'Failed to update agent status',
            timestamp: new Date(),
          };
          res.status(500).json(response);
        }
      });
    }
  );

  /**
   * @swagger
   * /api/agents/{agentId}/capabilities:
   *   get:
   *     summary: Get agent capabilities
   *     tags: [Agents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: agentId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Agent capabilities
   */
  router.get('/:agentId/capabilities', authMiddleware.authenticate(), (req: AuthRequest, res: Response) => {
    const { agentId } = req.params;
    const response: APIResponse = {
      success: true,
      data: {
        agentId,
        capabilities: [],
        message: 'Capabilities require database integration',
      },
      timestamp: new Date(),
    };
    res.json(response);
  });

  return router;
}
