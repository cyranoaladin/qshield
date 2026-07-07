import { config as loadDotenv } from "dotenv";

loadDotenv({ quiet: true });

const stagingUrl = process.env.STAGING_URL;

if (stagingUrl === undefined || stagingUrl.trim() === "") {
  throw new Error("STAGING_URL is required for smoke:staging");
}

const baseUrl = withoutTrailingSlash(stagingUrl);
const address = process.env.SMOKE_SOLANA_ADDRESS ?? "11111111111111111111111111111111";
const allowWrite = process.env.SMOKE_STAGING_WRITE === "true";

const health = await requestJson("GET", "/healthz");
const stats = await requestJson("GET", "/api/v1/stats");
const scan = await requestJson("POST", "/api/v1/scan", { address });
const waitlist = allowWrite
  ? await requestJson("POST", "/api/v1/waitlist", {
      consent: true,
      email: process.env.SMOKE_WAITLIST_EMAIL ?? "smoke+staging@quantalayer.app",
      source: "smoke-staging",
    })
  : { skipped: "Set SMOKE_STAGING_WRITE=true to exercise waitlist on staging." };

console.log(
  JSON.stringify(
    {
      health,
      scan: summarizeScan(scan),
      stats,
      waitlist,
    },
    null,
    2,
  ),
);

async function requestJson(method: "GET" | "POST", path: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...(body === undefined
      ? {}
      : {
          body: JSON.stringify(body),
          headers: {
            "content-type": "application/json",
          },
        }),
    method,
  });
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

function summarizeScan(scan: unknown): unknown {
  if (typeof scan !== "object" || scan === null) {
    return scan;
  }

  const value = scan as {
    readonly address?: unknown;
    readonly grade?: unknown;
    readonly qci?: unknown;
    readonly qes?: unknown;
    readonly status?: unknown;
  };

  return {
    address: typeof value.address === "string" ? truncateAddress(value.address) : undefined,
    grade: value.grade,
    qci: value.qci,
    qes: value.qes,
    status: value.status,
  };
}

function truncateAddress(value: string): string {
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}
