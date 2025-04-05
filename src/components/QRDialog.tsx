import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { AlertTriangle, Key, KeyRound, Sprout } from "lucide-react";

interface WalletDetails {
  publicKey: string;
  privateKey: string;
  seedPhrase: string;
}

interface QRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletDetails: WalletDetails | null;
}

const QRDialog = ({ open, onOpenChange, walletDetails }: QRDialogProps) => {
  if (!walletDetails) return null;

  // Create a single object with all wallet details for the QR code
  const qrData = JSON.stringify({
    publicKey: walletDetails.publicKey,
    privateKey: walletDetails.privateKey,
    seedPhrase: walletDetails.seedPhrase,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/95 border-purple-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Wallet Created Successfully</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-4">
          {/* Warning Message */}
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-red-400 font-medium">Important Security Warning</p>
              <p className="text-sm text-red-300/90">
                This QR code contains sensitive wallet information. Never share it with anyone.
                Store it securely and keep your private key and seed phrase confidential.
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center space-y-4 bg-white/5 rounded-lg p-6">
            <QRCode
              value={qrData}
              size={200}
              style={{ background: 'white', padding: '1rem' }}
            />
            <p className="text-sm text-gray-400 text-center">
              Scan this QR code to access your wallet details
            </p>
          </div>

          {/* Wallet Details */}
          <div className="space-y-4">
            {/* Public Key */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Key className="h-4 w-4 text-purple-400" />
                <p className="text-sm font-medium text-purple-400">Public Key</p>
              </div>
              <p className="text-sm font-mono bg-white/5 p-2 rounded break-all">
                {walletDetails.publicKey}
              </p>
            </div>

            {/* Private Key */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="h-4 w-4 text-pink-400" />
                <p className="text-sm font-medium text-pink-400">Private Key</p>
              </div>
              <p className="text-sm font-mono bg-white/5 p-2 rounded break-all">
                {walletDetails.privateKey}
              </p>
            </div>

            {/* Seed Phrase */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sprout className="h-4 w-4 text-green-400" />
                <p className="text-sm font-medium text-green-400">Seed Phrase</p>
              </div>
              <p className="text-sm font-mono bg-white/5 p-2 rounded break-all">
                {walletDetails.seedPhrase}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRDialog;
