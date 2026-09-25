import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GovtBanner } from "@/components/layout/GovtBanner";
import { Header } from "@/components/layout/Header";
import { GazetteTicker } from "@/components/layout/GazetteTicker";
import { GovtFooter } from "@/components/layout/GovtFooter";
import { CitationDrawer } from "@/components/chat/CitationDrawer";
import { FacilitatorBridge } from "@/components/chat/FacilitatorBridge";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IP-SAKTI Sahayak | National AI Statutory Copilot & IPR Portal",
  description: "Official National AI Statutory Copilot for Intellectual Property, Patents Act 1970, CSIR-TKDL Prior-Art, and Biological Diversity Act 2023.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900`}>
        <QueryProvider>
          <div className="print:hidden">
            <GovtBanner />
            <Header />
            <GazetteTicker />
          </div>
          
          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
            {children}
          </main>

          <CitationDrawer />
          <FacilitatorBridge />
          <GovtFooter />
        </QueryProvider>
      </body>
    </html>
  );
}
