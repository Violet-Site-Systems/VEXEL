/**
 * Sentinel Agent - Key Management System
 * Derives, imports, exports, and manages cryptographic keys
 */

import { ethers } from 'ethers';
import crypto from 'crypto';
import { CryptoKey, KeyManagementResult, KeyExport, KDFAlgorithm, SignatureAlgorithm, CryptoCurve } from './types';
import { CryptoOperations } from './crypto';

/**
 * Key management handler
 */
export class KeyManager {
  private keys: Map<string, CryptoKey> = new Map();
  private revokedKeyIds: Set<string> = new Set();
  private crypto: CryptoOperations;
  private keyRotationDays: number;

  constructor(keyRotationDays: number = 90) {
    this.crypto = new CryptoOperations();
    this.keyRotationDays = keyRotationDays;
  }

  /**
   * Generate a new key pair for an agent
   * @param keyId - Unique identifier for the key
   * @param algorithm - Signature algorithm to use
   * @param curve - Cryptographic curve (for ECDSA)
   * @returns Generated key with public/private pair
   */
  async generateKeyPair(
    keyId: string,
    algorithm: SignatureAlgorithm = 'Ed25519',
    curve?: CryptoCurve
  ): Promise<KeyManagementResult> {
    try {
      let publicKey: string;
      let privateKey: string;

      if (algorithm === 'ECDSA') {
        // Generate ECDSA key pair
        const wallet = ethers.Wallet.createRandom();
        privateKey = wallet.privateKey;
        publicKey = wallet.publicKey;
      } else if (algorithm === 'Ed25519') {
        // Generate Ed25519 key pair using Node.js crypto
        const { privateKey: pk, publicKey: pub } = crypto.generateKeyPairSync('ed25519', {
          privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
          publicKeyEncoding: { format: 'pem', type: 'spki' },
        });
        privateKey = pk as string;
        publicKey = pub as string;
      } else {
        return {
          success: false,
          message: `Unsupported algorithm: ${algorithm}`,
        };
      }

      const key: CryptoKey = {
        id: keyId,
        algorithm,
        curve: curve || 'secp256k1',
        publicKey,
        privateKey,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.keyRotationDays * 24 * 60 * 60 * 1000),
        isRevoked: false,
      };

      this.keys.set(keyId, key);

      return {
        success: true,
        keyId,
        message: `Key pair generated successfully with ID: ${keyId}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Import an existing key into the key store
   * @param keyId - Unique identifier for the key
   * @param publicKey - Public key (required)
   * @param privateKey - Private key (optional, for signing operations)
   * @param algorithm - Signature algorithm
   * @returns Import result
   */
  async importKey(
    keyId: string,
    publicKey: string,
    privateKey?: string,
    algorithm: SignatureAlgorithm = 'Ed25519'
  ): Promise<KeyManagementResult> {
    try {
      if (this.keys.has(keyId)) {
        return {
          success: false,
          message: `Key with ID ${keyId} already exists`,
        };
      }

      const key: CryptoKey = {
        id: keyId,
        algorithm,
        publicKey,
        privateKey,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.keyRotationDays * 24 * 60 * 60 * 1000),
        isRevoked: false,
      };

      this.keys.set(keyId, key);

      return {
        success: true,
        keyId,
        message: `Key imported successfully with ID: ${keyId}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Key import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Export a key for backup or migration
   * @param keyId - Key identifier to export
   * @param password - Password to encrypt private key
   * @param kdfAlgorithm - KDF algorithm for password derivation
   * @returns Exported key with encrypted private key
   */
  async exportKey(
    keyId: string,
    password: string,
    kdfAlgorithm: KDFAlgorithm = 'PBKDF2'
  ): Promise<KeyExport | null> {
    const key = this.keys.get(keyId);
    if (!key || !key.privateKey) {
      return null;
    }

    // Derive encryption key from password
    const { key: derivedKey, salt } = await this.crypto.deriveKeyFromPassword(
      password,
      kdfAlgorithm === 'PBKDF2' ? 'PBKDF2' : 'scrypt'
    );

    // Encrypt private key
    const encryptedPrivateKey = this.crypto.encrypt(
      key.privateKey,
      Buffer.from(derivedKey, 'hex')
    );

    return {
      keyId: key.id,
      algorithm: key.algorithm,
      publicKey: key.publicKey,
      encryptedPrivateKey,
      kdfAlgorithm,
      kdfParams: { salt },
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
    };
  }

  /**
   * Import an exported key from backup
   * @param keyExport - Exported key data
   * @param password - Password to decrypt private key
   * @returns Import result
   */
  async importExportedKey(keyExport: KeyExport, password: string): Promise<KeyManagementResult> {
    try {
      // Derive decryption key from password
      const { key: derivedKey } = await this.crypto.deriveKeyFromPassword(
        password,
        keyExport.kdfAlgorithm === 'PBKDF2' ? 'PBKDF2' : 'scrypt',
        Buffer.from(keyExport.kdfParams.salt, 'hex')
      );

      // Decrypt private key
      const privateKey = this.crypto.decrypt(
        keyExport.encryptedPrivateKey,
        Buffer.from(derivedKey, 'hex')
      );

      return this.importKey(
        keyExport.keyId,
        keyExport.publicKey,
        privateKey,
        keyExport.algorithm
      );
    } catch (error) {
      return {
        success: false,
        message: `Key import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get a key by ID
   * @param keyId - Key identifier
   * @returns Key object or null if not found
   */
  getKey(keyId: string): CryptoKey | null {
    const key = this.keys.get(keyId);
    if (key && key.isRevoked) {
      return null; // Return null for revoked keys
    }
    return key || null;
  }

  /**
   * Get public key for a key ID
   * @param keyId - Key identifier
   * @returns Public key string or null
   */
  getPublicKey(keyId: string): string | null {
    const key = this.getKey(keyId);
    return key ? key.publicKey : null;
  }

  /**
   * Revoke a key (mark as unusable)
   * @param keyId - Key identifier to revoke
   * @returns Revocation result
   */
  revokeKey(keyId: string): KeyManagementResult {
    const key = this.keys.get(keyId);
    if (!key) {
      return {
        success: false,
        message: `Key with ID ${keyId} not found`,
      };
    }

    key.isRevoked = true;
    this.revokedKeyIds.add(keyId);

    return {
      success: true,
      keyId,
      message: `Key ${keyId} has been revoked`,
    };
  }

  /**
   * Check if a key is revoked
   * @param keyId - Key identifier
   * @returns True if key is revoked
   */
  isKeyRevoked(keyId: string): boolean {
    return this.revokedKeyIds.has(keyId);
  }

  /**
   * Rotate a key (generate new key, keep old as fallback)
   * @param oldKeyId - Key identifier to rotate
   * @returns New key ID and result
   */
  async rotateKey(oldKeyId: string): Promise<{ oldKeyId: string; newKeyId: string; result: KeyManagementResult }> {
    const oldKey = this.keys.get(oldKeyId);
    if (!oldKey) {
      return {
        oldKeyId,
        newKeyId: '',
        result: {
          success: false,
          message: `Key with ID ${oldKeyId} not found`,
        },
      };
    }

    // Generate new key with rotated timestamp
    const newKeyId = `${oldKeyId}_rotated_${Date.now()}`;
    const result = await this.generateKeyPair(newKeyId, oldKey.algorithm, oldKey.curve);

    if (result.success) {
      // Mark old key as expired
      oldKey.expiresAt = new Date(); // Expire immediately
    }

    return {
      oldKeyId,
      newKeyId,
      result,
    };
  }

  /**
   * Get all active keys
   * @returns Array of non-revoked keys
   */
  getAllActiveKeys(): CryptoKey[] {
    return Array.from(this.keys.values()).filter((key) => !key.isRevoked);
  }

  /**
   * Get keys due for rotation
   * @returns Array of keys that have expired or are expiring soon
   */
  getKeysForRotation(): CryptoKey[] {
    const now = new Date();
    const warningPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days

    return Array.from(this.keys.values()).filter(
      (key) =>
        !key.isRevoked &&
        key.expiresAt &&
        key.expiresAt.getTime() - now.getTime() < warningPeriod
    );
  }

  /**
   * Clear all keys (use with caution)
   */
  clearAllKeys(): void {
    this.keys.clear();
    this.revokedKeyIds.clear();
  }
}
