import { config as loadDotenv } from "dotenv";

loadDotenv({ quiet: true });

const baseUrl = withoutTrailingSlash(process.env.API_URL ?? "http://localhost:3001");
const address = process.env.SMOKE_SOLANA_ADDRESS ?? "11111111111111111111111111111111";
const waitlistEmail = process.env.SMOKE_WAITLIST_EMAIL ?? "smoke+local@quantalayer.app";

const health = await requestJson("GET", "/healthz");
const statsBefore = await requestJson("GET", "/api/v1/stats");
const scan = await requestJson("POST", "/api/v1/scan", { address });
const waitlist = await requestJson("POST", "/api/v1/waitlist", {
  consent: true,
  email: waitlistEmail,
  source: "smoke-api",
});

console.log(
  JSON.stringify(
    {
      health,
      scan: summarizeScan(scan),
      statsBefore,
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
