import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface DecodedToken {
    userId: string;
}

export async function DELETE(req: Request) {
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

        // Get wallet ID from the URL
        const url = new URL(req.url);
        const walletId = url.searchParams.get('id');

        if (!walletId) {
            return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 });
        }

        // Verify wallet belongs to user before deleting
        const wallet = await prisma.wallet.findFirst({
            where: {
                id: walletId,
                userId: decodedToken.userId,
            },
        });

        if (!wallet) {
            return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
        }

        // Delete the wallet
        await prisma.wallet.delete({
            where: {
                id: walletId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting wallet:', error);
        return NextResponse.json(
            { error: 'Failed to delete wallet' },
            { status: 500 }
        );
    }
} 