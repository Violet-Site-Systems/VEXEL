/**
 * Sentinel Agent - Cryptographic Operations
 * Core signing and verification primitives
 */

import { ethers } from 'ethers';
import crypto from 'crypto';
import { Signature, VerificationResult, SignatureAlgorithm } from './types';

/**
 * Cryptographic operations handler
 * Note: Currently uses ECDSA (secp256k1) for stability across environments
 */
export class CryptoOperations {
  private algorithm: SignatureAlgorithm;

  constructor() {
    // Use ECDSA for reliable cross-platform support
    this.algorithm = 'ECDSA';
  }

  /**
   * Sign a message with the provided private key
   * @param message - Message to sign (will be hashed)
   * @param privateKey - Private key for signing (hex format)
   * @param keyId - Identifier for the key used
   * @returns Signature object with proof of signing
   */
  async sign(message: string, privateKey: string, keyId: string): Promise<Signature> {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const signature = await wallet.signMessage(message);

      return {
        algorithm: 'ECDSA',
        signature,
        message: this.hashMessage(message),
        timestamp: new Date(),
        keyId,
      };
    } catch (error) {
      throw new Error(`Signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify a signature with a public key
   * @param signature - Signature object to verify
   * @param publicKey - Public key for verification
   * @returns Verification result with validity status
   */
  async verify(signature: Signature, publicKey: string): Promise<VerificationResult> {
    try {
      let isValid = false;

      try {
        const recovered = ethers.recoverAddress(
          ethers.hashMessage(signature.message),
          signature.signature
        );
        isValid = recovered.toLowerCase() === publicKey.toLowerCase();
      } catch {
        isValid = false;
      }

      return {
        isValid,
        keyId: signature.keyId,
        algorithm: 'ECDSA',
        message: signature.message,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        isValid: false,
        keyId: signature.keyId,
        algorithm: 'ECDSA',
        message: signature.message,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Hash a message using SHA-256
   * @param message - Message to hash
   * @returns Hex-encoded hash
   */
  private hashMessage(message: string): string {
    return crypto.createHash('sha256').update(message).digest('hex');
  }

  /**
   * Derive a key from a password using KDF
   * @param password - Password to derive from
   * @param algorithm - KDF algorithm to use
   * @param salt - Salt for key derivation
   * @returns Derived key as hex string
   */
  async deriveKeyFromPassword(
    password: string,
    algorithm: 'PBKDF2' | 'scrypt' = 'PBKDF2',
    salt?: Buffer
  ): Promise<{ key: string; salt: string }> {
    const derivedSalt = salt || crypto.randomBytes(32);

    if (algorithm === 'PBKDF2') {
      const derivedKey = crypto.pbkdf2Sync(password, derivedSalt, 100000, 32, 'sha256');
      return {
        key: derivedKey.toString('hex'),
        salt: derivedSalt.toString('hex'),
      };
    } else if (algorithm === 'scrypt') {
      const derivedKey = crypto.scryptSync(password, derivedSalt, 32);
      return {
        key: derivedKey.toString('hex'),
        salt: derivedSalt.toString('hex'),
      };
    }

    throw new Error(`Unsupported KDF algorithm: ${algorithm}`);
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param data - Data to encrypt
   * @param key - Encryption key (32 bytes for AES-256)
   * @returns Encrypted data with IV and auth tag
   */
  encrypt(data: string, key: Buffer): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;

    return result;
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param encryptedData - Encrypted data string (format: iv:authTag:encrypted)
   * @param key - Decryption key
   * @returns Decrypted data
   */
  decrypt(encryptedData: string, key: Buffer): string {
    const [iv, authTag, encrypted] = encryptedData.split(':');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate a random nonce for request replay protection
   * @returns Hex-encoded nonce
   */
  generateNonce(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate HMAC for message authentication
   * @param message - Message to authenticate
   * @param secret - Secret key
   * @returns Hex-encoded HMAC
   */
  generateHMAC(message: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(message).digest('hex');
  }

  /**
   * Verify HMAC
   * @param message - Original message
   * @param hmac - HMAC to verify
   * @param secret - Secret key
   * @returns True if HMAC is valid
   */
  verifyHMAC(message: string, hmac: string, secret: string): boolean {
    const expectedHmac = this.generateHMAC(message, secret);
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  }
}
