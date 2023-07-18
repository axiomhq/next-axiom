// @ts-check
/** @type {import('next').NextConfig} */
const { withAxiom } = require('next-axiom');

const nextConfig = withAxiom({
  experimental: {
    appDir: true,
  },
});

module.exports = nextConfig;
