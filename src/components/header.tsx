import { WalletCards } from "lucide-react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="py-12 px-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <WalletCards className="h-8 w-8 mr-2 text-purple-400" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Nebula Vault</h1>
          </Link>
          {/* <nav>
            <ul className="flex space-x-4">
              <li><Link href="/" className="hover:text-[#3ad68b]">Home</Link></li>
              <li><Link href="/wallets" className="hover:text-[#3ad68b]">Wallets</Link></li>
              <li><Link href="/about" className="hover:text-[#3ad68b]">About</Link></li>
            </ul>
          </nav> */}
        </div>
      </div>
    </header>
  )
}