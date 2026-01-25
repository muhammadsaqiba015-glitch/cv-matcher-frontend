import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rate Your CV - AI-Powered CV Analysis',
  description: 'Get AI-powered analysis of how well your CV matches any job description. Brutally honest scoring with actionable improvements.',
  keywords: 'CV analysis, resume checker, job match, AI CV review, career tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P89GMGP34L"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P89GMGP34L');
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}