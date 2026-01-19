/**
 * Main entry point for VEXEL DID Integration
 */

export { WalletManager, WalletConfig, WalletInfo } from './wallet/WalletManager';
export { SignatureInjector, SignatureData, TransactionSignature } from './signature/SignatureInjector';
export { BadgeMinter, BadgeMetadata, MintedBadge } from './badge/BadgeMinter';
export { 
  createDIDDocument, 
  resolveDID, 
  validateDID, 
  extractAddressFromDID,
  DIDDocument,
  VerificationMethod
} from './utils/did';
export {
  HAAPProtocol,
  HAAPConfig,
  KYCService,
  IKYCProvider,
  MockKYCProvider,
  KYCStatus,
  KYCProvider,
  KYCVerificationRequest,
  KYCVerificationResult,
  HumanAttestationToken,
  TokenValidationResult,
  HAAPFlowResult
} from './haap';

import { WalletManager } from './wallet/WalletManager';
import { SignatureInjector } from './signature/SignatureInjector';
import { BadgeMinter } from './badge/BadgeMinter';
import { HAAPProtocol } from './haap';

/**
 * Configuration for VEXEL DID Integration
 */
export interface VexelConfig {
  network?: 'polygon' | 'polygon-mumbai';
  walletDir?: string;
  badgeContractAddress?: string;
  haapTokenExpiryDays?: number;
}

/**
 * Main VEXEL class that provides integrated DID functionality
 */
export class Vexel {
  public walletManager: WalletManager;
  public signatureInjector: SignatureInjector;
  public badgeMinter: BadgeMinter;
  public haapProtocol: HAAPProtocol;

  constructor(config: VexelConfig = {}) {
    this.walletManager = new WalletManager({
      network: config.network,
      walletDir: config.walletDir
    });
    
    this.signatureInjector = new SignatureInjector(this.walletManager);
    this.badgeMinter = new BadgeMinter(this.walletManager, config.badgeContractAddress);
    this.haapProtocol = new HAAPProtocol({
      walletManager: this.walletManager,
      badgeMinter: this.badgeMinter,
      tokenExpiryDays: config.haapTokenExpiryDays
    });
  }

  /**
   * Initialize a new agent with wallet, DID, and badge
   * @param agentId - Unique identifier for the agent
   * @returns Complete agent setup information
   */
  async initializeAgent(agentId: string) {
    // Create wallet
    const walletInfo = await this.walletManager.createWallet(agentId);
    
    // Mint VERIFIED_HUMAN badge
    const badge = await this.badgeMinter.mintVerifiedHumanBadge(agentId);
    
    return {
      agentId,
      wallet: walletInfo,
      badge,
      did: `did:vexel:${walletInfo.address}`
    };
  }

  /**
   * Initialize human user with complete HAAP flow: KYC → DID → Badge → Token
   * @param userId - Unique identifier for the user
   * @param email - User's email address
   * @returns Complete HAAP flow result
   */
  async initializeHuman(userId: string, email: string) {
    return await this.haapProtocol.executeHAAPFlow(userId, email);
  }
}
