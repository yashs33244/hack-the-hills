"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              1. Introduction
            </h2>
            <p>
              At Mystic Vault, we take your privacy seriously. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our hardware wallet and associated
              services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              2. Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Account information (email address, username)</li>
              <li>Device information</li>
              <li>Transaction data (public blockchain data only)</li>
              <li>Customer support communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process your transactions</li>
              <li>Send you technical notices and security alerts</li>
              <li>Respond to your comments and questions</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              4. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              maintain the security of your personal information. Your private
              keys are stored locally on your Raspberry Pi device and are never
              transmitted to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              5. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              6. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at:
              <br />
              <a
                href="mailto:privacy@mysticvault.com"
                className="text-purple-400 hover:text-purple-300"
              >
                privacy@mysticvault.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date.
            </p>
          </section>

          <p className="text-sm text-gray-400 mt-8">
            Last Updated: March 15, 2024
          </p>
        </div>
      </div>
    </div>
  );
}
