import { withAxiom } from '../src/index';
import { withAxiomGetServerSideProps, withAxiomNextServerSidePropsHandler } from '../src/withAxiom';
import { GetServerSideProps, GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import 'whatwg-fetch';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { Logger } from '@axiomhq/kit';

test('withAxiom(NextConfig)', async () => {
  const config = withAxiom({
    reactStrictMode: true,
  });
  expect(config).toBeInstanceOf(Object);
});

test('withAxiom(NextApiHandler)', async () => {
  const handler = withAxiom((_req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).end();
  });
  expect(handler).toBeInstanceOf(Function);
});

test('withAxiomNextServerSidePropsHandler', async () => {
  const handler = withAxiomNextServerSidePropsHandler(async (context) => {
    expect(context.log).toBeInstanceOf(Logger);
    return {
      props: {},
    };
  });
  expect(handler).toBeInstanceOf(Function);
});

test('withAxiom(NextMiddleware)', async () => {
  process.env.LAMBDA_TASK_ROOT = 'lol'; // shhh this is AWS Lambda, I promise
  const handler = withAxiom((_req: NextRequest, _ev: NextFetchEvent) => {
    return NextResponse.next();
  });
  expect(handler).toBeInstanceOf(Function);
  // TODO: Make sure we don't have a NextApiHandler
});

test('withAxiom(NextConfig) with fallback rewrites (regression test for #21)', async () => {
  process.env.AXIOM_INGEST_ENDPOINT = 'http://localhost';

  const rewrites = async () => {
    return {
      fallback: [
        {
          source: '/:bar',
          destination: '/foo/:bar',
        },
      ],
    };
  };

  const config = withAxiom({
    rewrites: rewrites as any,
  });
  if (config.rewrites) await config.rewrites();
});

test('withAxiom(GetServerSideProps)', async () => {
  const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  };
  const handler = withAxiomGetServerSideProps(getServerSideProps);
  expect(handler).toBeInstanceOf(Function);
  // TODO: Make sure we have a AxiomGetServerSideProps
});
