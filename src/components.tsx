'use client';
import React from 'react';
import { useReportWebVitals } from './webVitals';

export function AxiomWebVitals({ path }: { path?: string }) {
  useReportWebVitals(path);
  return <React.Fragment></React.Fragment>;
}
