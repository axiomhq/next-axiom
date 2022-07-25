import { Logger } from 'next-axiom'

export { reportWebVitals } from 'next-axiom'

const log = new Logger()
log.info('Hello from frontend', { foo: 'bar' })

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
