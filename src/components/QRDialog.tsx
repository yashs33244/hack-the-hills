import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";

interface QRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
  privateKey: string;
  seedPhrase: string;
}

const QRDialog: React.FC<QRDialogProps> = ({
  isOpen,
  onClose,
  publicKey,
  privateKey,
  seedPhrase,
}) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer); // Stop the timer when it reaches 0
            onClose(); // Close the dialog
            return 0;
          }
          return prevTime - 1; // Decrement the timer
        });
      }, 1000); // Update every second

      return () => clearInterval(timer); // Cleanup the interval on unmount
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const qrValue = JSON.stringify({
    publicKey,
    privateKey,
    seedPhrase,
  });

  // Format the time left as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-black">
          This contains your wallet details
        </h2>
        <div className="flex justify-center mb-4">
          <QRCode value={qrValue} size={200} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-black">
            <span className="font-semibold">Public Key:</span> {publicKey}
          </p>
          <p className="text-sm text-red-600">
            Warning: Do not share your private key or seed phrase with anyone.
            This QR code contains sensitive information.
          </p>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            This dialog will close in:{" "}
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </p>
        </div>
        <Button className="w-full mt-4 bg-black text-white" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default QRDialog;
