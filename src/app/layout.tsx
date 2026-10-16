import type { Metadata } from 'next';
import './globals.css';
import { ToastContainer } from '../components/Toast';

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
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('stratum-color-mode');
                if (saved === 'dark') {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch(e) {}
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..700;1,14..32,300..700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-[var(--theme-bg)] text-[#1d1d1f] dark:text-[#f5f5f7] min-h-screen antialiased selection:bg-[#0071e3]/20 selection:text-black dark:selection:text-white transition-colors duration-200">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
