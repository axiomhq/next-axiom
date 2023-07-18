// @ts-check
// We aim to have the same support as Next.js
// https://nextjs.org/docs/getting-started#system-requirements
// https://nextjs.org/docs/basic-features/supported-browsers-features

/** @type {import("@babel/core").ConfigFunction} */
module.exports = (api) => {
  const isTest = api.env('test');
  if (isTest) {
    return {
      presets: [
        ['@babel/preset-es2015'],
        ['@babel/preset-react', { runtime: 'automatic' }],
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
      ],
    };
  }

  return {
    // babelrcRoots: ['.', 'internal/*', 'packages/*'],
    presets: [['@babel/preset-env', { targets: { node: 12 } }], '@babel/preset-react', '@babel/preset-typescript'],
    plugins: [
      [
        'transform-inline-environment-variables',
        {
          include: ['npm_package_version'],
        },
      ],
    ],
    // ignore: [/node_modules/, '@axiomhq/kit'],
    // plugins: [['module-resolver', { alias: { '@axiomhq/kit': '../../internal/kit' } }]],
    // plugins: ['@babel/plugin-proposal-optional-catch-binding', '@babel/plugin-transform-runtime'],
    // ignore: ['../src/**/__tests__/**', '../src/adapters.ts', '../src/providers/oauth-types.ts'],

    comments: false,
    overrides: [
      {
        test: 'packages/next-axiom',
        ignore: [
          /node_modules\/(?!(@axiomhq\/kit)\/)/,
        ],
        plugins: [
          ['module-resolver', { cwd: './src', alias: { '@axiomhq/kit': './kit' } }],
          [
            'transform-inline-environment-variables',
            {
              include: ['npm_package_version'],
            },
          ],
        ],
      },
    ],
  };
};
