const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/npm/cryptocurrency-icons@**',
      },
    ],
  },
};

export default nextConfig;
