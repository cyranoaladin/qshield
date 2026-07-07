import { ValidationError } from "@quantalayer/shared";

import type {
  RawWalletScan,
  HeliusDataClient,
  JupiterPriceClientLike,
  SolanaCluster,
} from "./types.js";
import { LAMPORTS_PER_SOL, SOL_MINT } from "./types.js";
import { validateSolanaAddress } from "./validate-address.js";

const MIN_SIGNIFICANT_ASSET_USD = 1;

type ScanAddressOptions = {
  readonly cluster: SolanaCluster;
  readonly helius: HeliusDataClient;
  readonly jupiter: JupiterPriceClientLike;
};

export async function scanAddress(
  address: string,
  options: ScanAddressOptions,
): Promise<RawWalletScan> {
  const validation = validateSolanaAddress(address);

  if (!validation.isValid) {
    throw new ValidationError("Invalid Solana address", {
      detail: "Address must be base58 encoded and decode to 32 bytes",
    });
  }

  const [solBalanceLamports, assets, stakeAccounts] = await Promise.all([
    options.helius.getSolBalanceLamports(address),
    options.helius.getAssetsByOwner(address),
    options.helius.getStakeAccountsByAuthority(address),
  ]);
  const tokenAssets = assets.filter((asset) => asset.tokenInfo !== undefined);
  const mints = [SOL_MINT, ...tokenAssets.map((asset) => asset.tokenInfo?.mint ?? asset.id)];
  const prices = await options.jupiter.getPrices(mints);
  const solPrice = prices.get(SOL_MINT);
  const solAmount = Number(solBalanceLamports) / LAMPORTS_PER_SOL;
  const solValueUsd = solPrice === undefined ? 0 : solAmount * solPrice;
  const stakeLamports = stakeAccounts.reduce((sum, account) => sum + account.lamports, 0n);
  const stakedOrLockedUsd =
    solPrice === undefined ? 0 : (Number(stakeLamports) / LAMPORTS_PER_SOL) * solPrice;
  let tokenValueUsd = 0;
  let significantTokenAccounts = 0;
  let unresolvedPositiveAssets = solBalanceLamports > 0n && solPrice === undefined ? 1 : 0;

  for (const asset of tokenAssets) {
    const tokenInfo = asset.tokenInfo;

    if (tokenInfo === undefined) {
      continue;
    }

    const amount = Number(tokenInfo.balance) / 10 ** tokenInfo.decimals;
    const price = prices.get(tokenInfo.mint);

    if (amount > 0 && price === undefined) {
      unresolvedPositiveAssets += 1;
      continue;
    }

    const valueUsd = amount * (price ?? 0);
    tokenValueUsd += valueUsd;

    if (valueUsd >= MIN_SIGNIFICANT_ASSET_USD) {
      significantTokenAccounts += 1;
    }
  }

  if (stakeLamports > 0n && solPrice === undefined) {
    unresolvedPositiveAssets += 1;
  }

  const resolvedValueUsd = roundUsd(solValueUsd + tokenValueUsd + stakedOrLockedUsd);
  const totalUsd = resolvedValueUsd;
  const confidence = confidenceFromResolvedValue(resolvedValueUsd, unresolvedPositiveAssets);
  const warnings = buildWarnings(unresolvedPositiveAssets);

  return {
    accountClass: validation.accountClassHint === "pda" ? "pda" : "system",
    address,
    concentrationRatio: null,
    confidence,
    daysSinceLastActivity: null,
    observableAgeDays: null,
    significantTokenAccounts,
    solBalanceLamports,
    source: {
      cluster: options.cluster,
      priceProvider: "jupiter",
      rpcProvider: "helius",
    },
    stakedOrLockedUsd: roundUsd(stakedOrLockedUsd),
    tokenAccountsCount: tokenAssets.length,
    totalUsd,
    warnings,
  };
}

function confidenceFromResolvedValue(resolvedValueUsd: number, unresolvedPositiveAssets: number) {
  const resolvedPrices =
    resolvedValueUsd === 0 && unresolvedPositiveAssets === 0
      ? 1
      : resolvedValueUsd / (resolvedValueUsd + unresolvedPositiveAssets);

  return {
    accountClassified: 1,
    dataFreshness: 1,
    defiPositions: 1,
    nftCnftCoverage: 1,
    resolvedPrices,
    rpcDasCompleteness: 1,
    stakeAccounts: 1,
  };
}

function buildWarnings(unresolvedPositiveAssets: number): string[] {
  return [
    "Observable age unavailable from current read-only data layer.",
    "Recent activity unavailable from current read-only data layer.",
    ...(unresolvedPositiveAssets === 0
      ? []
      : ["Some positive-balance assets could not be priced; QCI was reduced."]),
  ];
}

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}
