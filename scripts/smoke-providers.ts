import { config as loadDotenv } from "dotenv";

import { calculateQes } from "@quantalayer/scoring";
import { HeliusClient, JupiterPriceClient, scanAddress } from "@quantalayer/solana";

loadDotenv({ quiet: true });

const address = requiredEnv(
  "SMOKE_SOLANA_ADDRESS",
  "Provide a non-sensitive public Solana test address before running a live provider smoke test.",
);
const heliusApiKey = requiredEnv("HELIUS_API_KEY");
const heliusRpcUrl = urlEnv("HELIUS_RPC_URL", "https://mainnet.helius-rpc.com");
const jupiterPriceUrl = urlEnv("JUPITER_PRICE_URL", "https://api.jup.ag/price/v2");
const solanaCluster = clusterEnv(process.env.SOLANA_CLUSTER ?? "mainnet-beta");
const helius = new HeliusClient({
  apiKey: heliusApiKey,
  rpcUrl: heliusRpcUrl,
});
const jupiter = new JupiterPriceClient({
  baseUrl: jupiterPriceUrl,
});

const raw = await scanAddress(address, {
  cluster: solanaCluster,
  helius,
  jupiter,
});
const scored = calculateQes({
  accountClass: raw.accountClass,
  address: raw.address,
  concentrationRatio: raw.concentrationRatio,
  confidence: raw.confidence,
  daysSinceLastActivity: raw.daysSinceLastActivity,
  observableAgeDays: raw.observableAgeDays,
  significantTokenAccounts: raw.significantTokenAccounts,
  stakedOrLockedUsd: raw.stakedOrLockedUsd,
  totalUsd: raw.totalUsd,
});

console.log(
  JSON.stringify(
    {
      address: truncateAddress(raw.address),
      grade: scored.grade,
      provider: raw.source,
      qci: scored.qci,
      qes: scored.qes,
      status: scored.status,
      warnings: [...new Set([...raw.warnings, ...scored.warnings])],
    },
    null,
    2,
  ),
);

function truncateAddress(value: string): string {
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function requiredEnv(name: string, help?: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    throw new Error(help === undefined ? `${name} is required` : `${name} is required. ${help}`);
  }

  return value;
}

function urlEnv(name: string, fallback: string): string {
  const value = process.env[name] ?? fallback;

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
}

function clusterEnv(value: string): "devnet" | "mainnet-beta" {
  if (value === "devnet" || value === "mainnet-beta") {
    return value;
  }

  throw new Error("SOLANA_CLUSTER must be devnet or mainnet-beta");
}
