// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
#!/usr/bin/env node
/**
 * Standalone server for VEXEL API Gateway
 * Run with: npx ts-node src/api/server.ts
 */

import { APIGateway } from './APIGateway';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create and start the API Gateway
const gateway = new APIGateway({
  port: parseInt(process.env.API_PORT || '3000'),
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
});

gateway.start().catch((error) => {
  console.error('Failed to start API Gateway:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await gateway.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await gateway.stop();
  process.exit(0);
});
