import { log, reportWebVitals } from 'next-axiom'
import {AppProps} from "next/app";

log.info('Hello from frontend', { foo: 'bar' })

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

reportWebVitals()

export default MyApp
