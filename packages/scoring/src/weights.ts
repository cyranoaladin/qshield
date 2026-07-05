import type { QciDimensionKey, QesFactorKey } from "./types.js";

export const QES_VERSION = "1.1.0";
export const QCI_VERSION = "1.0.0";

export const QES_WEIGHTS = {
  concentration: 0.15,
  observableAge: 0.1,
  observableAssetValue: 0.35,
  recentActivity: 0.1,
  significantTokenAccounts: 0.1,
  stakedOrLockedAssets: 0.2,
} as const satisfies Record<QesFactorKey, number>;

export const QCI_WEIGHTS = {
  accountClassified: 0.05,
  dataFreshness: 0.1,
  defiPositions: 0.15,
  nftCnftCoverage: 0.1,
  resolvedPrices: 0.3,
  rpcDasCompleteness: 0.2,
  stakeAccounts: 0.1,
} as const satisfies Record<QciDimensionKey, number>;
