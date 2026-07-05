export type AccountClass = "multisig" | "pda" | "program" | "system" | "unknown";

export type QciInput = {
  readonly accountClassified: number;
  readonly dataFreshness: number;
  readonly defiPositions: number;
  readonly nftCnftCoverage: number;
  readonly resolvedPrices: number;
  readonly rpcDasCompleteness: number;
  readonly stakeAccounts: number;
};

export type QesInput = {
  readonly accountClass: AccountClass;
  readonly address: string;
  readonly concentrationRatio: number | null;
  readonly confidence: QciInput;
  readonly daysSinceLastActivity: number | null;
  readonly observableAgeDays: number | null;
  readonly scannedAt?: string;
  readonly significantTokenAccounts: number;
  readonly stakedOrLockedUsd: number;
  readonly totalUsd: number;
};

export type Grade = "A" | "B" | "C" | "D" | "E";
export type DisplayGrade = Grade | "N/A";

export type QesStatus = "fragile_estimate" | "insufficient_data" | "not_applicable" | "ok";

export type QesFactorKey =
  | "concentration"
  | "observableAge"
  | "observableAssetValue"
  | "recentActivity"
  | "significantTokenAccounts"
  | "stakedOrLockedAssets";

export type QciDimensionKey = keyof QciInput;

export type QesResult = {
  readonly address: string;
  readonly breakdown: Record<string, number>;
  readonly estimatedMigrationExposureValueUsd: number;
  readonly grade: DisplayGrade | null;
  readonly gradeDisplayed: boolean;
  readonly qci: number;
  readonly qciVersion: "1.0.0";
  readonly qes: number | null;
  readonly qesVersion: "1.1.0";
  readonly recommendations: readonly string[];
  readonly scannedAt: string;
  readonly status: QesStatus;
  readonly warnings: readonly string[];
};
