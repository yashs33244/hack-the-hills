import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";
import bs58 from "bs58";
import QRCode from "react-qr-code";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderPublicKey: string;
  amount: number;
}

export const TransactionModal = ({
  isOpen,
  onClose,
  senderPublicKey,
  amount,
}: TransactionModalProps) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [status, setStatus] = useState<
    "input" | "awaiting" | "processing" | "completed" | "error"
  >("input");
  const [errorMessage, setErrorMessage] = useState("");
  const [signatureInput, setSignatureInput] = useState("");
  const [publicKeyInput, setPublicKeyInput] = useState("");
  const [transactionQRData, setTransactionQRData] = useState("");

  useEffect(() => {
    if (!isOpen || status !== "awaiting") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("error");
          setErrorMessage("Transaction timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, status]);

  const validatePublicKey = (key: string): boolean => {
    try {
      new PublicKey(key);
      return true;
    } catch {
      return false;
    }
  };

  const handleStartTransaction = () => {
    if (!validatePublicKey(recipientAddress)) {
      setErrorMessage("Invalid recipient address");
      return;
    }

    const partialTransaction = {
      instructions: [
        {
          programId: "11111111111111111111111111111111",
          accounts: [
            {
              pubkey: senderPublicKey,
              isSigner: true,
              isWritable: true,
            },
            {
              pubkey: recipientAddress,
              isSigner: false,
              isWritable: true,
            },
          ],
          data: bs58.encode(Buffer.from([2, ...new Array(8).fill(amount)])),
        },
      ],
      signerPublicKey: senderPublicKey,
    };

    setTransactionQRData(JSON.stringify(partialTransaction));
    setStatus("awaiting");
  };

  const handleSignedTransaction = async () => {
    try {
      const signatureData = {
        signature: signatureInput,
        publicKey: publicKeyInput,
      };

      setStatus("processing");
      const connection = new Connection(clusterApiUrl("devnet"));
      const { blockhash } = await connection.getRecentBlockhash();

      const transaction = new Transaction({
        feePayer: new PublicKey(signatureData.publicKey),
        recentBlockhash: blockhash,
      }).add(
        new TransactionInstruction({
          programId: new PublicKey("11111111111111111111111111111111"),
          keys: [
            {
              pubkey: new PublicKey(senderPublicKey),
              isSigner: true,
              isWritable: true,
            },
            {
              pubkey: new PublicKey(recipientAddress),
              isSigner: false,
              isWritable: true,
            },
          ],
          data: Buffer.from([2, ...new Array(8).fill(amount)]),
        })
      );

      transaction.addSignature(
        new PublicKey(signatureData.publicKey),
        bs58.decode(signatureData.signature)
      );

      const txid = await connection.sendRawTransaction(transaction.serialize());
      await connection.confirmTransaction(txid);

      setStatus("completed");
      setTimeout(onClose, 2000);
    } catch (error: any) {
      console.error("Error completing transaction:", error);
      setStatus("error");
      setErrorMessage(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solana Transaction (Devnet)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {status === "input" && (
            <div className="space-y-4">
              <Input
                placeholder="Enter recipient's public key"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
              <Button className="w-full" onClick={handleStartTransaction}>
                Start Transaction
              </Button>
            </div>
          )}

          {status === "awaiting" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="mb-2">
                  Time remaining: {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </p>
                <p className="text-sm text-gray-500">
                  Scan QR code to view transaction details:
                </p>
              </div>

              <div className="flex justify-center p-4 bg-white">
                <QRCode
                  value={transactionQRData}
                  size={200}
                  level="M"
                  className="mx-auto"
                />
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Signature (base58 encoded)"
                  value={signatureInput}
                  onChange={(e) => setSignatureInput(e.target.value)}
                />

                <Input
                  placeholder="Signer Public Key"
                  value={publicKeyInput}
                  onChange={(e) => setPublicKeyInput(e.target.value)}
                />

                <Button
                  className="w-full"
                  onClick={handleSignedTransaction}
                  disabled={!signatureInput || !publicKeyInput}
                >
                  Submit Signed Transaction
                </Button>
              </div>
            </div>
          )}

          {status === "processing" && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p>Processing transaction...</p>
            </div>
          )}

          {status === "completed" && (
            <div className="flex flex-col items-center justify-center space-y-2 text-green-600">
              <CheckCircle className="h-8 w-8" />
              <p>Transaction completed successfully!</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center space-y-2 text-red-600">
              <AlertCircle className="h-8 w-8" />
              <p>Error: {errorMessage}</p>
              <Button variant="outline" onClick={() => setStatus("input")}>
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
