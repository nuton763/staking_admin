/** @type {import('next').NextConfig} */

function resolveBackendUrl() {
  const fromEnv = process.env.BACKEND_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:5005";
}

const BACKEND = resolveBackendUrl();

const nextConfig = {
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${BACKEND}/api/auth/:path*` },
      { source: "/api/user/:path*", destination: `${BACKEND}/api/user/:path*` },
      { source: "/api/package/:path*", destination: `${BACKEND}/api/package/:path*` },
      { source: "/api/package", destination: `${BACKEND}/api/package` },
      { source: "/api/wallet/:path*", destination: `${BACKEND}/api/wallet/:path*` },
      { source: "/api/transaction/:path*", destination: `${BACKEND}/api/transaction/:path*` },
      { source: "/api/notice/:path*", destination: `${BACKEND}/api/notice/:path*` },
      { source: "/api/notice", destination: `${BACKEND}/api/notice` },
      { source: "/api/promo/:path*", destination: `${BACKEND}/api/promo/:path*` },
      { source: "/api/promo", destination: `${BACKEND}/api/promo` },
      { source: "/api/public/:path*", destination: `${BACKEND}/api/public/:path*` },
      { source: "/packageImages/:path*", destination: `${BACKEND}/packageImages/:path*` },
      { source: "/users/:path*", destination: `${BACKEND}/users/:path*` },
    ];
  },
};

export default nextConfig;
