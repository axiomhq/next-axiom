import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitals } from './webVitals';

export function useAxiom() {
  useReportWebVitals(reportWebVitals);
}
