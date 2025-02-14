import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateMnemonic } from "bip39";
import { Alert, AlertDescription } from "./ui/alert";
import { useRecoilValue, useRecoilState } from "recoil";
import { currency } from "../app/store/currency";
import WalletsFromSeed from "./WalletsFromSeed";
import WalletList from "./WalletList";
import QRDialog from "./QRDialog";

const WalletManager = () => {
  const [currencyState, setCurrencyState] = useRecoilState(currency);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [walletLabel, setWalletLabel] = useState("");
  const [newWalletId, setNewWalletId] = useState<string | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [walletDetails, setWalletDetails] = useState<{
    publicKey: string;
    privateKey: string;
    seedPhrase: string;
  } | null>(null);

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

      setNewWalletId(data.wallet.id);
      setWalletDetails({
        publicKey: data.wallet.publicKey,
        privateKey: data.privateKey,
        seedPhrase: data.seedPhrase,
      });
      setIsQRDialogOpen(true);
      setWalletLabel(""); // Reset the label after successful creation
    } catch (error) {
      console.error("Error storing wallet:", error);
      setError("Failed to store wallet. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-4/4">
        <Card className="bg-white max-w-xl">
          <CardHeader>
            <CardTitle>Generate New {currencyState.name} Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 text-black mb-2">
                Wallet Label
              </label>
              <input
                type="text"
                className="block w-full p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Enter a name for your wallet"
                value={walletLabel}
                onChange={(e) => setWalletLabel(e.target.value)}
              />
              <label className="block text-sm font-medium text-gray-700 text-black">
                Seed Phrase
              </label>
              <div className="mt-1 p-4 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-700 break-words">
                  {seedPhrase}
                </p>
              </div>
              <textarea
                className="mt-4 block w-full p-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Enter your seed phrase or leave blank to generate a new one"
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleStoreWallet}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating..."
                : `Generate ${currencyState.name} Wallet`}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="w-1/3">
        <WalletList newWalletId={newWalletId} />
        <div className="mt-4"></div>
      </div>
      <WalletsFromSeed />

      {walletDetails && (
        <QRDialog
          isOpen={isQRDialogOpen}
          onClose={() => setIsQRDialogOpen(false)}
          publicKey={walletDetails.publicKey}
          privateKey={walletDetails.privateKey}
          seedPhrase={walletDetails.seedPhrase}
        />
      )}
    </div>
  );
};

export default WalletManager;
