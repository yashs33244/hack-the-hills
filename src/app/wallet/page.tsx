"use client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, Lock, Shield, Zap } from 'lucide-react';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { currency } from "../store/currency"
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function MainSection() {
    const { toast } = useToast() 
    const router = useRouter();
    const [home, setHome] = useState(true);
    const [value, setValue] = useRecoilState(currency);
    const [inputValue, setInputValue] = useState("");
    const [coin, setCoin] = useState("");
    const [generateClicked, setGenerateClicked] = useState(false);
    const handleClick = () => {
        if (inputValue.trim()) {
            // If input has text, set phrase and create to false
            setValue({
              name: coin,
              create: false,
              phrase: inputValue,
            });
            setGenerateClicked(true);
            router.push("/wallet/dashboard");
          } else {
            // If input is empty, just redirect to /dashboard
            setValue({
              name: coin,
              create: true,
              phrase: "",
            });
            setGenerateClicked(true);
            router.push("/wallet/dashboard");
          }
    }

    const handleScrollToSection = () => {
      const section = document.getElementById('home-heading');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        toast({
          title: "Choose A Currency",
          description: "Click on either Solana or Ethereum to create a wallet",
        })
      }
    };
  return (
    generateClicked ? (<div className="loadinng-container">
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
    </div>) : (home ? 
    (
        <main className="flex-grow">
          <Toaster />
          <div className="container mx-auto px-4 py-20">
            <section className="text-center mb-20">
              <h2 id="home-heading" className="text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x">
                Welcome to Nebula Vault
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              THIS WEBSITE IS FOR DEMONSTRATION PURPOSES ONLY. 
              DO NOT USE CRYPTOGRAPHIC KEYS OR PHRASES THAT HAVE REAL SOL OR ETH.
              MAKE A DUMMY WALLET TO TEST OUT THE FUNCTIONALITY.
              </p>
              {["Solana", "Ethereum"].map((crypto) => (
                <Button
                    key={crypto}
                    variant="outline"
                    className="me-4 bg-white text-black hover:bg-gray-200 text-lg px-10 py-6 rounded-full transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                        setHome(false);
                        setCoin(crypto.toLowerCase());
                    }}
                >
                    {crypto}
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                ))}
            </section>

            <section className="grid md:grid-cols-3 gap-12 mb-20">
              <div className="bg-black bg-opacity-50 backdrop-blur-sm p-10 rounded-2xl text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <Shield className="h-16 w-16 mx-auto mb-6 text-purple-400" />
                <h3 className="text-2xl font-semibold mb-4 text-white">Uncompromising Security</h3>
                <p className="text-gray-300">State-of-the-art encryption and security measures to protect your digital assets.</p>
              </div>
              <div className="bg-black bg-opacity-50 backdrop-blur-sm p-10 rounded-2xl text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <Lock className="h-16 w-16 mx-auto mb-6 text-pink-500" />
                <h3 className="text-2xl font-semibold mb-4 text-white">Private Key Control</h3>
                <p className="text-gray-300">Maintain full control over your private keys, ensuring true ownership of your crypto.</p>
              </div>
              <div className="bg-black bg-opacity-50 backdrop-blur-sm p-10 rounded-2xl text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <Zap className="h-16 w-16 mx-auto mb-6 text-red-500" />
                <h3 className="text-2xl font-semibold mb-4 text-white">Lightning Fast Transactions</h3>
                <p className="text-gray-300">Execute transactions quickly and efficiently across multiple blockchains.</p>
              </div>
            </section>

            <section className="text-center bg-black bg-opacity-50 backdrop-blur-sm p-16 rounded-3xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Take Control of Your Crypto?</h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of users who trust Nebula Vault for their cryptocurrency management needs.
              </p>
              <Button 
              onClick={handleScrollToSection} className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white hover:from-purple-500 hover:via-pink-600 hover:to-red-600 text-lg px-10 py-6 rounded-full transition-all duration-300 transform hover:scale-105">
                Create Your Vault
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </section>
          </div>
        </main>
    )
    :
            (<section className="py-16 px-4 h-screen mt-8 bg-black text-white">
                <div className="max-w-4xl mx-auto">
                    <Button
                        onClick={() => {
                            setHome(true);
                        }}
                        variant="ghost"
                        className="text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-black p-4"
                    >
                        <ArrowLeft className="h-6 w-6 mr-2" />
                        Back
                    </Button>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x">
                        Secret Recovery Phrase
                    </h2>
                    <p className="text-lg md:text-xl mb-8 text-center">
                        Save these words in a safe place
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <Input
                        type="text"
                        placeholder="Enter your secret phrase or leave blank to generate"
                        className="flex-grow bg-black !placeholder-[#FFFFFF] focus:!placeholder=[#FFFFFF] text-lg p-6 rounded-lg border border-[#FFFFFF] focus:!border-[#FFFFFF] focus:!ring-[#FFFFFF] focus:!ring-opacity-50"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        />
                        <Button
                        className="bg-white text-black hover:bg-black hover:text-white text-lg py-6 px-6 border border-[#FFFFFF] rounded-lg"
                        onClick={handleClick}
                        >
                        Generate Wallet
                        </Button>
                    </div>
                </div>
            </section>))
  )
}