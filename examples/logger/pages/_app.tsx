import { log, reportWebVitals } from 'next-axiom'
import { AppProps } from "next/app";
import { useEffect } from 'react';

log.info('Hello from frontend', { foo: 'bar' })

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => reportWebVitals(), [])

  return <Component {...pageProps} />
}

export default MyApp
