// app/api/solana/balance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_CLUSTERS = {
  devnet: process.env.SOLANA_DEVNET_URL || "https://api.devnet.solana.com",
  mainnet: process.env.SOLANA_MAINNET_URL || "https://api.mainnet-beta.solana.com",
} as const;

type SolanaNetwork = keyof typeof SOLANA_CLUSTERS;

export async function POST(request: NextRequest) {
  try {
    const { publicKey, network } = await request.json();

    // Validate required fields
    if (!publicKey || !network) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          details: {
            publicKey: !publicKey ? "Public key is required" : null,
            network: !network ? "Network is required" : null,
          },
        },
        { status: 400 }
      );
    }

    // Validate network
    if (!Object.keys(SOLANA_CLUSTERS).includes(network)) {
      return NextResponse.json(
        {
          error: `Invalid network. Must be one of: ${Object.keys(SOLANA_CLUSTERS).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Connect to Solana cluster
    const connection = new Connection(SOLANA_CLUSTERS[network as SolanaNetwork]);
    const pubKey = new PublicKey(publicKey);

    // Fetch balance
    const balance = await connection.getBalance(pubKey);

    // Convert lamports to SOL (1 SOL = 1e9 lamports)
    const solBalance = balance / 1e9;

    return NextResponse.json({
      success: true,
      balance: solBalance,
    });
  } catch (error: any) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      {
        error: "Error fetching balance",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}