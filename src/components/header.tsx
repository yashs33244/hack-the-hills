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
          <Link href="/" className="flex items-center group">
            <WalletCards className="h-8 w-8 mr-2 text-purple-400 transition-transform group-hover:rotate-12" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient">
              Mystic Vault
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-600 hover:to-red-600 hover:text-white">
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
                  <NavigationMenuTrigger className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-600 hover:to-red-600 hover:text-white">
                    Wallet
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-[400px] space-y-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg">
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
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-purple-400 hover:text-black" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-purple-400 hover:text-black" />
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:opacity-90"
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
              <Button variant="ghost" size="icon">
                {isOpen ? (
                  <X className="h-6 w-6 text-gray-300" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-300" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/95 border-gray-800">
              <div className="flex flex-col space-y-4 mt-8">
                <Link
                  href="/swap"
                  className="text-gray-300 hover:text-white p-2"
                >
                  Swap Tokens
                </Link>
                <Link
                  href="/liquidity"
                  className="text-gray-300 hover:text-white p-2"
                >
                  Liquidity Pools
                </Link>
                <Link
                  href="/hot-wallet"
                  className="text-gray-300 hover:text-white p-2"
                >
                  Hot Wallet
                </Link>
                <Link
                  href="/cold-storage"
                  className="text-gray-300 hover:text-white p-2"
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
