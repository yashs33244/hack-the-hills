import { ethers } from "ethers";
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import { mnemonicToSeed } from "bip39";

export type WalletType = "ethereum" | "solana";
export type NetworkType = "mainnet" | "devnet";

export interface WalletInfo {
  address: string;
  type: WalletType;
  balance: string;
  index: number;
}

const RPC_URLS = {
  ethereum: {
    mainnet: process.env.ETH_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY",
    devnet: "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
  },
  solana: {
    mainnet: process.env.SOL_RPC_URL || "https://api.mainnet-beta.solana.com",
    devnet: "https://api.devnet.solana.com"
  }
};

export async function scanForExistingWallets(
  seedPhrase: string,
  type: WalletType,
  network: NetworkType = "devnet",
  startIndex: number = 0,
  maxAccounts: number = 10
): Promise<WalletInfo[]> {
  try {
    if (!seedPhrase) {
      throw new Error("Seed phrase is required");
    }

    const rpcUrl = RPC_URLS[type][network];
    
    switch (type) {
      case "ethereum":
        return scanEthereumWallets(seedPhrase, rpcUrl, startIndex, maxAccounts);
      case "solana":
        return scanSolanaWallets(seedPhrase, rpcUrl, startIndex, maxAccounts);
      default:
        throw new Error("Unsupported wallet type");
    }
  } catch (error) {
    console.error("Error scanning wallets:", error);
    throw error;
  }
}

async function scanEthereumWallets(
  seedPhrase: string,
  rpcUrl: string,
  startIndex: number,
  maxAccounts: number
): Promise<WalletInfo[]> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallets: WalletInfo[] = [];

  try {
    for (let i = startIndex; i < startIndex + maxAccounts; i++) {
      const hdNode = ethers.HDNodeWallet.fromPhrase(seedPhrase, undefined, `m/44'/60'/0'/0/${i}`);
      const balance = await provider.getBalance(hdNode.address);

      wallets.push({
        address: hdNode.address,
        type: "ethereum",
        balance: ethers.formatEther(balance),
        index: i
      });
    }
  } catch (error) {
    console.error("Error scanning Ethereum wallets:", error);
    throw new Error("Failed to scan Ethereum wallets");
  }

  return wallets;
}

async function scanSolanaWallets(
  seedPhrase: string,
  rpcUrl: string,
  startIndex: number,
  maxAccounts: number
): Promise<WalletInfo[]> {
  const connection = new Connection(rpcUrl);
  const wallets: WalletInfo[] = [];

  try {
    const seed = await mnemonicToSeed(seedPhrase);
    const seedHex = Buffer.from(seed).toString('hex');

    for (let i = startIndex; i < startIndex + maxAccounts; i++) {
      const path = `m/44'/501'/${i}'/0'`;
      const derivedSeed = derivePath(path, seedHex).key;
      const keypair = Keypair.fromSeed(derivedSeed);
      const publicKey = new PublicKey(keypair.publicKey);
      const balance = await connection.getBalance(publicKey);

      wallets.push({
        address: publicKey.toString(),
        type: "solana",
        balance: (balance / LAMPORTS_PER_SOL).toString(),
        index: i
      });
    }
  } catch (error) {
    console.error("Error scanning Solana wallets:", error);
    throw new Error("Failed to scan Solana wallets");
  }

  return wallets;
}