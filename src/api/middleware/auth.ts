// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Authentication middleware using JWT
 */

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWTPayload, APIResponse } from '../types';

export class AuthMiddleware {
  private jwtSecret: string;

  constructor(jwtSecret?: string) {
    if (!jwtSecret && !process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be provided in production environment');
      }
      console.warn('⚠️  WARNING: Using default JWT secret for development. Set JWT_SECRET environment variable for production.');
    }
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'vexel-dev-secret-change-in-production';
  }

  /**
   * Generate JWT token
   */
  generateToken(payload: JWTPayload, expiresIn: string = '24h'): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn } as jwt.SignOptions);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Express middleware to authenticate requests
   */
  authenticate() {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response: APIResponse = {
          success: false,
          error: 'Missing or invalid authorization header',
          timestamp: new Date(),
        };
        return res.status(401).json(response);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const payload = this.verifyToken(token);

      if (!payload) {
        const response: APIResponse = {
          success: false,
          error: 'Invalid or expired token',
          timestamp: new Date(),
        };
        return res.status(401).json(response);
      }

      req.user = payload;
      next();
    };
  }

  /**
   * Middleware to authorize specific roles
   */
  authorize(allowedRoles: Array<'human' | 'agent' | 'admin'>) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        const response: APIResponse = {
          success: false,
          error: 'Authentication required',
          timestamp: new Date(),
        };
        return res.status(401).json(response);
      }

      if (!allowedRoles.includes(req.user.role)) {
        const response: APIResponse = {
          success: false,
          error: 'Insufficient permissions',
          timestamp: new Date(),
        };
        return res.status(403).json(response);
      }

      next();
    };
  }
}
