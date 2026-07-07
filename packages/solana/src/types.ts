import type { QciInput } from "@quantalayer/scoring";

export type SolanaCluster = "devnet" | "mainnet-beta";
export type AccountClassHint = "pda" | "system" | "unknown";
export type AccountClass = "multisig" | "pda" | "program" | "system" | "unknown";

export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const LAMPORTS_PER_SOL = 1_000_000_000;

export type AddressValidationResult = {
  readonly accountClassHint: AccountClassHint;
  readonly address: string;
  readonly isOnCurve: boolean;
  readonly isValid: boolean;
};

export type TokenInfo = {
  readonly balance: string;
  readonly decimals: number;
  readonly mint: string;
  readonly symbol?: string;
};

export type HeliusAsset = {
  readonly id: string;
  readonly interface: string;
  readonly tokenInfo?: TokenInfo;
};

export type StakeAccount = {
  readonly lamports: bigint;
};

export type HeliusDataClient = {
  readonly getAssetsByOwner: (address: string) => Promise<readonly HeliusAsset[]>;
  readonly getSolBalanceLamports: (address: string) => Promise<bigint>;
  readonly getStakeAccountsByAuthority: (address: string) => Promise<readonly StakeAccount[]>;
};

export type JupiterPriceClientLike = {
  readonly getPrices: (ids: readonly string[]) => Promise<ReadonlyMap<string, number>>;
};

export type RawWalletScan = {
  readonly accountClass: AccountClass;
  readonly address: string;
  readonly concentrationRatio: number | null;
  readonly confidence: QciInput;
  readonly daysSinceLastActivity: number | null;
  readonly observableAgeDays: number | null;
  readonly significantTokenAccounts: number;
  readonly solBalanceLamports: bigint;
  readonly source: {
    readonly cluster: SolanaCluster;
    readonly priceProvider: "jupiter";
    readonly rpcProvider: "helius";
  };
  readonly stakedOrLockedUsd: number;
  readonly tokenAccountsCount: number;
  readonly totalUsd: number;
  readonly warnings: readonly string[];
};

export type FetchLike = (url: string | URL, init?: RequestInit) => Promise<Response>;

export type CacheAdapter = {
  readonly delete?: (key: string) => Promise<void>;
  readonly get: <T>(key: string) => Promise<T | null>;
  readonly set: <T>(key: string, value: T, ttlSeconds: number) => Promise<void>;
};
