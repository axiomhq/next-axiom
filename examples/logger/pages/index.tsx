import { log } from 'next-axiom'
import { GetStaticProps } from 'next'
import useSWR from 'swr'

export const getStaticProps: GetStaticProps = async (context) => {
  log.info('Hello from SSR', { context })
  return {
    props: {},
  }
}

const fetcher = async (url: string) => {
  console.log('Fetching', url)
  log.info('Hello from SWR', { url });
  // @ts-ignore
  const res = await fetch(url);
  return await res.json();
}

export default function Home() {
  const { data, error } = useSWR('/api/hello', fetcher)

  if (error) {
    console.log(error)
    return <div>Failed to load</div>
  }
  if (!data) return <div>Loading...</div>

  return (
    <div>
      <h1>{data.name}</h1>
    </div>
  )
}
