// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Main API Gateway
 * Integrates REST API and WebSocket server
 */

import express, { Application } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { WebSocketServer } from './websocket/WebSocketServer';
import { AuthMiddleware } from './middleware/auth';
import { ActionVerificationMiddleware } from './middleware/actionVerification';
import { createAuthRoutes } from './routes/auth';
import { createAgentRoutes } from './routes/agents';

export interface APIGatewayConfig {
  port?: number;
  jwtSecret?: string;
  corsOrigin?: string | string[];
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
}

export class APIGateway {
  private app: Application;
  private httpServer: HTTPServer;
  private wsServer: WebSocketServer;
  private authMiddleware: AuthMiddleware;
  private actionVerification: ActionVerificationMiddleware;
  private config: APIGatewayConfig;

  constructor(config: APIGatewayConfig = {}) {
    const corsOrigin = config.corsOrigin || process.env.CORS_ORIGIN || '*';
    
    this.config = {
      port: config.port || parseInt(process.env.API_PORT || '3000'),
      jwtSecret: config.jwtSecret || process.env.JWT_SECRET,
      corsOrigin,
      rateLimitWindowMs: config.rateLimitWindowMs || 15 * 60 * 1000, // 15 minutes
      rateLimitMax: config.rateLimitMax || 100, // 100 requests per window
    };

    this.app = express();
    this.httpServer = createServer(this.app);
    this.wsServer = new WebSocketServer(this.httpServer, {
      cors: {
        origin: corsOrigin,
        credentials: true,
      },
    });

    this.authMiddleware = new AuthMiddleware(this.config.jwtSecret);
    this.actionVerification = new ActionVerificationMiddleware();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSwagger();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: this.config.corsOrigin,
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: this.config.rateLimitWindowMs,
      max: this.config.rateLimitMax,
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        websocket: {
          connected: this.wsServer.getConnectedClientsCount(),
        },
      });
    });

    // API routes
    this.app.use('/api/auth', createAuthRoutes(this.authMiddleware));
    this.app.use('/api/agents', createAgentRoutes(this.authMiddleware, this.actionVerification));

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        timestamp: new Date(),
      });
    });
  }

  /**
   * Setup Swagger documentation
   */
  private setupSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'VEXEL API Gateway',
          version: '1.0.0',
          description: 'API Gateway for VEXEL - Phase 3: Bridge Layer Implementation',
          contact: {
            name: 'VEXEL Team',
          },
        },
        servers: [
          {
            url: `http://localhost:${this.config.port}`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: ['./src/api/routes/*.ts'],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  /**
   * Start the API Gateway server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(this.config.port, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    VEXEL API GATEWAY                          ║
║                  Phase 3: Bridge Layer                        ║
╠═══════════════════════════════════════════════════════════════╣
║ REST API:        http://localhost:${this.config.port}                    ║
║ WebSocket:       ws://localhost:${this.config.port}                      ║
║ API Docs:        http://localhost:${this.config.port}/api-docs           ║
║ Health Check:    http://localhost:${this.config.port}/health             ║
╚═══════════════════════════════════════════════════════════════╝
        `);
        resolve();
      });
    });
  }

  /**
   * Stop the API Gateway server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('API Gateway stopped');
          resolve();
        }
      });
    });
  }

  /**
   * Get Express app instance
   */
  getApp(): Application {
    return this.app;
  }

  /**
   * Get WebSocket server instance
   */
  getWebSocketServer(): WebSocketServer {
    return this.wsServer;
  }

  /**
   * Get HTTP server instance
   */
  getHTTPServer(): HTTPServer {
    return this.httpServer;
  }
}
