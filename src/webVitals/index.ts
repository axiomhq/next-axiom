import { usePathname } from 'next/navigation';
import { useReportWebVitals as useNextReportWebVitals } from 'next/web-vitals';
import { reportWebVitalsWithPath } from './webVitals';
import { useCallback, useRef } from 'react';
export { type WebVitalsMetric } from './webVitals';
export { AxiomWebVitals } from './components';

export function useReportWebVitals(path?: string) {
  const pathName = usePathname();

  /**
   * Refs allows us to stabilize the path name so that we can properly stabilize the reportWebVitalsFn
   */

  const stabilizedPath = useRef(path || pathName);

  /**
   * If the path changes, we update the stabilizedPath ref
   */
  if (typeof path === 'string' && path !== stabilizedPath.current) {
    stabilizedPath.current = pathName;
  } else if (typeof path === 'string' && path === stabilizedPath.current) {
    stabilizedPath.current = path;
  }

  /**
   * Stabilizing the reportWebVitalsFn avoids reporting the same metrics from multiple paths, it happens because internally
   * the useReportWebVitals from next uses a useEffect to report the metrics, and the reportWebVitalsFn is passed as a dependency
   * to the useEffect, so when the path changes, the useEffect is re-run, and the same metrics are reported again.
   */
  const reportWebVitalsFn: Parameters<typeof useNextReportWebVitals>[0] = useCallback(
    (metric) => reportWebVitalsWithPath(metric, stabilizedPath.current),
    []
  );

  useNextReportWebVitals(reportWebVitalsFn);
}
