/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/services/medications/",
        destination: "/services/medication/",
        permanent: true,
      },
      {
        source: "/services/medications",
        destination: "/services/medication/",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
