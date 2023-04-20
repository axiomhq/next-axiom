import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitals } from './webVitals';
import { usePathname } from 'next/navigation';

export function useAxiom() {
  const path = usePathname();
  useReportWebVitals((metric) => reportWebVitals(metric, path));
}
