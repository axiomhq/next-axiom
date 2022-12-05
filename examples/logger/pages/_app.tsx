import {AppProps} from "next/app";

export { reportWebVitals } from 'next-axiom'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
