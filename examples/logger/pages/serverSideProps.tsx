import { withAxiom, AxiomGetServerSideProps, AxiomGetServerSidePropsContext } from 'next-axiom'

export const getServerSideProps: AxiomGetServerSideProps =  withAxiom(async ({ req, log }: AxiomGetServerSidePropsContext)  => {
  log.info('Hello from server side', { 'method': req.method })
  return {
    props: {
        method: req.method
    },
  }
})

export default function Home({ method }: { method: string }) {
  return (
    <div>
      <h1>Hello from server, this is a { method } request</h1>
    </div>
  )
}
