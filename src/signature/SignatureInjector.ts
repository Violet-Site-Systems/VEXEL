// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { ethers } from 'ethers';
import { WalletManager } from '../wallet/WalletManager';

/**
 * Interface for signature data
 */
export interface SignatureData {
  message: string;
  signature: string;
  address: string;
  timestamp: number;
}

/**
 * Interface for transaction signature
 */
export interface TransactionSignature {
  to: string;
  value?: string;
  data?: string;
  signature: string;
  from: string;
}

/**
 * SignatureInjector handles cryptographic signature generation and injection
 * for Copilot agent transactions on the Polygon network
 */
export class SignatureInjector {
  private walletManager: WalletManager;

  constructor(walletManager: WalletManager) {
    this.walletManager = walletManager;
  }

  /**
   * Signs a message with the agent's private key
   * @param agentId - Unique identifier for the agent
   * @param message - Message to sign
   * @returns Signature data including the signature and address
   */
  async signMessage(agentId: string, message: string): Promise<SignatureData> {
    const wallet = await this.walletManager.loadWallet(agentId);
    const signature = await wallet.signMessage(message);
    
    return {
      message,
      signature,
      address: await wallet.getAddress(),
      timestamp: Date.now()
    };
  }

  /**
   * Verifies a signed message
   * @param message - Original message
   * @param signature - Signature to verify
   * @param expectedAddress - Expected signer address
   * @returns True if signature is valid
   */
  verifySignature(message: string, signature: string, expectedAddress: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  /**
   * Signs a transaction with the agent's private key
   * @param agentId - Unique identifier for the agent
   * @param transaction - Transaction object
   * @returns Signed transaction
   */
  async signTransaction(
    agentId: string,
    transaction: {
      to: string;
      value?: string;
      data?: string;
      gasLimit?: string;
      gasPrice?: string;
      nonce?: number;
    }
  ): Promise<string> {
    const wallet = await this.walletManager.loadWallet(agentId);
    
    // Prepare transaction object
    const tx: ethers.TransactionRequest = {
      to: transaction.to,
      value: transaction.value ? ethers.parseEther(transaction.value) : undefined,
      data: transaction.data,
      gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
      gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
      nonce: transaction.nonce
    };

    // Sign the transaction
    const signedTx = await wallet.signTransaction(tx);
    return signedTx;
  }

  /**
   * Signs and sends a transaction
   * @param agentId - Unique identifier for the agent
   * @param transaction - Transaction object
   * @returns Transaction receipt
   */
  async signAndSendTransaction(
    agentId: string,
    transaction: {
      to: string;
      value?: string;
      data?: string;
      gasLimit?: string;
    }
  ): Promise<ethers.TransactionReceipt | null> {
    const wallet = await this.walletManager.loadWallet(agentId);
    
    const tx: ethers.TransactionRequest = {
      to: transaction.to,
      value: transaction.value ? ethers.parseEther(transaction.value) : undefined,
      data: transaction.data,
      gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : 21000n
    };

    const txResponse = await wallet.sendTransaction(tx);
    const receipt = await txResponse.wait();
    return receipt;
  }

  /**
   * Creates a DID-compliant signature for agent identity verification
   * @param agentId - Unique identifier for the agent
   * @param didDocument - DID document to sign
   * @returns Signature data with DID format
   */
  async signDIDDocument(agentId: string, didDocument: object): Promise<SignatureData> {
    const message = JSON.stringify(didDocument);
    return this.signMessage(agentId, message);
  }

  /**
   * Generates a typed data signature (EIP-712)
   * @param agentId - Unique identifier for the agent
   * @param domain - EIP-712 domain
   * @param types - EIP-712 types
   * @param value - Value to sign
   * @returns Signature
   */
  async signTypedData(
    agentId: string,
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, any>
  ): Promise<string> {
    const wallet = await this.walletManager.loadWallet(agentId);
    const signature = await wallet.signTypedData(domain, types, value);
    return signature;
  }

  /**
   * Injects signature into a payload for agent authentication
   * @param agentId - Unique identifier for the agent
   * @param payload - Payload to authenticate
   * @returns Authenticated payload with signature
   */
  async injectSignature(agentId: string, payload: any): Promise<any> {
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const signatureData = await this.signMessage(agentId, message);
    
    return {
      ...payload,
      signature: signatureData.signature,
      signer: signatureData.address,
      timestamp: signatureData.timestamp
    };
  }
}
