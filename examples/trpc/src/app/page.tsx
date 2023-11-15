import Link from 'next/link';

import { CreatePost } from '~/app/_components/create-post';
import { api } from '~/trpc/server';

export default async function Home() {
  const hello = await api.post.hello.query({ text: 'from tRPC' });

  return (
    <main>
      <p>{hello ? hello.greeting : 'Loading tRPC query...'}</p>

      <CrudShowcase />
    </main>
  );
}

async function CrudShowcase() {
  const latestPost = await api.post.getLatest.query();

  return (
    <div>
      {latestPost ? <p>Your most recent post: {latestPost.name}</p> : <p>You have no posts yet.</p>}

      <CreatePost />
    </div>
  );
}
