/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {},
  async rewrites() {
    return [
      {
        source: "/models/:path*",
        destination: `${process.env.MLFLOW_URL || "http://localhost:5000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
