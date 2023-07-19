import { usePathname } from 'next/navigation';
import { useReportWebVitals as useNextReportWebVitals } from 'next/web-vitals';
import { reportWebVitalsWithPath } from './webVitals';
export { type WebVitalsMetric } from './webVitals';

export function useReportWebVitals(path?: string) {
    useNextReportWebVitals((metric) => reportWebVitalsWithPath(metric, path || usePathname()));
}