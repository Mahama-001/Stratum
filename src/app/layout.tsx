import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stratum | Prop Trading Context & Rule Engine',
  description: 'Layered Intelligence for Funded Traders. Hard-coded firm drawdown parameters, session factor radar, economic shields, and institutional playbooks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;520;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-[#070708] text-[#e5e2e3] min-h-screen antialiased selection:bg-[#5E6BFF] selection:text-white">
        {children}
      </body>
    </html>
  );
}
