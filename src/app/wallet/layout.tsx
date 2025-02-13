"use client";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { RecoilRoot } from "recoil";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RecoilRoot>
        <Header />
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
        {/* Checks background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(to right, white 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}>
            </div>
          </div>
          {children}
        </div>
        <Footer />
    </RecoilRoot>
  );
}
