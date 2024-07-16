'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLogger } from 'next-axiom';

import { api } from '~/trpc/react';

export function CreatePost() {
  const router = useRouter();
  const logger = useLogger();
  const [name, setName] = useState('');

  const createPost = api.post.create.useMutation({
    onSuccess: (input, res) => {
      router.refresh();
      logger.info(
        'Sending a multiline log from the frontend\nThis is the second line',
        { input, res },
      );
      setName('');
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createPost.mutate({ name });
      }}
    >
      <input
        type="text"
        placeholder="Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" disabled={createPost.isLoading}>
        {createPost.isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
