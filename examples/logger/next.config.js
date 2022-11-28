// @ts-check

/** @type {import('next').NextConfig} */
const { withAxiom } = require('next-axiom');

const nextConfig = withAxiom({
  reactStrictMode: true,
})

module.exports = nextConfig
