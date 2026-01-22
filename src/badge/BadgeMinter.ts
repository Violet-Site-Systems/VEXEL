// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { ethers } from 'ethers';
import { WalletManager } from '../wallet/WalletManager';

/**
 * Interface for badge metadata
 */
export interface BadgeMetadata {
  name: string;
  description: string;
  image?: string;
  attributes?: { trait_type: string; value: string | number }[];
}

/**
 * Interface for minted badge information
 */
export interface MintedBadge {
  tokenId: string;
  owner: string;
  transactionHash: string;
  badgeType: string;
  timestamp: number;
}

/**
 * BadgeMinter handles the creation and minting of VERIFIED_HUMAN badges
 * on the Polygon network for authenticated Copilot agents
 */
export class BadgeMinter {
  private walletManager: WalletManager;
  private contractAddress: string;
  private contractABI: ethers.InterfaceAbi;

  constructor(walletManager: WalletManager, contractAddress?: string) {
    this.walletManager = walletManager;
    
    // In production, contract address must be set after deployment
    // Using placeholder for development/testing only
    if (!contractAddress) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'Badge contract address must be provided in production. ' +
          'Deploy the VERIFIED_HUMAN badge contract first, then call ' +
          'badgeMinter.setContractAddress(address).'
        );
      }
      // Development placeholder
      console.warn('⚠️  Using placeholder contract address. Badge minting will be simulated.');
      this.contractAddress = '0x0000000000000000000000000000000000000000';
    } else {
      this.contractAddress = contractAddress;
    }
    
    // Simplified ERC-721 ABI for badge minting
    this.contractABI = [
      'function mint(address to, string memory tokenURI) public returns (uint256)',
      'function balanceOf(address owner) public view returns (uint256)',
      'function tokenURI(uint256 tokenId) public view returns (string)',
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
    ];
  }

  /**
   * Mints a VERIFIED_HUMAN badge for an agent
   * @param agentId - Unique identifier for the agent
   * @param metadata - Badge metadata
   * @returns Minted badge information
   */
  async mintVerifiedHumanBadge(agentId: string, metadata?: BadgeMetadata): Promise<MintedBadge> {
    const wallet = await this.walletManager.loadWallet(agentId);
    const address = await wallet.getAddress();
    
    const defaultMetadata: BadgeMetadata = {
      name: 'VERIFIED_HUMAN Badge',
      description: 'This badge certifies that the holder is a verified human-backed Copilot agent',
      attributes: [
        { trait_type: 'Badge Type', value: 'VERIFIED_HUMAN' },
        { trait_type: 'Agent ID', value: agentId },
        { trait_type: 'Issue Date', value: new Date().toISOString() }
      ]
    };

    const badgeMetadata = { ...defaultMetadata, ...metadata };
    const tokenURI = this.createTokenURI(badgeMetadata);

    // In a real implementation, this would interact with a deployed smart contract
    // For now, we simulate the minting process
    const simulatedTxHash = this.generateSimulatedTxHash(agentId);
    const simulatedTokenId = this.generateTokenId(address);

    return {
      tokenId: simulatedTokenId,
      owner: address,
      transactionHash: simulatedTxHash,
      badgeType: 'VERIFIED_HUMAN',
      timestamp: Date.now()
    };
  }

  /**
   * Mints a badge on-chain (when contract is deployed)
   * @param agentId - Unique identifier for the agent
   * @param tokenURI - Token URI pointing to metadata
   * @returns Transaction receipt
   */
  async mintBadgeOnChain(agentId: string, tokenURI: string): Promise<ethers.TransactionReceipt | null> {
    if (this.contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Contract not deployed. Use mintVerifiedHumanBadge for simulation.');
    }

    const wallet = await this.walletManager.loadWallet(agentId);
    const contract = new ethers.Contract(this.contractAddress, this.contractABI, wallet);
    
    const tx = await contract.mint(await wallet.getAddress(), tokenURI);
    const receipt = await tx.wait();
    
    return receipt;
  }

  /**
   * Checks if an agent has a VERIFIED_HUMAN badge
   * @param agentId - Unique identifier for the agent
   * @returns True if agent has badge
   */
  async hasBadge(agentId: string): Promise<boolean> {
    if (this.contractAddress === '0x0000000000000000000000000000000000000000') {
      // In simulation mode, check if wallet exists as a proxy for badge ownership
      return this.walletManager.walletExists(agentId);
    }

    const wallet = await this.walletManager.loadWallet(agentId);
    const contract = new ethers.Contract(
      this.contractAddress,
      this.contractABI,
      this.walletManager.getProvider()
    );
    
    const balance = await contract.balanceOf(await wallet.getAddress());
    return balance > 0n;
  }

  /**
   * Creates a token URI from badge metadata
   * @param metadata - Badge metadata
   * @returns Token URI (data URI or IPFS hash)
   */
  private createTokenURI(metadata: BadgeMetadata): string {
    // In production, this would upload to IPFS and return the hash
    // For now, we create a data URI
    const jsonMetadata = JSON.stringify(metadata);
    const base64Metadata = Buffer.from(jsonMetadata).toString('base64');
    return `data:application/json;base64,${base64Metadata}`;
  }

  /**
   * Generates a simulated transaction hash
   * @param agentId - Unique identifier for the agent
   * @returns Simulated transaction hash
   */
  private generateSimulatedTxHash(agentId: string): string {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(`${agentId}-${Date.now()}`));
    return hash;
  }

  /**
   * Generates a unique token ID
   * @param address - Owner address
   * @returns Token ID
   */
  private generateTokenId(address: string): string {
    const id = ethers.keccak256(ethers.toUtf8Bytes(`${address}-${Date.now()}`));
    return BigInt(id).toString();
  }

  /**
   * Sets the contract address (for when contract is deployed)
   * @param address - Smart contract address
   */
  setContractAddress(address: string): void {
    this.contractAddress = address;
  }

  /**
   * Gets the current contract address
   * @returns Contract address
   */
  getContractAddress(): string {
    return this.contractAddress;
  }
}
