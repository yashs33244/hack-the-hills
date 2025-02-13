import { Github, Linkedin, Mail, Twitter } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="py-12 px-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Developed by Arav Bhivgade</p>
          </div>
          <div className="flex space-x-4">
            <Link href="https://www.linkedin.com/in/aravbhivgade/" target="_blank" rel="noopener noreferrer" className="hover:text-[#ffa2b6]">
              <Linkedin className="h-6 w-6 text-pink-500" />
              <span className="sr-only bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">LinkedIn</span>
            </Link>
            <Link href="https://github.com/bhivgadearav" target="_blank" rel="noopener noreferrer" className="hover:text-[#ffa2b6]">
              <Github className="h-6 w-6 text-pink-500" />
              <span className="sr-only bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">GitHub</span>
            </Link>
            <Link href="mailto:bhivgadearav0@gmail.com" className="hover:text-[#ffa2b6]">
              <Mail className="h-6 w-6 text-pink-500" />
              <span className="sr-only bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Email</span>
            </Link>
            <Link href="https://x.com/arav190720" target="_blank" className="hover:text-[#ffa2b6]">
              <Twitter className="h-6 w-6 text-pink-500" />
              <span className="sr-only bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Twitter</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}