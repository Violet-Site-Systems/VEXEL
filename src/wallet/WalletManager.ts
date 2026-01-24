import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for wallet configuration
 */
export interface WalletConfig {
  network?: 'polygon' | 'polygon-mumbai';
  walletDir?: string;
}

/**
 * Interface for wallet information
 */
export interface WalletInfo {
  address: string;
  publicKey: string;
  mnemonic?: string;
}

/**
 * WalletManager handles creation and management of Polygon wallets for Copilot agents
 */
export class WalletManager {
  private network: string;
  private walletDir: string;
  private provider: ethers.JsonRpcProvider;

  constructor(config: WalletConfig = {}) {
    this.network = config.network || 'polygon-mumbai';
    this.walletDir = config.walletDir || path.join(process.cwd(), 'wallets');
    
    // Set up provider for Polygon network
    const rpcUrl = this.network === 'polygon' 
      ? 'https://polygon-rpc.com'
      : 'https://rpc-mumbai.maticvigil.com';
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Creates a new wallet for a Copilot agent
   * @param agentId - Unique identifier for the agent
   * @returns Wallet information including address and public key
   */
  async createWallet(agentId: string): Promise<WalletInfo> {
    // Generate a new random wallet
    const wallet = ethers.Wallet.createRandom();
    
    // Connect wallet to provider
    const connectedWallet = wallet.connect(this.provider);
    
    const walletInfo: WalletInfo = {
      address: await connectedWallet.getAddress(),
      publicKey: wallet.signingKey.publicKey,
      mnemonic: wallet.mnemonic?.phrase
    };

    // Save wallet to secure storage
    await this.saveWallet(agentId, wallet.privateKey);

    return walletInfo;
  }

  /**
   * Loads an existing wallet for an agent
   * @param agentId - Unique identifier for the agent
   * @returns Ethers Wallet instance
   */
  async loadWallet(agentId: string): Promise<ethers.Wallet> {
    const walletPath = this.getWalletPath(agentId);
    
    if (!fs.existsSync(walletPath)) {
      throw new Error(`Wallet not found for agent: ${agentId}`);
    }

    const encryptedJson = fs.readFileSync(walletPath, 'utf-8');
    const password = this.getWalletPassword(agentId);
    
    const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
    return wallet.connect(this.provider) as ethers.Wallet;
  }

  /**
   * Gets wallet information without loading the private key
   * @param agentId - Unique identifier for the agent
   * @returns Basic wallet information
   */
  async getWalletInfo(agentId: string): Promise<WalletInfo> {
    const wallet = await this.loadWallet(agentId);
    return {
      address: await wallet.getAddress(),
      publicKey: wallet.signingKey.publicKey
    };
  }

  /**
   * Checks if a wallet exists for an agent
   * @param agentId - Unique identifier for the agent
   * @returns True if wallet exists
   */
  walletExists(agentId: string): boolean {
    return fs.existsSync(this.getWalletPath(agentId));
  }

  /**
   * Gets the balance of an agent's wallet
   * @param agentId - Unique identifier for the agent
   * @returns Balance in ETH (or MATIC)
   */
  async getBalance(agentId: string): Promise<string> {
    const wallet = await this.loadWallet(agentId);
    const balance = await this.provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Saves wallet to encrypted JSON file
   * @param agentId - Unique identifier for the agent
   * @param privateKey - Private key of the wallet
   */
  private async saveWallet(agentId: string, privateKey: string): Promise<void> {
    // Ensure wallet directory exists
    if (!fs.existsSync(this.walletDir)) {
      fs.mkdirSync(this.walletDir, { recursive: true });
    }

    const wallet = new ethers.Wallet(privateKey);
    const password = this.getWalletPassword(agentId);
    const encryptedJson = await wallet.encrypt(password);
    
    const walletPath = this.getWalletPath(agentId);
    fs.writeFileSync(walletPath, encryptedJson);
  }

  /**
   * Gets the file path for an agent's wallet
   * @param agentId - Unique identifier for the agent
   * @returns Full path to wallet file
   */
  private getWalletPath(agentId: string): string {
    return path.join(this.walletDir, `${agentId}.json`);
  }

  /**
   * Generates a deterministic password for wallet encryption
   * In production, this REQUIRES a secure key management system
   * @param agentId - Unique identifier for the agent
   * @returns Password for wallet encryption
   */
  private getWalletPassword(agentId: string): string {
    const basePassword = process.env.WALLET_ENCRYPTION_KEY;
    
    // In production, fail if encryption key is not set
    if (!basePassword) {
      // Only use default in development/testing
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'WALLET_ENCRYPTION_KEY environment variable must be set in production. ' +
          'See docs/SECURITY_REVIEW.md for security requirements.'
        );
      }
      // Development-only default
      console.warn('⚠️  WARNING: Using default encryption key. Set WALLET_ENCRYPTION_KEY for production.');
      return `vexel-dev-key-${agentId}`;
    }
    
    return `${basePassword}-${agentId}`;
  }

  /**
   * Gets the provider for the configured network
   * @returns Ethers provider
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Cleanup and destroy the provider
   * This is important to prevent open handles in tests
   */
  async destroy(): Promise<void> {
    if (this.provider) {
      await this.provider.destroy();
    }
  }
}
