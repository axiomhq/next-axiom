import { log } from 'next-axiom'
import { GetStaticProps } from 'next'

export const getStaticProps: GetStaticProps =  async (context) => {
  log.info('Hello from SSR', { context })
  return {
    props: {},
  }
}

export default function Home() {
    log.info('frontend logger')
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  )
}