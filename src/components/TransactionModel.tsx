// TransactionModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: {
    publicKey: string;
    type: "solana" | "ethereum";
  };
  recipientAddress: string;
  amount: number;
}

export const TransactionModal = ({
  isOpen,
  onClose,
  wallet,
  recipientAddress,
  amount,
}: TransactionModalProps) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [qrData, setQrData] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [status, setStatus] = useState<
    "preparing" | "awaiting" | "completing" | "completed" | "error"
  >("preparing");

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Generate transaction data
    generateTransactionData();

    return () => clearInterval(timer);
  }, [isOpen]);

  const generateTransactionData = async () => {
    try {
      const partialTransaction = {
        instructions: [
          {
            programId: "11111111111111111111111111111111",
            accounts: [
              {
                pubkey: wallet.publicKey,
                isSigner: true,
                isWritable: true,
              },
              {
                pubkey: recipientAddress,
                isSigner: false,
                isWritable: true,
              },
            ],
            data: bs58.encode(Buffer.from([2, ...new Array(8).fill(amount)])), // Example encoding
          },
        ],
        signerPublicKey: wallet.publicKey,
      };

      setQrData(JSON.stringify({ partialTransaction }));
      setStatus("awaiting");
    } catch (error) {
      console.error("Error generating transaction:", error);
      setStatus("error");
    }
  };

  const handleSignatureSubmit = async (coldWalletResponse: {
    signature: string;
    publicKey: string;
  }) => {
    try {
      setStatus("completing");
      const connection = new Connection("https://api.mainnet-beta.solana.com");
      const { blockhash } = await connection.getRecentBlockhash();

      const parsedQrData = JSON.parse(qrData);

      const transaction = new Transaction({
        feePayer: new PublicKey(coldWalletResponse.publicKey),
        recentBlockhash: blockhash,
      }).add(
        new TransactionInstruction({
          programId: new PublicKey("11111111111111111111111111111111"),
          keys: parsedQrData.partialTransaction.instructions[0].accounts,
          data: Buffer.from(
            bs58.decode(parsedQrData.partialTransaction.instructions[0].data)
          ),
        })
      );

      transaction.addSignature(
        new PublicKey(coldWalletResponse.publicKey),
        bs58.decode(coldWalletResponse.signature)
      );

      const txid = await connection.sendRawTransaction(transaction.serialize());
      await connection.confirmTransaction(txid);

      setStatus("completed");
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error("Error completing transaction:", error);
      setStatus("error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <p>
              Time remaining: {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </p>
          </div>

          {status === "awaiting" && qrData && (
            <div className="flex justify-center p-4 bg-white">
              <QRCode value={qrData} size={200} />
            </div>
          )}

          {status === "completing" && (
            <div className="text-center">
              <p>Processing transaction...</p>
            </div>
          )}

          {status === "completed" && (
            <div className="text-center text-green-600">
              <p>Transaction completed successfully!</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center text-red-600">
              <p>An error occurred. Please try again.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
