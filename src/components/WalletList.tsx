import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { Wallet } from "./WalletCard";

import WalletCard from "./WalletCard";
import { currency } from "@/app/store/currency";
import { useState } from "react";

const WalletList = ({ newWalletId }: { newWalletId: string | null }) => {
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
        <WalletCard
          key={wallet.id}
          wallet={wallet}
          onCopy={copyToClipboard}
          isNewWallet={wallet.id === newWalletId}
        />
      ))}
    </div>
  );
};

export default WalletList;
