"use client"

import { motion } from "framer-motion"
import { Copy, ExternalLink, Key, QrCode, Trash2, Wallet } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface WalletListProps {
  wallets: any[]
  isLoading: boolean
  onDelete: (id: string) => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function WalletList({ wallets, isLoading, onDelete }: WalletListProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy")
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-black/50 border-purple-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-400">Loading wallets...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (wallets.length === 0) {
    return (
      <Card className="bg-black/50 border-purple-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Wallet className="h-12 w-12 text-purple-500 mx-auto" />
            <div>
              <p className="text-gray-400">No wallets found</p>
              <p className="text-sm text-gray-500">Create a new wallet to get started</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {wallets.map((wallet) => (
        <motion.div key={wallet.id} variants={item}>
          <Card className="bg-black/50 border-purple-800 hover:border-purple-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${wallet.type === 'ethereum' ? 'bg-blue-500' : 'bg-purple-500'} animate-pulse`} />
                  <span className="text-white capitalize">{wallet.type} Wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-purple-800/50 h-8 w-8"
                      >
                        <QrCode className="h-4 w-4 text-purple-400" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Wallet Public Key QR Code</DialogTitle>
                        <DialogDescription>
                          Share this QR code to receive payments. It contains only your public key and is safe to share.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center p-4 space-y-4 bg-black/30 rounded-lg">
                        <QRCodeSVG
                          value={wallet.publicKey}
                          size={200}
                          level="H"
                          includeMargin
                          className="bg-white p-2 rounded-lg"
                        />
                        <p className="text-sm text-gray-400 text-center break-all">
                          {wallet.publicKey}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-purple-800/50 h-8 w-8"
                    onClick={() => copyToClipboard(wallet.publicKey)}
                  >
                    <Copy className="h-4 w-4 text-purple-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-purple-800/50 h-8 w-8"
                    onClick={() => window.open(`https://etherscan.io/address/${wallet.publicKey}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 text-purple-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-800/50 h-8 w-8"
                    onClick={() => onDelete(wallet.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Created on {new Date(wallet.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Wallet Name</p>
                  <p className="text-lg font-semibold text-white">
                    {wallet.label || `${wallet.type} Wallet ${wallet.id.slice(0, 4)}`}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 p-4 rounded-lg border border-purple-800/50">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-purple-400" />
                          <p className="text-sm font-medium text-purple-400">Public Key</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-800/50 h-6 px-2"
                            onClick={() => copyToClipboard(wallet.publicKey)}
                          >
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-800/50 h-6 px-2"
                            onClick={() => window.open(`https://etherscan.io/address/${wallet.publicKey}`, '_blank')}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                      <p className="text-white font-mono text-sm break-all bg-black/30 p-2 rounded">
                        {wallet.publicKey}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Balance</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-white">
                      {parseFloat(wallet.balance || '0').toFixed(4)}
                    </p>
                    <span className="text-sm text-gray-400">{wallet.type === 'ethereum' ? 'ETH' : 'SOL'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
