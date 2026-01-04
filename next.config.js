const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/spothq/cryptocurrency-icons/**',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
      },
    ],
  },
};

export default nextConfig;
