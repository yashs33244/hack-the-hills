import { NextRequest, NextResponse } from "next/server";
import { scanForExistingWallets, WalletType } from "@/utils/wallet";

export async function POST(request: NextRequest) {
  try {
    const { seed, type, startIndex = 0, network = "devnet" } = await request.json();
    
    if (!seed || !type) {
      return NextResponse.json(
        { error: "Seed phrase and wallet type are required" },
        { status: 400 }
      );
    }

    const wallets = await scanForExistingWallets(
      seed,
      type as WalletType,
      network,
      startIndex
    );
    
    return NextResponse.json(wallets);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to scan wallets" },
      { status: 500 }
    );
  }
}
