import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { useTransaction } from "@/hooks/useTransaction";
import { TransactionModal } from "./TransactionModel";

export interface Wallet {
  id: string;
  publicKey: string;
  privateKey: string;
  seedPhrase: string;
  type: "solana" | "ethereum";
  createdAt: string;
  label: string;
}

const WalletCard = ({
  wallet,
  onCopy,
  isNewWallet,
}: {
  wallet: Wallet;
  onCopy: (text: string, id: string) => void;
  isNewWallet: boolean;
}) => {
  const [showQR, setShowQR] = useState(false);
  const [showInitialQR, setShowInitialQR] = useState(isNewWallet);
  const [amount, setAmount] = useState<number | null>(null);
  const [isAmountInputVisible, setIsAmountInputVisible] = useState(false);

  const {
    isTransactionModalOpen,
    setIsTransactionModalOpen,
    recipientAddress,
    initiateTransaction,
  } = useTransaction({ wallet });

  useEffect(() => {
    if (isNewWallet) {
      const timer = setTimeout(() => {
        setShowInitialQR(false);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [isNewWallet]);

  const getExplorerUrl = (type: string, address: string) => {
    return type === "solana"
      ? `https://explorer.solana.com/address/${address}`
      : `https://etherscan.io/address/${address}`;
  };

  const handleTransactionClick = () => {
    setIsTransactionModalOpen(true);
    setIsAmountInputVisible(true);
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount !== null) {
      setIsTransactionModalOpen(true);
    }
  };

  const qrValue = JSON.stringify({
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
    seedPhrase: wallet.seedPhrase,
  });

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">
            {wallet.label} ({wallet.type} Wallet)
          </span>
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
          {(showQR || showInitialQR) && (
            <div className="flex justify-center p-4 bg-white">
              <QRCode value={qrValue} size={200} />
            </div>
          )}

          <Button className="w-full" onClick={handleTransactionClick}>
            New Transaction
          </Button>
        </div>
      </CardContent>

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        senderPublicKey={wallet.publicKey}
        amount={amount || 0}
      />
    </Card>
  );
};

export default WalletCard;
