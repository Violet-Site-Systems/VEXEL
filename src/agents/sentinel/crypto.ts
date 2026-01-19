/**
 * Sentinel Agent - Cryptographic Operations
 * Core signing and verification primitives
 */

import { ethers } from 'ethers';
import crypto from 'crypto';
import { Signature, VerificationResult, SignatureAlgorithm, CryptoKey } from './types';

/**
 * Cryptographic operations handler
 */
export class CryptoOperations {
  private algorithm: SignatureAlgorithm;

  constructor(algorithm: SignatureAlgorithm = 'Ed25519') {
    this.algorithm = algorithm;
  }

  /**
   * Sign a message with the provided private key
   * @param message - Message to sign (will be hashed)
   * @param privateKey - Private key for signing
   * @param keyId - Identifier for the key used
   * @returns Signature object with proof of signing
   */
  async sign(message: string, privateKey: string, keyId: string): Promise<Signature> {
    try {
      let signature: string;

      if (this.algorithm === 'ECDSA') {
        // Use ethers.js for ECDSA signing (secp256k1)
        const wallet = new ethers.Wallet(privateKey);
        const messageHash = ethers.hashMessage(message);
        signature = await wallet.signMessage(message);
      } else if (this.algorithm === 'Ed25519') {
        // Use Node.js crypto for Ed25519 signing
        const signer = crypto.createPrivateKey({
          key: privateKey,
          format: 'pem',
          type: 'pkcs8',
        });
        const sign = crypto.createSign('sha256');
        sign.update(message);
        signature = sign.sign(signer, 'hex');
      } else {
        throw new Error(`Unsupported algorithm: ${this.algorithm}`);
      }

      return {
        algorithm: this.algorithm,
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
   * Verify a signature with the provided public key
   * @param signature - Signature object to verify
   * @param publicKey - Public key for verification
   * @returns Verification result with validity status
   */
  async verify(signature: Signature, publicKey: string): Promise<VerificationResult> {
    try {
      let isValid = false;

      if (this.algorithm === 'ECDSA') {
        // Verify ECDSA signature
        const recovered = ethers.recoverAddress(
          ethers.hashMessage(signature.message),
          signature.signature
        );
        // In production, compare recovered address with expected publicKey
        isValid = recovered.toLowerCase() === publicKey.toLowerCase();
      } else if (this.algorithm === 'Ed25519') {
        // Verify Ed25519 signature
        const verifier = crypto.createVerify('sha256');
        verifier.update(signature.message);
        const publicKeyObj = crypto.createPublicKey({
          key: publicKey,
          format: 'pem',
          type: 'spki',
        });
        isValid = verifier.verify(publicKeyObj, signature.signature, 'hex');
      }

      return {
        isValid,
        keyId: signature.keyId,
        algorithm: this.algorithm,
        message: signature.message,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        isValid: false,
        keyId: signature.keyId,
        algorithm: this.algorithm,
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
