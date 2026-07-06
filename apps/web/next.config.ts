import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultApiUrl = "http://localhost:3001";
const productionApiUrl = "https://api.quantalayer.app";

export function buildContentSecurityPolicy(apiUrl = process.env.NEXT_PUBLIC_API_URL): string {
  const connectSources = uniqueValues([
    "'self'",
    defaultApiUrl,
    originFromUrl(apiUrl),
    productionApiUrl,
  ]);

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    `connect-src ${connectSources.join(" ")}`,
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "object-src 'none'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(),
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
        source: "/(.*)",
      },
    ];
  },
  outputFileTracingRoot: path.join(currentDirectory, "../.."),
};

export default nextConfig;

function originFromUrl(value: string | undefined): string | null {
  if (value === undefined || value.trim() === "") {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function uniqueValues(values: readonly (string | null)[]): string[] {
  return values.filter((value, index): value is string => {
    return value !== null && values.indexOf(value) === index;
  });
}
