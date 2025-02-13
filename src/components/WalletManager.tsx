import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { generateMnemonic } from "bip39";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { useRecoilValue } from "recoil";
import { currency } from "../app/store/currency";

interface Wallet {
  id: string;
  publicKey: string;
  type: "solana" | "ethereum";
  createdAt: string;
}

const WalletList = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await fetch("/api/wallet/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch wallets");
      const data = await response.json();
      setWallets(data.wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getExplorerUrl = (type: string, address: string) => {
    return type === "solana"
      ? `https://explorer.solana.com/address/${address}`
      : `https://etherscan.io/address/${address}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Your Wallets</h2>
      {wallets.map((wallet) => (
        <Card key={wallet.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="capitalize">{wallet.type} Wallet</span>
              <span className="text-sm text-gray-500">
                {new Date(wallet.createdAt).toLocaleDateString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-mono text-sm truncate">
                {wallet.publicKey}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.publicKey, wallet.id)}
                >
                  <Copy
                    className={`h-4 w-4 ${
                      copied === wallet.id ? "text-green-500" : ""
                    }`}
                  />
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const WalletManager = () => {
  const currencyState = useRecoilValue(currency);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [wordArray, setWordArray] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [customSeedPhrase, setCustomSeedPhrase] = useState(
    currencyState.phrase || ""
  );

  useEffect(() => {
    if (!customSeedPhrase) {
      generateNewWallet();
    } else {
      setSeedPhrase(customSeedPhrase);
      setWordArray(customSeedPhrase.split(" "));
    }
  }, [customSeedPhrase]);

  const generateNewWallet = () => {
    const newSeedPhrase = generateMnemonic();
    setSeedPhrase(newSeedPhrase);
    setWordArray(newSeedPhrase.split(" "));
  };

  const handleStoreWallet = async () => {
    if (!seedPhrase) return;
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/wallet/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          seedPhrase,
          walletType: currencyState.name,
        }),
      });

      if (!response.ok) throw new Error("Failed to store wallet");

      const data = await response.json();

      if (!customSeedPhrase) {
        generateNewWallet(); // Generate new seed phrase only if not using custom one
      }
    } catch (error) {
      console.error("Error storing wallet:", error);
      setError("Failed to store wallet. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate New {currencyState.name} Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          {!customSeedPhrase && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {wordArray.map((word, index) => (
                <div key={index} className="p-3 bg-gray-100 rounded-lg">
                  <span className="text-gray-500 mr-2">{index + 1}.</span>
                  <span className="font-medium">{word}</span>
                </div>
              ))}
            </div>
          )}
          {customSeedPhrase && (
            <div className="mb-6">
              <Input
                value={customSeedPhrase}
                readOnly
                className="w-full p-3 bg-gray-100 rounded-lg"
              />
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            {!customSeedPhrase && (
              <Button
                variant="outline"
                className="w-full"
                onClick={generateNewWallet}
                disabled={isGenerating}
              >
                Generate New Seed Phrase
              </Button>
            )}
            <Button
              className="w-full"
              onClick={handleStoreWallet}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating..."
                : `Create ${currencyState.name} Wallet`}
            </Button>
          </div>
        </CardContent>
      </Card>
      <WalletList />
    </div>
  );
};

export default WalletManager;
