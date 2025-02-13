import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nebula Vault",
  description: "Secure your crypto with Nebula Vault, a next-gen wallet offering advanced security and seamless transactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
