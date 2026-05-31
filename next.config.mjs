/** @type {import('next').NextConfig} */
const nextConfig = {
  // Weave ships native/CommonJS bits that break when webpack tries to bundle
  // them. Load it at runtime via Node's require instead so tracing works.
  serverExternalPackages: ["weave"],
};

export default nextConfig;
