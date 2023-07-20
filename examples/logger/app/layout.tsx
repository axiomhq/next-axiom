'use client';
import './globals.css';
import { AxiomWebVitals } from 'next-axiom/webvitals';

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <AxiomWebVitals />
      <body>{children}</body>
    </html>
  );
}
