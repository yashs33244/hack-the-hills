import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { mnemonicToSeed, generateMnemonic } from 'bip39';
import { Keypair } from '@solana/web3.js';
import { Wallet } from 'ethers';
import * as ed25519 from 'ed25519-hd-key';

const prisma = new PrismaClient();

interface DecodedToken {
  userId: string;
}

export async function POST(req: Request) {
  try {
    // Verify authentication
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    let decodedToken: DecodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as DecodedToken;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { seedPhrase, walletType } = await req.json();

    // Generate new seed phrase if none provided
    const finalSeedPhrase = seedPhrase || generateMnemonic();

    // Generate wallet based on type
    let publicKey: string;
    
    if (walletType === 'solana') {
      const seed = await mnemonicToSeed(finalSeedPhrase);
      const solanaSeed = seed.toString('hex');
      const derivedSeed = ed25519.derivePath("m/44'/501'/0'/0'", solanaSeed).key;
      const solanaKeypair = Keypair.fromSeed(derivedSeed);
      publicKey = solanaKeypair.publicKey.toBase58();
    } else if (walletType === 'ethereum') {
      const ethWallet = Wallet.fromPhrase(finalSeedPhrase);
      publicKey = ethWallet.address;
    } else {
      return NextResponse.json({ error: 'Invalid wallet type' }, { status: 400 });
    }

    const existingWallet = await prisma.wallet.findFirst({
      where: {
        publicKey,
        type: walletType,
        userId: decodedToken.userId
      }
    });
    
    if (existingWallet) {
      // Return the existing wallet
      return NextResponse.json({
        success: true,
        wallet: existingWallet,
        seedPhrase: finalSeedPhrase,
        message: 'Wallet already exists'
      });
    }

    // Create a new wallet if it doesn't exist
    const walletCount = await prisma.wallet.count({
      where: {
        type: walletType,
        userId: decodedToken.userId
      }
    });
    
    const wallet = await prisma.wallet.create({
      data: {
        publicKey,
        type: walletType,
        userId: decodedToken.userId,
        label: `Wallet ${walletCount + 1}`
      }
    });

    return NextResponse.json({
      success: true,
      wallet,
      seedPhrase: finalSeedPhrase
    });

  } catch (error) {
    console.error('Error storing wallet:', error);
    return NextResponse.json(
      { error: 'Failed to store wallet information' },
      { status: 500 }
    );
  }
}
