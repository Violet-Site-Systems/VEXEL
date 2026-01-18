/**
 * VEXEL - DID Bridge Layer
 * Main entry point for the data layer
 */

export { DatabaseClient, db } from './database/client';
export { AgentRepository } from './database/repository';
export { MigrationRunner } from './database/migrate';
export { IPFSClient, ipfsClient } from './ipfs/client';
export { AgentService } from './service';
export * from './types';
