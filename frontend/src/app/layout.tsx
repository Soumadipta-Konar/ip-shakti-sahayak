import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GovtBanner } from "@/components/layout/GovtBanner";
import { Header } from "@/components/layout/Header";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { CitationDrawer } from "@/components/chat/CitationDrawer";
import { FacilitatorBridge } from "@/components/chat/FacilitatorBridge";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IP-SAKTI Sahayak | National AI Statutory Copilot",
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
            <DisclaimerBanner />
          </div>
          
          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col">
            {children}
          </main>

          <CitationDrawer />
          <FacilitatorBridge />

          <footer className="border-t border-slate-200 py-6 text-xs text-slate-600 bg-white shadow-xs print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">IP-SAKTI Sahayak</span>
                <span className="text-slate-300">|</span>
                <span className="font-medium text-slate-600">Government of India &bull; Digital Public Infrastructure &bull; SIH 2024</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                <span className="font-semibold text-emerald-700">DPI 2.0 / GIGW 3.0 Verified</span>
                <span>&bull;</span>
                <span>The Patents Act, 1970</span>
                <span>&bull;</span>
                <span>Biological Diversity Act, 2023</span>
                <span>&bull;</span>
                <span>CSIR-TKDL</span>
              </div>
            </div>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
