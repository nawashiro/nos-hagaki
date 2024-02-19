/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    headers: [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Content-Security-Policy",
        value: cspHeader.replace(/\n/g, ""),
      },
    ];
  },
};

module.exports = nextConfig;
