import React from "react";
import Link from "next/link";
import { WalletCards, Menu, X, Bell, Settings } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 w-full backdrop-blur-lg bg-black/50 border-b border-purple-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/wallet" className="flex items-center group" onClick={() => {
            // Reload the wallet page to ensure we see the landing page content
            if (window.location.pathname === '/wallet') {
              window.location.reload();
            }
          }}>
            <WalletCards className="h-8 w-8 mr-2 text-purple-400 transition-transform group-hover:rotate-12" />
            <h1 className="text-2xl font-bold text-white hover:text-purple-400 transition-colors duration-300">
              Mystic Vault
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList className="gap-6">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-lg font-semibold bg-transparent text-white hover:bg-gradient-to-r hover:from-purple-400 hover:via-pink-500 hover:to-red-500 transition-all duration-300 rounded-lg px-4 py-2 data-[state=open]:bg-gradient-to-r data-[state=open]:from-purple-400 data-[state=open]:via-pink-500 data-[state=open]:to-red-500">
                    Exchange
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-[400px] space-y-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg">
                      <Link
                        href="/swap"
                        className="block p-2 hover:bg-purple-800 rounded text-white"
                      >
                        Swap Tokens
                      </Link>
                      <Link
                        href="/liquidity"
                        className="block p-2 hover:bg-purple-800 rounded text-white"
                      >
                        Liquidity Pools
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-lg font-semibold bg-transparent text-white hover:bg-gradient-to-r hover:from-purple-400 hover:via-pink-500 hover:to-red-500 transition-all duration-300 rounded-lg px-4 py-2 data-[state=open]:bg-gradient-to-r data-[state=open]:from-purple-400 data-[state=open]:via-pink-500 data-[state=open]:to-red-500">
                    Wallet
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-[400px] space-y-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg">
                      <Link
                        href="/wallet/my-wallets"
                        className="block p-2 hover:bg-purple-800 rounded text-white"
                      >
                        My Wallets
                      </Link>
                      <Link
                        href="/hot-wallet"
                        className="block p-2 hover:bg-purple-800 rounded text-white"
                      >
                        Hot Wallet
                      </Link>
                      <Link
                        href="/cold-storage"
                        className="block p-2 hover:bg-purple-800 rounded text-white"
                      >
                        Cold Storage
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent"
              >
                <Bell className="h-5 w-5 text-white hover:text-purple-400 transition-colors duration-300" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent"
              >
                <Settings className="h-5 w-5 text-white hover:text-purple-400 transition-colors duration-300" />
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:opacity-90 text-white"
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/auth");
                }}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                {isOpen ? (
                  <X className="h-6 w-6 text-white" />
                ) : (
                  <Menu className="h-6 w-6 text-white" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/95 border-gray-800">
              <div className="flex flex-col space-y-4 mt-8">
                <Link
                  href="/wallet/my-wallets"
                  className="text-white hover:text-white p-2"
                >
                  My Wallets
                </Link>
                <Link
                  href="/swap"
                  className="text-white hover:text-white p-2"
                >
                  Swap Tokens
                </Link>
                <Link
                  href="/liquidity"
                  className="text-white hover:text-white p-2"
                >
                  Liquidity Pools
                </Link>
                <Link
                  href="/hot-wallet"
                  className="text-white hover:text-white p-2"
                >
                  Hot Wallet
                </Link>
                <Link
                  href="/cold-storage"
                  className="text-white hover:text-white p-2"
                >
                  Cold Storage
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
