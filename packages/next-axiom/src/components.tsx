'use client';
import { usePathname } from 'next/navigation';
import { useLogger, useReportWebVitals } from './hooks';
import { useEffect } from 'react';

export function AxiomWebVitals() {
  useReportWebVitals();

  // TODO: this could be used to flush logger whenever route changes
  const pathname = usePathname();
  const logger = useLogger();
  useEffect(() => {
    return async () => {
      await logger.flush();
    };
  }, [pathname]);
  return null;
}
