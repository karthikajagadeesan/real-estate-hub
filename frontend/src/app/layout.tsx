import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'IndiaDits | Premium Real Estate & Property Discovery Platform',
  description: 'Search 50,000+ verified luxury apartments, villas, plots, and commercial spaces across top Indian cities like Mumbai, Delhi, Bengaluru, and Hyderabad.',
  keywords: ['real estate India', 'buy apartment', 'rent villa', 'property listing', '99acres alternative', 'NoBroker alternative'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
