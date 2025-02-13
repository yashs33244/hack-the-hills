import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const userId = await getUserFromToken(req);
    const body = await req.json();
    const { publicKey, type } = body;

    const wallet = await prisma.wallet.create({
      data: {
        publicKey,
        type,
        userId: userId as string,
      },
    });

    return NextResponse.json(wallet);
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserFromToken(req);
    
    const wallets = await prisma.wallet.findMany({
      where: {
        userId: userId as string,
      },
    });

    return NextResponse.json(wallets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}