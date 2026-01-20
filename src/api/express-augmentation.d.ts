/**
 * Type augmentation for Express Request object
 * This extends the Express Request type to include our custom properties
 */

import { JWTPayload } from './types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export {};
