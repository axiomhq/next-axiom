import { usePathname } from 'next/navigation';
import { useReportWebVitals as useNextReportWebVitals } from 'next/web-vitals';
import { reportWebVitalsWithPath } from './webVitals';
import { useCallback, useRef } from 'react';
export { type WebVitalsMetric } from './webVitals';
export { AxiomWebVitals } from './components';

export function useReportWebVitals(path?: string) {
  const pathName = usePathname();
  const stabilizedPath = useRef(path || pathName);

  if (typeof path === 'string' && path !== stabilizedPath.current) {
    stabilizedPath.current = pathName;
  } else if (typeof path === 'string' && path === stabilizedPath.current) {
    stabilizedPath.current = path;
  }

  const reportWebVitalsFn: Parameters<typeof useNextReportWebVitals>[0] = useCallback(
    (metric) => reportWebVitalsWithPath(metric, stabilizedPath.current),
    []
  );

  useNextReportWebVitals(reportWebVitalsFn);
}
