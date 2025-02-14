// pages/api/solana/balance.ts
import { Connection, PublicKey } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

const SOLANA_CLUSTERS = {
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com'
} as const;

type SolanaNetwork = keyof typeof SOLANA_CLUSTERS;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins (or specify your frontend URL)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicKey, network } = req.body;

    if (!publicKey || !network) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: {
          publicKey: !publicKey ? 'Public key is required' : null,
          network: !network ? 'Network is required' : null
        }
      });
    }

    if (!Object.keys(SOLANA_CLUSTERS).includes(network)) {
      return res.status(400).json({ 
        error: `Invalid network. Must be one of: ${Object.keys(SOLANA_CLUSTERS).join(', ')}`
      });
    }

    const connection = new Connection(SOLANA_CLUSTERS[network as SolanaNetwork]);
    const pubKey = new PublicKey(publicKey);
    const balance = await connection.getBalance(pubKey);
    
    // Convert lamports to SOL (1 SOL = 1e9 lamports)
    const solBalance = balance / 1e9;

    return res.status(200).json({ 
      success: true,
      balance: solBalance 
    });

  } catch (error) {
    console.error('Error fetching balance:', error);
    return res.status(500).json({ 
      error: 'Error fetching balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}