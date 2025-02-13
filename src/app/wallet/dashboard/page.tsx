"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Check, Trash2, ArrowLeft } from "lucide-react";
import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { currency } from "@/app/store/currency";
import { useRecoilValue } from "recoil";
import bs58 from "bs58";
import axios from "axios";
import { Wallet, HDNodeWallet } from "ethers";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WalletManager from "@/components/WalletManager";

// make ui like phantom wallet
// add send and receive buttons

const generateWalletSeed = () => {
  const HDMnemonic = generateMnemonic();
  const HDSeed = mnemonicToSeed(HDMnemonic);
  return { HDMnemonic, HDSeed };
};

const solanaAPI =
  "https://solana-mainnet.g.alchemy.com/v2/D5CpkBsRtc9nvVRF3HUxanR3ENoc0Ftc";
const ethAPI =
  "https://eth-mainnet.g.alchemy.com/v2/D5CpkBsRtc9nvVRF3HUxanR3ENoc0Ftc";

export default function WalletSection() {
  const router = useRouter();
  const [wallets, setWallets] = useState(["W1"]);
  const [activeWallet, setActiveWallet] = useState("W1");
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedPrivate, setCopiedPrivate] = useState(false);
  const [keys, setKeys] = useState([{ publicKey: "", privateKey: "" }]);
  const [loaded, setLoaded] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(true);
  const [recoveryPhrase, setRecoveryPhrase] = useState([""]);
  const [balances, setBalances] = useState([""]);

  const { name, create, phrase } = useRecoilValue(currency);

  const userSeed = useMemo(() => {
    const { HDSeed, HDMnemonic } = create
      ? generateWalletSeed()
      : { HDSeed: mnemonicToSeed(phrase), HDMnemonic: phrase };
    setRecoveryPhrase(HDMnemonic.split(" "));
    return HDSeed;
  }, [create, phrase]);

  useEffect(() => {
    const executeWalletAction = async () => {
      if (shouldGenerate) {
        await generateWallet();
        setShouldGenerate(false);
        setLoaded(true);
      }
    };
    executeWalletAction();
  });

  const generateWallet = async () => {
    const seed = userSeed;
    console.log(seed);
    if (name == "solana") {
      const solanaSeed = await seed.then((bytes) => bytes.toString("hex"));
      const path = `m/44'/501'/${
        wallets.length == 1 ? 0 : wallets.length - 1
      }'/0'`;
      const derivedSeed = derivePath(path, solanaSeed).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);
      const publicKey = keypair.publicKey.toBase58();
      const privateKey = bs58.encode(keypair.secretKey);
      await getBalance(publicKey);
      setKeys([...keys, { publicKey: publicKey, privateKey: privateKey }]);
    } else {
      const ethSeed = await seed;
      const path = `m/44'/60'/${
        wallets.length == 1 ? 0 : wallets.length - 1
      }'/0'`;
      const hdNode = HDNodeWallet.fromSeed(ethSeed);
      const child = hdNode.derivePath(path);
      const privateKey = child.privateKey;
      const wallet = new Wallet(privateKey);
      const publicKey = wallet.address;
      await getBalance(publicKey);
      setKeys([...keys, { publicKey: publicKey, privateKey: privateKey }]);
    }
  };

  const weiToEth = (weiHex: string) => {
    // Convert hex to decimal
    const wei = BigInt(weiHex);
    // 1 ETH = 10^18 Wei, so divide by 10^18 to get ETH
    const eth = wei / BigInt(1e18);
    return eth;
  };

  const getBalance = async (publicKey: string) => {
    if (name == "solana") {
      const response = await axios.post(solanaAPI, {
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [`${publicKey}`],
      });
      setBalances([...balances, response.data.result.value]);
    } else {
      const response = await axios.post(ethAPI, {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [`${publicKey}`, "latest"],
      });
      setBalances([...balances, response.data.result]);
    }
  };

  const handleCopy = (text: string, isPublic: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPublic) {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    } else {
      setCopiedPrivate(true);
      setTimeout(() => setCopiedPrivate(false), 2000);
    }
  };

  const addWallet = () => {
    const newWalletName = `W${wallets.length + 1}`;
    setLoaded(false);
    setWallets([...wallets, newWalletName]);
    setActiveWallet(newWalletName);
    setShouldGenerate(true);
  };

  const deleteWallet = (walletToDelete: string) => {
    if (wallets.length === 1) {
      // Prevent deleting the last wallet
      return;
    }

    const updatedWallets = wallets.filter(
      (wallet) => wallet !== walletToDelete
    );
    setWallets(updatedWallets);

    if (activeWallet === walletToDelete) {
      // If the active wallet is deleted, set the first wallet as active
      setActiveWallet(updatedWallets[0]);
    }
  };

  const clearAllWallets = () => {
    setWallets(["W1"]);
    setActiveWallet("W1");
    setKeys([{ publicKey: "", privateKey: "" }]);
    setLoaded(false);
    router.push("/wallet");
  };

  return loaded ? (
    <main className="flex-grow container mx-auto px-16 py-12">
      <div className="flex items-center mb-8">
        <Link
          href="/wallet"
          className="text-white hover:text-gray-300 transition-colors mr-4"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <p className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Your Wallets
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <WalletManager />
      </div>
    </main>
  ) : (
    <div className="loadinng-container">
      <style>
        {`
          .loadinng-container {
            display: flex;
            column-gap: 20px;
            height: 100vh;
            width: 100vw;
            opacity: 0.5;
            justify-content: center;
            align-items: center;
          }

          .loadinng-container .dot {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            animation: loading 1s infinite alternate;
          }

          .loadinng-container .dot:nth-child(1) {
            background-color: #FFFFFF;
            animation-delay: -0.25s;
          }

          .loadinng-container .dot:nth-child(2) {
            background-color: #FFFFFF;
            animation-delay: -0.5s;
          }

          .loadinng-container .dot:nth-child(3) {
            background-color: #FFFFFF;
            animation-delay: -0.75s;
          }

          .loadinng-container .dot:nth-child(4) {
            background-color: #FFFFFF;
            animation-delay: -1s;
          }

          @keyframes loading {
            0% {
              transform: translateY(-15px);
            }
            100% {
              transform: translateY(5px);
            }
          }

      `}
      </style>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );
}
