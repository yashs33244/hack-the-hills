import { useState } from "react";

export interface WalletInfo {
  address: string;
  type: "ethereum" | "solana";
  balance: string;
  index: number;
}

export default function WalletRecoveryForm() {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"ethereum" | "solana">(
    "ethereum"
  );
  const [network, setNetwork] = useState<"devnet" | "mainnet">("devnet");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate network value
      const networkValue = network || "devnet";
      if (networkValue !== "mainnet" && networkValue !== "devnet") {
        throw new Error("Invalid network type. Must be 'mainnet' or 'devnet'");
      }

      // Validate wallet type
      if (selectedType !== "ethereum" && selectedType !== "solana") {
        throw new Error("Invalid wallet type. Must be 'ethereum' or 'solana'");
      }

      const response = await fetch("/api/wallet/getWalletsFromSeed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seed: seedPhrase,
          type: selectedType,
          network: networkValue,
          startIndex: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to recover wallets");
      }

      const data = await response.json();
      setWallets(data);
    } catch (err: any) {
      console.error("Wallet recovery error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-black">
          Recover Wallets from Seed
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seed Phrase
            </label>
            <textarea
              value={seedPhrase}
              onChange={(e) => setSeedPhrase(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black  "
              rows={3}
              placeholder="Enter your 12 or 24 word seed phrase"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Type
              </label>
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as "ethereum" | "solana")
                }
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black  "
              >
                <option value="ethereum">Ethereum</option>
                <option value="solana">Solana</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network
              </label>
              <select
                value={network}
                onChange={(e) =>
                  setNetwork(e.target.value as "devnet" | "mainnet")
                }
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black  "
              >
                <option value="devnet">Devnet</option>
                <option value="mainnet">Mainnet</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !seedPhrase.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? "Recovering Wallets..." : "Recover Wallets"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {wallets.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Index
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wallets.map((wallet) => (
                  <tr key={wallet.address + wallet.index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {wallet.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {wallet.index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {wallet.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {wallet.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
