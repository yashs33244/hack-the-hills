"use client";

import Link from "next/link";
import WalletManager from "@/components/WalletManager";
import { ArrowLeft } from "lucide-react";

export default function WalletSection() {
  return (
    <main className="flex-grow container mx-auto px-16 py-12">
      <div className="flex items-center mb-8">
        <Link
          href="/wallet"
          className="text-white hover:text-gray-300 transition-colors mr-4"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <p className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Your Wallets
        </p>
      </div>
      <WalletManager />

      <div className="grid md:grid-cols-3 gap-8"></div>
    </main>
  );
}
