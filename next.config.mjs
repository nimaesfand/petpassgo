/** @type {import('next').NextConfig} */
const nextConfig = {
  // One page per job. Old pages point to where that job lives now.
  async redirects() {
    return [
      { source: "/service-dog-kit", destination: "/service-dog", permanent: true },
      { source: "/service-dog-kit/:path*", destination: "/service-dog", permanent: true },
      { source: "/service-dog/dot-form", destination: "/service-dog", permanent: true },
      { source: "/signup", destination: "/passport/create", permanent: false },
    ];
  },
};

export default nextConfig;
