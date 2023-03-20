'use client';
import { useReportWebVitals } from 'next/client';
import { reportWebVital } from '../webVitals';

export function AxiomReporter() {
  useReportWebVitals(reportWebVital);
}
