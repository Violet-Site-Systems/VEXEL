/**
 * DID (Decentralized Identifier) utilities for VEXEL
 */

import { ethers } from 'ethers';

/**
 * Interface for DID Document
 */
export interface DIDDocument {
  '@context': string[];
  id: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod?: string[];
  created: string;
  updated: string;
}

/**
 * Interface for Verification Method
 */
export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyHex?: string;
  ethereumAddress?: string;
}

/**
 * Creates a W3C-compliant DID document for an agent
 * @param address - Ethereum address of the agent
 * @param publicKey - Public key of the agent
 * @returns DID document
 */
export function createDIDDocument(address: string, publicKey: string): DIDDocument {
  const did = `did:vexel:${address}`;
  const timestamp = new Date().toISOString();
  
  const verificationMethod: VerificationMethod = {
    id: `${did}#key-1`,
    type: 'EcdsaSecp256k1VerificationKey2019',
    controller: did,
    publicKeyHex: publicKey,
    ethereumAddress: address
  };

  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/secp256k1-2019/v1'
    ],
    id: did,
    verificationMethod: [verificationMethod],
    authentication: [verificationMethod.id],
    assertionMethod: [verificationMethod.id],
    created: timestamp,
    updated: timestamp
  };
}

/**
 * Resolves a DID to a DID document
 * @param did - DID to resolve
 * @returns DID document or null if not found
 */
export async function resolveDID(did: string): Promise<DIDDocument | null> {
  // In production, this would query a DID registry
  // For now, this is a placeholder
  if (!did.startsWith('did:vexel:')) {
    throw new Error('Only did:vexel method is supported');
  }
  
  // Placeholder implementation
  return null;
}

/**
 * Validates a DID format
 * @param did - DID to validate
 * @returns True if valid
 */
export function validateDID(did: string): boolean {
  // DID format: did:method:identifier
  const didRegex = /^did:[a-z0-9]+:[a-zA-Z0-9._-]+$/;
  return didRegex.test(did);
}

/**
 * Extracts the Ethereum address from a VEXEL DID
 * @param did - DID to extract from
 * @returns Ethereum address
 */
export function extractAddressFromDID(did: string): string {
  if (!did.startsWith('did:vexel:')) {
    throw new Error('Not a VEXEL DID');
  }
  
  const address = did.split(':')[2];
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid Ethereum address in DID');
  }
  
  return address;
}
