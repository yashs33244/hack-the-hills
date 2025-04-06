import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateMnemonic } from "bip39";
import { Alert, AlertDescription } from "./ui/alert";
import { useRecoilValue, useRecoilState } from "recoil";
import { currency } from "../app/store/currency";
import WalletsFromSeed from "./WalletsFromSeed";
import QRDialog from "./QRDialog";
import FaceAuthEncryption from "./FaceAuthEncryption";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";

interface WalletDetails {
  publicKey: string;
  privateKey: string;
  seedPhrase: string;
}

const WalletManager = () => {
  const [currencyState, setCurrencyState] = useRecoilState(currency);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [walletLabel, setWalletLabel] = useState("");
  const [newWalletId, setNewWalletId] = useState<string | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isFaceAuthOpen, setIsFaceAuthOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(
    null
  );

  useEffect(() => {
    if (currencyState.phrase) {
      setSeedPhrase(currencyState.phrase);
    } else {
      const mnemonic = generateMnemonic();
      setSeedPhrase(mnemonic);
    }

    if (currencyState.name) {
      localStorage.setItem("selectedCurrency", JSON.stringify(currencyState));
    }
  }, [currencyState]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency");
    if (savedCurrency && !currencyState.name) {
      setCurrencyState(JSON.parse(savedCurrency));
    }
  }, []);

  const handleStoreWallet = async () => {
    if (!walletLabel.trim()) {
      setError("Please enter a label for your wallet");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const mnemonic = seedPhrase || generateMnemonic();

      const response = await fetch("/api/wallet/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          seedPhrase: mnemonic,
          walletType: currencyState.name,
          label: walletLabel.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to store wallet");
      }

      setWalletDetails({
        publicKey: data.wallet.publicKey,
        privateKey: data.privateKey,
        seedPhrase: data.seedPhrase,
      });
      setIsQRDialogOpen(true);
      setWalletLabel(""); // Reset the label after successful creation
      setSeedPhrase(""); // Reset the seed phrase input
    } catch (error) {
      console.error("Error storing wallet:", error);
      setError("Failed to store wallet. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQRDialogClose = () => {
    setIsQRDialogOpen(false);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmLocalStorage = () => {
    setIsConfirmDialogOpen(false);
    setIsFaceAuthOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-3 bg-black/50 border-purple-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Create New {currencyState.name} Wallet
              </h3>
              <p className="text-sm text-gray-400">
                Enter a label for your new wallet and optionally provide a seed
                phrase.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Enter wallet label"
                  value={walletLabel}
                  onChange={(e) => setWalletLabel(e.target.value)}
                  className="bg-black/30 border-purple-800 text-white placeholder:text-gray-500"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <div>
                <Input
                  placeholder="Enter seed phrase (optional)"
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  className="bg-black/30 border-purple-800 text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to generate a new seed phrase
                </p>
              </div>
              <Button
                onClick={handleStoreWallet}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:opacity-90 text-white"
              >
                {isGenerating ? "Creating..." : "Create Wallet"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <QRDialog
        open={isQRDialogOpen}
        onOpenChange={handleQRDialogClose}
        walletDetails={walletDetails}
      />

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Store Wallet Data Locally?</DialogTitle>
            <DialogDescription>
              Would you like to securely store your wallet's private key and
              seed phrase locally using face authentication? This will encrypt
              your data using AES-256-GCM with a key derived from your facial
              features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Skip
            </Button>
            <Button
              onClick={handleConfirmLocalStorage}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Secure with Face Auth
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FaceAuthEncryption
        open={isFaceAuthOpen}
        onOpenChange={setIsFaceAuthOpen}
        walletData={walletDetails}
        onEncryptionComplete={() => {
          // Handle completion (e.g., show success message)
          setWalletDetails(null);
        }}
      />
    </div>
  );
};

export default WalletManager;
