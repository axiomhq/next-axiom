import { log } from 'next12-axiom';
import { AppProps } from 'next/app';

export { reportWebVitals } from 'next12-axiom';

log.info('Hello from frontend', { foo: 'bar' });

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
