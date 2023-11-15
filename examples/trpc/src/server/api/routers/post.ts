import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

let post = {
  id: 1,
  name: 'Hello World',
};

export const postRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ ctx, input }) => {
    ctx.log.info('Hello from the `hello` procedure', { input });
    return {
      greeting: `Hello ${input.text}`,
    };
  }),

  create: publicProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    // simulate a slow db call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    post = { id: post.id + 1, name: input.name };
    ctx.log.info('Hello from `create` procedure.', { post });
    return post;
  }),

  getLatest: publicProcedure.query((opts) => {
    opts.ctx.log.info('Hello from `getLatest` procedure.', { latestPost: post });
    return post;
  }),
});
