import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { pathToFileURL } from "node:url";

type MockContentType = "application/json" | "application/problem+json";

type MockResponse = {
  readonly body: unknown;
  readonly contentType: MockContentType;
  readonly status: number;
};

type ProblemBody = {
  readonly code: string;
  readonly detail?: string;
  readonly status: number;
  readonly title: string;
  readonly type: string;
};

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3001;
const DEFAULT_SCAN_DELAY_MS = 1_500;

const SUCCESS_ADDRESS = "11111111111111111111111111111111";
const LOW_CONFIDENCE_ADDRESS = "LowConfidence111111111111111111111111111";
const PDA_ADDRESS = "PdaPreview111111111111111111111111111111";
const ERROR_ADDRESS = "ErrorPreview11111111111111111111111111111";

export function buildHealthResponse(): MockResponse {
  return jsonResponse({
    mode: "frontend-review",
    service: "quantalayer-mock-api",
    status: "ok",
  });
}

export function buildScanResponse(address: string): MockResponse {
  if (address === ERROR_ADDRESS) {
    return problemResponse(502, "UPSTREAM_DATA_ERROR", "Synthetic provider failure");
  }

  if (address === LOW_CONFIDENCE_ADDRESS) {
    return jsonResponse({
      address,
      breakdown: {},
      cache: {
        hit: false,
        ttlSeconds: 3600,
      },
      estimatedMigrationExposureValueUsd: 0,
      grade: null,
      gradeDisplayed: false,
      qci: 34,
      qciVersion: "1.0.1",
      qes: null,
      qesVersion: "1.1.0",
      recommendations: ["Attendre des données plus complètes avant d'interpréter le score."],
      scannedAt: "2026-07-06T12:00:00.000Z",
      status: "insufficient_data",
      warnings: [
        "QCI inférieur à 40 : le grade et le score ne sont pas affichés.",
        "Pagination RPC/DAS synthétiquement incomplète.",
      ],
    });
  }

  if (address === PDA_ADDRESS) {
    return jsonResponse({
      address,
      breakdown: {},
      cache: {
        hit: false,
        ttlSeconds: 3600,
      },
      estimatedMigrationExposureValueUsd: 0,
      grade: "N/A",
      gradeDisplayed: false,
      qci: 59,
      qciVersion: "1.0.1",
      qes: null,
      qesVersion: "1.1.0",
      recommendations: ["Analyser plutôt le programme propriétaire et ses autorités."],
      scannedAt: "2026-07-06T12:00:00.000Z",
      status: "not_applicable",
      warnings: [
        "Adresse hors courbe synthétique : le risque de migration est rattaché au programme ou à l'autorité.",
      ],
    });
  }

  return jsonResponse({
    address: address === "" ? SUCCESS_ADDRESS : address,
    breakdown: {
      concentration: 10,
      observableAge: 8,
      observableAssetValue: 28,
      recentActivity: 7,
      significantTokenAccounts: 6,
      stakedOrLockedAssets: 10,
    },
    cache: {
      hit: false,
      ttlSeconds: 3600,
    },
    estimatedMigrationExposureValueUsd: 50000,
    grade: "B",
    gradeDisplayed: true,
    qci: 82,
    qciVersion: "1.0.1",
    qes: 69,
    qesVersion: "1.1.0",
    recommendations: [
      "Prioriser l'inventaire des autorités avant toute stratégie de migration.",
      "Vérifier les comptes de staking et les actifs significatifs.",
    ],
    scannedAt: "2026-07-06T12:00:00.000Z",
    status: "ok",
    warnings: [
      "Concentration indisponible dans cette vue par adresse synthétique.",
      "QCI inférieur à 80 : relire les limites avant toute décision.",
    ],
  });
}

export function buildStatsResponse(): MockResponse {
  return jsonResponse({
    averageQci: 76,
    averageQes: 54,
    gradeDistribution: {
      A: 12,
      B: 31,
      C: 48,
      D: 25,
      E: 6,
      "N/A": 6,
    },
    lastScanTimestamp: "2026-07-06T12:00:00.000Z",
    totalEstimatedMigrationExposureValueUsd: 2450000,
    totalScans: 128,
  });
}

export function buildWaitlistResponse(email: string): MockResponse {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.includes("error")) {
    return problemResponse(500, "WAITLIST_UNAVAILABLE", "Synthetic waitlist failure");
  }

  return jsonResponse({
    duplicate: normalizedEmail.includes("duplicate"),
    message: normalizedEmail.includes("duplicate")
      ? "This email is already on the waitlist."
      : "Waitlist registration recorded.",
    status: "ok",
  });
}

function jsonResponse(body: unknown): MockResponse {
  return {
    body,
    contentType: "application/json",
    status: 200,
  };
}

function problemResponse(status: number, code: string, title: string): MockResponse {
  const body: ProblemBody = {
    code,
    status,
    title,
    type: "about:blank",
  };

  return {
    body,
    contentType: "application/problem+json",
    status,
  };
}

function createMockServer() {
  return createServer(async (request, response) => {
    try {
      await handleRequest(request, response);
    } catch (error) {
      const title = error instanceof Error ? error.message : "Unexpected mock API error";
      sendMockResponse(response, problemResponse(500, "MOCK_API_ERROR", title));
    }
  });
}

async function handleRequest(request: IncomingMessage, response: ServerResponse) {
  if (request.method === "OPTIONS") {
    sendCorsPreflight(response);
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);

  if (request.method === "GET" && url.pathname === "/healthz") {
    sendMockResponse(response, buildHealthResponse());
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/v1/stats") {
    sendMockResponse(response, buildStatsResponse());
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/v1/scan") {
    const payload = await readJsonObject(request);
    const address = stringField(payload, "address");

    if (address === null) {
      sendMockResponse(response, problemResponse(400, "VALIDATION_ERROR", "Missing address"));
      return;
    }

    const delayMs = scanDelayMs();

    if (delayMs > 0) {
      setTimeout(() => sendMockResponse(response, buildScanResponse(address)), delayMs);
      return;
    }

    sendMockResponse(response, buildScanResponse(address));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/v1/waitlist") {
    const payload = await readJsonObject(request);
    const email = stringField(payload, "email");

    if (email === null) {
      sendMockResponse(response, problemResponse(400, "VALIDATION_ERROR", "Missing email"));
      return;
    }

    sendMockResponse(response, buildWaitlistResponse(email));
    return;
  }

  sendMockResponse(response, problemResponse(404, "NOT_FOUND", "Mock route not found"));
}

async function readJsonObject(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  const payload = JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;

  return isRecord(payload) ? payload : {};
}

function stringField(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];

  return typeof value === "string" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sendMockResponse(response: ServerResponse, mockResponse: MockResponse) {
  response.writeHead(mockResponse.status, {
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
    "content-type": mockResponse.contentType,
  });
  response.end(JSON.stringify(mockResponse.body));
}

function sendCorsPreflight(response: ServerResponse) {
  response.writeHead(204, {
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-origin": "*",
    "access-control-max-age": "86400",
  });
  response.end();
}

function scanDelayMs(): number {
  const rawDelay = process.env.MOCK_SCAN_DELAY_MS;

  if (rawDelay === undefined || rawDelay.trim() === "") {
    return DEFAULT_SCAN_DELAY_MS;
  }

  const delay = Number(rawDelay);

  return Number.isFinite(delay) && delay >= 0 ? delay : DEFAULT_SCAN_DELAY_MS;
}

function readPort(): number {
  const rawPort = process.env.MOCK_API_PORT;

  if (rawPort === undefined || rawPort.trim() === "") {
    return DEFAULT_PORT;
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("MOCK_API_PORT must be an integer between 1 and 65535");
  }

  return port;
}

function isMainModule(): boolean {
  const entrypoint = process.argv[1];

  return entrypoint !== undefined && import.meta.url === pathToFileURL(entrypoint).href;
}

if (isMainModule()) {
  const host = process.env.MOCK_API_HOST ?? DEFAULT_HOST;
  const port = readPort();
  const server = createMockServer();

  server.listen(port, host, () => {
    console.log(`quantalayer-mock-api listening on http://${host}:${port}`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
