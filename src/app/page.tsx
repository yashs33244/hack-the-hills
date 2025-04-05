"use client";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  Lock,
  Zap,
  CreditCard,
  Key,
  Fingerprint,
  Server,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

const hackingNews = [
  {
    title: "Major Exchange Hack 2024",
    description: "Over $200M stolen in recent cryptocurrency exchange breach",
    date: "March 2024",
  },
  {
    title: "Hot Wallet Vulnerability",
    description:
      "Security researchers discover critical flaw in popular hot wallets",
    date: "February 2024",
  },
  {
    title: "Cloud Storage Breach",
    description: "Thousands of private keys exposed in cloud storage hack",
    date: "January 2024",
  },
];

const features = [
  {
    icon: Shield,
    title: "Cold Wallet Security",
    description: "Keys encrypted and stored securely on Raspberry Pi",
  },
  {
    icon: Fingerprint,
    title: "Biometric Authentication",
    description: "Face authentication encryption on Raspberry Pi",
  },
  {
    icon: CreditCard,
    title: "Hot Wallet Conversion",
    description: "Seamless conversion between cold and hot wallet states",
  },
  {
    icon: Key,
    title: "No Key Exposure",
    description: "Unlike backups, your keys remain secure and unexposed",
  },
  {
    icon: Server,
    title: "No Central Storage",
    description: "Unlike exchanges, we don't store your keys",
  },
  {
    icon: Lock,
    title: "True Ownership",
    description: "You maintain complete control over your keys",
  },
];

const testimonials = [
  {
    quote:
      "The most secure wallet solution I've ever used. The Raspberry Pi integration is genius!",
    author: "Alex Thompson",
    role: "Crypto Investor",
  },
  {
    quote:
      "Finally, a wallet that combines security with accessibility. Game changer!",
    author: "Sarah Chen",
    role: "Blockchain Developer",
  },
  {
    quote:
      "The face authentication adds an extra layer of security I didn't know I needed.",
    author: "Michael Rodriguez",
    role: "Security Expert",
  },
];

const faqs = [
  {
    question: "What makes Mystic Vault different from other hardware wallets?",
    answer:
      "Mystic Vault combines the security of a cold wallet with the accessibility of a hot wallet, all powered by Raspberry Pi and biometric authentication.",
  },
  {
    question: "How secure is the face authentication system?",
    answer:
      "Our face authentication system uses state-of-the-art encryption and is processed locally on your Raspberry Pi device.",
  },
  {
    question: "Can I access my funds if I lose my Raspberry Pi?",
    answer:
      "Yes, we provide a secure recovery process while maintaining our commitment to never exposing or centralizing your keys.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <Image
            src="/display.png"
            alt="Mystic Vault Hardware"
            width={500}
            height={500}
            className="rounded-lg shadow-2xl"
          />
        </div>
        <div className="md:w-1/2 md:pl-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            The Future of Crypto Security
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Secure your digital assets with military-grade encryption and
            biometric authentication.
          </p>
          <Link href="/wallet">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg">
              Get Started
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Security Alert Section */}
      <section className="bg-red-900/20 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mr-4" />
            <h2 className="text-3xl font-bold">Everything is Hackable</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {hackingNews.map((news, index) => (
              <div
                key={index}
                className="bg-black/50 p-6 rounded-lg border border-red-500/20"
              >
                <h3 className="text-xl font-bold mb-2">{news.title}</h3>
                <p className="text-gray-400 mb-4">{news.description}</p>
                <span className="text-red-400 text-sm">{news.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">
            See Mystic Vault in Action
          </h2>
          <div className="max-w-4xl mx-auto aspect-video bg-gray-800 rounded-lg">
            {/* Add your video component here */}
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">Demo Video Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose Mystic Vault?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-lg border border-gray-800"
              >
                <feature.icon className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hot/Cold Wallet Concept */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Understanding Mystic Vault
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-black/50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Cold Wallet Security</h3>
              <p className="text-gray-400">
                Your private keys are stored in an encrypted format on a
                dedicated Raspberry Pi, completely isolated from the internet.
                This provides the highest level of security for your digital
                assets.
              </p>
            </div>
            <div className="bg-black/50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">
                Hot Wallet Convenience
              </h3>
              <p className="text-gray-400">
                When needed, securely convert to a hot wallet for immediate
                transactions. Our unique architecture ensures your keys remain
                protected even during active use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-8 rounded-lg"
              >
                <p className="text-lg mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buy Hardware Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">
            Get Your Mystic Vault Today
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Secure your digital assets with the most advanced hardware wallet
            solution.
          </p>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-6 rounded-full text-xl">
            Pre-order Now
          </Button>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with Privacy Policy */}
      <footer className="bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Mystic Vault</h3>
              <p className="text-gray-400">Securing your digital future</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Legal</h3>
              <ul className="text-gray-400">
                <li className="mb-2">
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li className="mb-2">
                  <Link href="/terms">Terms of Service</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Support</h3>
              <ul className="text-gray-400">
                <li className="mb-2">
                  <Link href="/faq">FAQ</Link>
                </li>
                <li className="mb-2">
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect</h3>
              <ul className="text-gray-400">
                <li className="mb-2">
                  <Link href="https://twitter.com">Twitter</Link>
                </li>
                <li className="mb-2">
                  <Link href="https://discord.com">Discord</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Mystic Vault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
