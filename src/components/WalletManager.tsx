import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, QrCode } from "lucide-react";
import { generateMnemonic } from "bip39";
import { Alert, AlertDescription } from "./ui/alert";
import { useRecoilValue, useRecoilState } from "recoil";
import { currency } from "../app/store/currency";
import QRCode from "react-qr-code";

interface Wallet {
  id: string;
  publicKey: string;
  type: "solana" | "ethereum";
  createdAt: string;
}

const WalletCard = ({
  wallet,
  onCopy,
}: {
  wallet: Wallet;
  onCopy: (text: string, id: string) => void;
}) => {
  const [showQR, setShowQR] = useState(false);

  const getExplorerUrl = (type: string, address: string) => {
    return type === "solana"
      ? `https://explorer.solana.com/address/${address}`
      : `https://etherscan.io/address/${address}`;
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">{wallet.type} Wallet</span>
          <span className="text-sm text-gray-500">
            {new Date(wallet.createdAt).toLocaleDateString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
            <span className="font-mono text-sm truncate">
              {wallet.publicKey}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(wallet.publicKey, wallet.id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open(
                    getExplorerUrl(wallet.type, wallet.publicKey),
                    "_blank"
                  )
                }
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {showQR && (
            <div className="flex justify-center p-4 bg-white">
              <QRCode value={wallet.publicKey} size={200} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const WalletList = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const currencyState = useRecoilValue(currency);

  useEffect(() => {
    fetchWallets();
  }, [currencyState.name]);

  const fetchWallets = async () => {
    try {
      const response = await fetch("/api/wallet/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch wallets");
      const data = await response.json();
      const filteredWallets = data.wallets.filter(
        (wallet: Wallet) => wallet.type === currencyState.name
      );
      setWallets(filteredWallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">
        Your {currencyState.name} Wallets
      </h2>
      {wallets.map((wallet) => (
        <WalletCard key={wallet.id} wallet={wallet} onCopy={copyToClipboard} />
      ))}
    </div>
  );
};

const WalletManager = () => {
  const [currencyState, setCurrencyState] = useRecoilState(currency);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
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
    setIsGenerating(true);
    setError("");

    try {
      // Use the provided seed phrase if available, otherwise generate a new one
      const mnemonic = seedPhrase || generateMnemonic();

      const response = await fetch("/api/wallet/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          seedPhrase: seedPhrase,
          walletType: currencyState.name,
          label: `${currencyState.name}-${Math.floor(Math.random() * 1000000)}`,
        }),
      });

      if (!response.ok) throw new Error("Failed to store wallet");
      await response.json();
    } catch (error) {
      console.error("Error storing wallet:", error);
      setError("Failed to store wallet. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-2/3">
        <Card>
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
        <WalletList />
      </div>
    </div>
  );
};

export default WalletManager;
