// @ts-check

/** @type {import('next').NextConfig} */
const { withAxiom } = require('next12-axiom');

const nextConfig = withAxiom({
  reactStrictMode: true,
})

module.exports = nextConfig
