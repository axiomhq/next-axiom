'use client';

import { createContext } from 'react';
import './globals.css';
import { AxiomWebVitals, Logger } from 'next-axiom';

export const AxiomContext = createContext<Logger>(new Logger());

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const logger = new Logger();

  return (
    <html lang="en">
      <AxiomContext.Provider value={logger}>
        <AxiomWebVitals />
        <body>{children}</body>
      </AxiomContext.Provider>
    </html>
  );
}
