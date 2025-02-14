import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Camera,
  ExternalLink,
} from "lucide-react";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";
import QRCode from "react-qr-code";
import { Scanner } from "@yudiel/react-qr-scanner";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOLANA_EXPLORER_URL = "https://solscan.io/tx";
const SOLANA_RPC_URL = "https://api.devnet.solana.com";

export const TransactionModal = ({
  isOpen,
  onClose,
}: TransactionModalProps) => {
  const [step, setStep] = useState<
    "input" | "qr" | "processing" | "completed" | "error"
  >("input");
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const validatePublicKey = (key: string): boolean => {
    try {
      new PublicKey(key);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }
    if (!validatePublicKey(recipientAddress)) {
      setErrorMessage("Invalid recipient address");
      return;
    }
    setStep("qr");
  };

  const getQRData = () => {
    return JSON.stringify({
      recipient: recipientAddress,
      amount: amount,
    });
  };

  const handleQRScan = (data: string) => {
    try {
      const scannedData = JSON.parse(data);
      if (scannedData.signature && scannedData.publicKey) {
        handleTransaction(scannedData);
      }
    } catch (error) {
      setErrorMessage("Invalid QR code data");
    }
  };

  const handleTransaction = async (coldWalletResponse: {
    signature: string;
    publicKey: string;
  }) => {
    try {
      setStep("processing");

      const connection = new Connection(SOLANA_RPC_URL);
      const { blockhash } = await connection.getRecentBlockhash();

      const transaction = new Transaction({
        feePayer: new PublicKey(coldWalletResponse.publicKey),
        recentBlockhash: blockhash,
      }).add(
        new TransactionInstruction({
          programId: new PublicKey("11111111111111111111111111111111"),
          keys: [
            {
              pubkey: new PublicKey(coldWalletResponse.publicKey),
              isSigner: true,
              isWritable: true,
            },
            {
              pubkey: new PublicKey(recipientAddress),
              isSigner: false,
              isWritable: true,
            },
          ],
          data: Buffer.from([2, ...new Array(8).fill(Number(amount))]),
        })
      );

      transaction.addSignature(
        new PublicKey(coldWalletResponse.publicKey),
        bs58.decode(coldWalletResponse.signature)
      );

      const txid = await connection.sendRawTransaction(transaction.serialize());
      await connection.confirmTransaction(txid);

      setTransactionId(txid);
      setStep("completed");
    } catch (error: any) {
      console.error("Error completing transaction:", error);
      setStep("error");
      setErrorMessage(error.message);
    }
  };

  const resetModal = () => {
    setStep("input");
    setAmount("");
    setRecipientAddress("");
    setErrorMessage("");
    setShowScanner(false);
    setTransactionId(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solana Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === "input" && (
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter amount in SOL"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
              <Input
                placeholder="Enter recipient's public key"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
              <Button className="w-full" onClick={handleInputSubmit}>
                Generate QR Code
              </Button>
            </div>
          )}

          {step === "qr" && (
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-white">
                <QRCode
                  value={getQRData()}
                  size={200}
                  level="M"
                  className="mx-auto"
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">Transaction Details:</p>
                <p>Amount: {amount} SOL</p>
                <p>
                  Recipient: {recipientAddress.slice(0, 4)}...
                  {recipientAddress.slice(-4)}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => setShowScanner(true)}
                startIcon={<Camera className="w-4 h-4 mr-2" />}
              >
                Scan Response QR
              </Button>

              {showScanner && (
                <div className="mt-4">
                  <Scanner
                    onDecode={handleQRScan}
                    onError={(error) => console.log(error?.message)}
                  />
                </div>
              )}
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p>Processing transaction...</p>
            </div>
          )}

          {step === "completed" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <p className="text-green-600">
                Transaction completed successfully!
              </p>
              {transactionId && (
                <a
                  href={`${SOLANA_EXPLORER_URL}/${transactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:text-blue-600"
                >
                  View on Explorer
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center space-y-2 text-red-600">
              <AlertCircle className="h-8 w-8" />
              <p>Error: {errorMessage}</p>
              <Button variant="outline" onClick={resetModal}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
