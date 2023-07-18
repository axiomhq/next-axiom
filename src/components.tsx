'use client';
import {  useReportWebVitals } from './hooks';

export function AxiomWebVitals({ path }: { path?: string}) {
  useReportWebVitals(path);
  return null;
}
