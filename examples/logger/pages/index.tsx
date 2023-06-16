import { log } from 'next12-axiom';
import { GetStaticProps } from 'next';
import useSWR, { Arguments, Fetcher } from 'swr';

export const getStaticProps: GetStaticProps = async (context) => {
  log.info('Hello from SSR', { context });
  return {
    props: {},
  };
};

const fetcher: Fetcher<{[name: string]: string}> = async (args: any[]) => {
  console.log('Fetching', args);
  log.info('Hello from SWR', { args });
  const res = await fetch(args[0], args[1]);
  return await res.json();
};

export default function Home() {
  const { data, error } = useSWR('/api/hello', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.name}</h1>
    </div>
  );
}
