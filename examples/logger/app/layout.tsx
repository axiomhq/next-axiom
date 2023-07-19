'use client';
import './globals.css';
import { AxiomWebVitals } from 'next-axiom/components';

export default function RootLayout({ children }: { children: React.ReactNode }) {

  console.log({ AxiomWebVitals })
  return (
    <html lang="en">
      <AxiomWebVitals />
      <body>{children}</body>
    </html>
  );
}
