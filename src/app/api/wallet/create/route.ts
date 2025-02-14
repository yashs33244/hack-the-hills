import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { generateMnemonic } from 'bip39';
import { Keypair } from '@solana/web3.js';
import { ethers } from 'ethers';
import { derivePath } from 'ed25519-hd-key';

const prisma = new PrismaClient();

interface DecodedToken {
  userId: string;
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decodedToken: DecodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as DecodedToken;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { seedPhrase, walletType, label } = await req.json();
    const finalSeedPhrase = seedPhrase || generateMnemonic();
    let publicKey: string;
    
    if (walletType === 'solana') {
      const mnemonic = ethers.Mnemonic.fromPhrase(finalSeedPhrase);
      const seed = await mnemonic.computeSeed();
      const path = "m/44'/501'/0'/0'";
      const derivedSeed = derivePath(path, Buffer.from(seed).toString('hex')).key;
      const keypair = Keypair.fromSeed(derivedSeed);
      publicKey = keypair.publicKey.toBase58();
    } else if (walletType === 'ethereum') {
      const wallet = ethers.Wallet.fromPhrase(finalSeedPhrase);
      publicKey = wallet.address;
    } else {
      return NextResponse.json({ error: 'Invalid wallet type' }, { status: 400 });
    }

    const existingWallet = await prisma.wallet.findFirst({
      where: {
        label: label,
        publicKey: publicKey,
        userId: decodedToken.userId
      }
    });
    
    if (existingWallet) {
      return NextResponse.json({
        success: true,
        wallet: existingWallet,
        seedPhrase: finalSeedPhrase,
        message: 'Wallet already exists'
      });
    }

    const wallet = await prisma.wallet.create({
      data: {
        publicKey,
        type: walletType,
        userId: decodedToken.userId,
        label: label
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