/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
      {
        source: "/privacy-policy/",
        destination: "/legal/privacy-policy/",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/legal/privacy-policy/",
        permanent: true,
      },
      {
        source: "/terms-of-use/",
        destination: "/legal/terms-conditions/",
        permanent: true,
      },
      {
        source: "/terms-of-use",
        destination: "/legal/terms-conditions/",
        permanent: true,
      },
      {
        source: "/legal/terms-and-conditions/",
        destination: "/legal/terms-conditions/",
        permanent: true,
      },
      {
        source: "/legal/terms-and-conditions",
        destination: "/legal/terms-conditions/",
        permanent: true,
      },
      {
        source: "/medical-disclaimer/",
        destination: "/legal/disclaimer/",
        permanent: true,
      },
      {
        source: "/medical-disclaimer",
        destination: "/legal/disclaimer/",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
