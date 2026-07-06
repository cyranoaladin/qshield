export type ScanApiResponse = {
  readonly address: string;
  readonly breakdown: Record<string, number>;
  readonly cache: {
    readonly hit: boolean;
    readonly ttlSeconds: number;
  };
  readonly estimatedMigrationExposureValueUsd: number;
  readonly grade: "A" | "B" | "C" | "D" | "E" | "N/A" | null;
  readonly gradeDisplayed: boolean;
  readonly qci: number;
  readonly qciVersion: string;
  readonly qes: number | null;
  readonly qesVersion: string;
  readonly recommendations: readonly string[];
  readonly scannedAt: string;
  readonly status: "fragile_estimate" | "insufficient_data" | "not_applicable" | "ok";
  readonly warnings: readonly string[];
};

export type WaitlistApiResponse = {
  readonly duplicate: boolean;
  readonly message: string;
  readonly status: "ok";
};

export type StatsApiResponse = {
  readonly averageQci: number | null;
  readonly averageQes: number | null;
  readonly gradeDistribution: Record<string, number>;
  readonly lastScanTimestamp: string | null;
  readonly totalEstimatedMigrationExposureValueUsd: number;
  readonly totalScans: number;
};

export type ProblemResponse = {
  readonly code: string;
  readonly detail?: string;
  readonly status: number;
  readonly title: string;
  readonly type: string;
};

const DEFAULT_API_URL = "http://localhost:3001";

export async function requestScan(address: string): Promise<ScanApiResponse> {
  return requestJson<ScanApiResponse>("/api/v1/scan", {
    body: JSON.stringify({ address }),
    method: "POST",
  });
}

export async function requestWaitlist(input: {
  readonly consent: boolean;
  readonly email: string;
  readonly source?: string;
  readonly wallet?: string;
}): Promise<WaitlistApiResponse> {
  return requestJson<WaitlistApiResponse>("/api/v1/waitlist", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function requestStats(): Promise<StatsApiResponse> {
  return requestJson<StatsApiResponse>("/api/v1/stats", {
    method: "GET",
  });
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const payload = (await response.json()) as T | ProblemResponse;

  if (!response.ok) {
    throw new ApiRequestError(payload as ProblemResponse);
  }

  return payload as T;
}

function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export class ApiRequestError extends Error {
  readonly problem: ProblemResponse;

  constructor(problem: ProblemResponse) {
    super(problem.title);
    this.name = "ApiRequestError";
    this.problem = problem;
  }
}
