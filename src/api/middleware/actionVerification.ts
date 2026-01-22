/**
 * Action verification middleware
 * Validates and authorizes actions before execution
 */

import { Response, NextFunction } from 'express';
import { AuthRequest, ActionType, ActionRequest, ActionVerificationResult, APIResponse } from '../types';

export class ActionVerificationMiddleware {
  /**
   * Verify if an action is allowed based on user role and action type
   */
  private verifyAction(
    userId: string,
    role: 'human' | 'agent' | 'admin',
    actionType: ActionType,
    agentId: string,
    payload: Record<string, any>
  ): ActionVerificationResult {
    // Admin can do everything
    if (role === 'admin') {
      return { allowed: true };
    }

    switch (actionType) {
      case ActionType.AGENT_CREATE:
        // Only humans and admins can create agents
        if (role === 'human') {
          return { allowed: true };
        }
        return { 
          allowed: false, 
          reason: 'Only humans can create new agents' 
        };

      case ActionType.AGENT_UPDATE:
        // Agents can update themselves, humans can update their agents
        if (role === 'agent') {
          return { allowed: true };
        }
        if (role === 'human') {
          return { 
            allowed: true, 
            requiresConfirmation: true,
            reason: 'Agent update requires confirmation' 
          };
        }
        return { allowed: false, reason: 'Unauthorized agent update' };

      case ActionType.AGENT_DELETE:
        // Only humans can delete agents, requires confirmation
        if (role === 'human') {
          return { 
            allowed: true, 
            requiresConfirmation: true,
            reason: 'Agent deletion is irreversible and requires confirmation' 
          };
        }
        return { 
          allowed: false, 
          reason: 'Only humans can delete agents' 
        };

      case ActionType.CAPABILITY_ADD:
        // Both agents and humans can add capabilities
        return { allowed: true };

      case ActionType.STATUS_CHANGE:
        // Agents can change their own status
        if (role === 'agent') {
          return { allowed: true };
        }
        // Humans can change agent status with confirmation
        if (role === 'human') {
          return { 
            allowed: true, 
            requiresConfirmation: true,
            reason: 'Status change requires confirmation' 
          };
        }
        return { allowed: false, reason: 'Unauthorized status change' };

      case ActionType.MESSAGE_SEND:
        // All authenticated users can send messages
        return { allowed: true };

      default:
        return { 
          allowed: false, 
          reason: 'Unknown action type' 
        };
    }
  }

  /**
   * Express middleware for action verification
   */
  verify() {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        const response: APIResponse = {
          success: false,
          error: 'Authentication required',
          timestamp: new Date(),
        };
        return res.status(401).json(response);
      }

      const actionRequest: ActionRequest = {
        id: req.body.id || `action-${Date.now()}`,
        type: req.body.actionType,
        agentId: req.body.agentId || req.params.agentId,
        payload: req.body.payload || req.body,
        requestedBy: req.user.userId,
        timestamp: new Date(),
      };

      const verificationResult = this.verifyAction(
        req.user.userId,
        req.user.role,
        actionRequest.type,
        actionRequest.agentId,
        actionRequest.payload
      );

      if (!verificationResult.allowed) {
        const response: APIResponse = {
          success: false,
          error: verificationResult.reason || 'Action not allowed',
          timestamp: new Date(),
        };
        return res.status(403).json(response);
      }

      // Attach verification result to request for downstream use
      (req as any).verificationResult = verificationResult;
      next();
    };
  }
}
