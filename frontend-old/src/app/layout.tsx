import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GdsHeader } from "@/components/layout/GdsHeader";
import { GdsPhaseBanner } from "@/components/layout/GdsPhaseBanner";
import { GdsFooter } from "@/components/layout/GdsFooter";
import { CitationDrawer } from "@/components/chat/CitationDrawer";
import { FacilitatorBridge } from "@/components/chat/FacilitatorBridge";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IP-SAKTI Sahayak | Statutory Patent & Bio-Resource Intelligence Platform",
  description: "Enterprise Statutory Intelligence for Indian & International Botanical Formulations: Section 3(p) TKDL Prior-Art Screening, BDA 2023 ABS Liabilities, and Compliance Dossiers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f3f2f1] text-[#0b0c0c] min-h-screen flex flex-col antialiased selection:bg-[#ffdd00] selection:text-[#0b0c0c]`}>
        <QueryProvider>
          <div className="print:hidden">
            <GdsHeader />
            <GdsPhaseBanner />
          </div>
          
          <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8">
            {children}
          </main>

          <CitationDrawer />
          <FacilitatorBridge />
          <GdsFooter />
        </QueryProvider>
      </body>
    </html>
  );
}
