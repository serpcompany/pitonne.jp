/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // Redirect /en/ prefix to root (prevent duplicate content)
      {
        source: "/en/:path*",
        destination: "/:path*",
        permanent: true,
      },
      // Existing service redirects
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
      // Japanese equivalents
      {
        source: "/ja/services/medications/",
        destination: "/ja/services/medication/",
        permanent: true,
      },
      {
        source: "/ja/services/medications",
        destination: "/ja/services/medication/",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
