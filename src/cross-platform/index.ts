// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Cross-Platform Integration Module
 * Exports all components for agent-to-agent communication
 */

// Type definitions
export * from './types';

// Discovery service
export { AgentDiscoveryService, AgentDiscoveryConfig } from './discovery/AgentDiscoveryService';

// Handshake protocol
export { HandshakeProtocol, HandshakeConfig } from './handshake/HandshakeProtocol';

// Context storage
export { ContextStorage, ContextStorageConfig } from './context/ContextStorage';

// Communication adapter
export { CrossPlatformAdapter } from './adapter/CrossPlatformAdapter';
