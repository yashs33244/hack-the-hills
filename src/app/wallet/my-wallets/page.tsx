'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, ExternalLink, Wallet, AlertTriangle, Key, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { truncateAddress } from '@/utils/truncateAddress';
import { motion } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { WalletList } from '@/components/WalletList';

interface Wallet {
    id: string;
    label: string | null;
    publicKey: string;
    type: string;
    balance?: string;
    createdAt: string;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function MyWalletsPage() {
    const router = useRouter();
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteWalletId, setDeleteWalletId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const fetchWallets = async () => {
        try {
            const response = await fetch('/api/wallet/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch wallets');
            }

            const data = await response.json();
            setWallets(data.wallets.map((wallet: Wallet) => ({
                ...wallet,
                balance: '0.0000' // Placeholder balance - you'll need to implement balance fetching
            })));
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load wallets. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            description: 'Copied to clipboard',
        });
    };

    const handleDeleteWallet = async () => {
        if (!deleteWalletId) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/wallet/delete?id=${deleteWalletId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete wallet');
            }

            toast({
                description: 'Wallet deleted successfully',
            });

            // Refresh the wallet list
            fetchWallets();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete wallet. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
            setDeleteWalletId(null);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 md:px-16 pt-24 pb-12 min-h-screen">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
                        <p className="text-gray-400">Loading your wallets...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-4 md:px-16 pt-24 pb-12 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Wallets</h1>
                    <Button onClick={() => router.push("/wallet/dashboard")}>
                        Create New Wallet
                    </Button>
                </div>

                <WalletList
                    wallets={wallets}
                    isLoading={loading}
                    onDelete={(id) => setDeleteWalletId(id)}
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteWalletId} onOpenChange={() => setDeleteWalletId(null)}>
                <AlertDialogContent className="bg-black/95 border-purple-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Wallet</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete this wallet? This action cannot be undone.
                            Make sure you have backed up your private key and seed phrase.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-transparent border-purple-800 text-white hover:bg-purple-800/50"
                            onClick={() => setDeleteWalletId(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={handleDeleteWallet}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Wallet'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 