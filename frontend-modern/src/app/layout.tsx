import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ModernHeader } from '@/components/layout/ModernHeader';
import { ModernFooter } from '@/components/layout/ModernFooter';
import { CitationDrawer } from '@/components/chat/CitationDrawer';
import { FacilitatorBridge } from '@/components/chat/FacilitatorBridge';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IP-SAKTI Sahayak | Statutory Patent & Bio-Resource Intelligence Platform',
  description: 'Modern Enterprise Statutory Clearance & Legal Intelligence for Indian & Global Botanical Innovations: Section 3(p) TKDL Prior-Art Screening, BDA 2023 ABS Liabilities, and Deterministic AI Grounding.',
  keywords: [
    'Ayurvedic Patents',
    'CSIR-TKDL',
    'Section 3(p) Patents Act 1970',
    'Biological Diversity Act 2023',
    'Access and Benefit Sharing ABS',
    'Phytopharmaceutical Drug Rule 122-E',
    'Traditional Knowledge Protection'
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900 bg-enterprise-mesh">
        <QueryProvider>
          {/* Sticky Modern Enterprise Navigation */}
          <div className="print:hidden sticky top-0 z-40">
            <ModernHeader />
          </div>
          
          {/* Main Workstation Canvas */}
          <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
            {children}
          </main>

          {/* Interactive Drawers & Overlays */}
          <CitationDrawer />
          <FacilitatorBridge />

          {/* Enterprise Modern Regulatory Footer */}
          <div className="print:hidden">
            <ModernFooter />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
