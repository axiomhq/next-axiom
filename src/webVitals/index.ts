import { usePathname } from 'next/navigation';
import { useReportWebVitals as useNextReportWebVitals } from 'next/web-vitals';
import { reportWebVitalsWithPath } from './webVitals';
export { type WebVitalsMetric } from './webVitals';
export { AxiomWebVitals } from './components'

export function useReportWebVitals(path?: string) {
    const pathName = usePathname();
    useNextReportWebVitals((metric) => reportWebVitalsWithPath(metric, path || pathName));
}
