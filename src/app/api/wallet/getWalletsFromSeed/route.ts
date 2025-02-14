import { NextRequest, NextResponse } from "next/server";
import { scanForExistingWallets, WalletType, NetworkType } from "@/utils/wallet";

export async function POST(request: NextRequest) {
  try {
    const { seed, type, network = "devnet", startIndex = 0 } = await request.json();
    
    if (!seed || !type) {
      return NextResponse.json(
        { error: "Seed phrase and wallet type are required" },
        { status: 400 }
      );
    }

    if (type !== "ethereum" && type !== "solana") {
      return NextResponse.json(
        { error: "Invalid wallet type. Must be 'ethereum' or 'solana'" },
        { status: 400 }
      );
    }

    if (network !== "mainnet" && network !== "devnet") {
      return NextResponse.json(
        { error: "Invalid network. Must be 'mainnet' or 'devnet'" },
        { status: 400 }
      );
    }

    const wallets = await scanForExistingWallets(
      seed,
      type as WalletType,
      network as NetworkType,
      startIndex
    );
    
    return NextResponse.json(wallets);
  } catch (error: any) {
    console.error("Wallet scanning error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scan wallets" },
      { status: 500 }
    );
  }
}