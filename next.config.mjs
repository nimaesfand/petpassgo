/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["passkit-generator", "node-forge"],
    outputFileTracingIncludes: {
      "/api/dot-form": ["./lib/forms/*.pdf"],
    },
  },
};

export default nextConfig;
