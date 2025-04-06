import React, { useState, useRef } from "react";
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
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import QRCode from "react-qr-code";
import { QrReader } from "react-qr-reader";

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
  const [isScanning, setIsScanning] = useState(false);

  // Add refs to track transaction state
  const isProcessingRef = useRef(false);
  const processedTxIds = useRef(new Set<string>());

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

  // here this thing will be eliminated we dont need to scan the QR code
  // signed txn willl be sent to webhook

  const handleQRScan = async (result: string | null) => {
    if (!isScanning || !result || isProcessingRef.current) {
      return;
    }

    try {
      const scannedData = JSON.parse(result);
      if (scannedData.signed_transaction && scannedData.recipient) {
        setIsScanning(false); // Disable scanning before processing
        await handleSignedTransaction(scannedData);
      } else {
        console.error("Invalid QR code format");
        setErrorMessage("Invalid QR code format");
      }
    } catch (error) {
      console.error("QR Scan Error:", error);
      setErrorMessage("Invalid QR code data");
    }
  };

  // now get fetch from api to get the status of the transaction which will webhook send to the server
  // we will store the transaction id in the database and then we will fetch the status of the transaction from the database

  const handleSignedTransaction = async (data: {
    signed_transaction: string;
    recipient: string;
  }) => {
    if (isProcessingRef.current) {
      console.log("Transaction already in progress");
      return;
    }

    try {
      isProcessingRef.current = true;
      setStep("processing");
      setShowScanner(false);

      const connection = new Connection(SOLANA_RPC_URL);
      const signedTransactionBuffer = Buffer.from(
        data.signed_transaction,
        "base64"
      );
      const transaction = Transaction.from(signedTransactionBuffer);

      // Check if transaction was already processed
      const txSignature = transaction.signatures[0]?.signature;
      if (
        txSignature &&
        // @ts-ignore
        processedTxIds.current.has(Buffer.from(txSignature).toString("base64"))
      ) {
        console.log("Transaction already processed");
        setStep("completed");
        return;
      }

      const txid = await connection.sendRawTransaction(
        signedTransactionBuffer,
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );

      // Add transaction to processed set
      processedTxIds.current.add(txid);

      const confirmation = await connection.confirmTransaction(
        txid,
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error(
          "Transaction failed: " + JSON.stringify(confirmation.value.err)
        );
      }

      setTransactionId(txid);
      setStep("completed");
    } catch (error: any) {
      console.error("Transaction Error:", error);
      setStep("error");
      setErrorMessage(error.message || "Transaction failed");
    } finally {
      isProcessingRef.current = false;
    }
  };

  const resetModal = () => {
    setStep("input");
    setAmount("");
    setRecipientAddress("");
    setErrorMessage("");
    setShowScanner(false);
    setTransactionId(null);
    setIsScanning(false);
    isProcessingRef.current = false;
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const startScanner = () => {
    if (!isProcessingRef.current) {
      setShowScanner(true);
      setIsScanning(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solana Transaction (Devnet)</DialogTitle>
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
                onClick={startScanner}
                disabled={isProcessingRef.current}
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan Response QR
              </Button>
              {showScanner && isScanning && (
                <div className="mt-4">
                  <QrReader
                    constraints={{ facingMode: "environment" }}
                    onResult={(result) => {
                      if (result) {
                        handleQRScan(result.getText());
                      }
                    }}
                    videoStyle={{ width: "100%" }}
                  />
                </div>
              )}
            </div>
          )}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p>Processing transaction on Devnet...</p>
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
                  href={`${SOLANA_EXPLORER_URL}/${transactionId}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:text-blue-600"
                >
                  View on Explorer
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              )}
              <Button variant="outline" onClick={resetModal}>
                New Transaction
              </Button>
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
