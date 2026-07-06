import { HeliusClient } from "./helius/client.js";
import { JupiterPriceClient } from "./jupiter/client.js";
import { scanAddress } from "./scan-address.js";
import type { SolanaCluster } from "./types.js";

const address = process.argv[2];

if (address === undefined) {
  console.error("Usage: pnpm --filter @quantalayer/solana demo:scan -- <solana-address>");
  process.exit(1);
}

const heliusApiKey = process.env.HELIUS_API_KEY;

if (heliusApiKey === undefined || heliusApiKey.length === 0) {
  console.error("HELIUS_API_KEY is required for the manual demo scan.");
  process.exit(1);
}

const result = await scanAddress(address, {
  cluster: parseCluster(process.env.SOLANA_CLUSTER),
  helius: new HeliusClient({
    apiKey: heliusApiKey,
    rpcUrl: process.env.HELIUS_RPC_URL ?? "https://mainnet.helius-rpc.com",
  }),
  jupiter: new JupiterPriceClient({
    baseUrl: process.env.JUPITER_PRICE_URL ?? "https://api.jup.ag/price/v2",
  }),
});

console.log(
  JSON.stringify(
    result,
    (_key, value: unknown) => (typeof value === "bigint" ? value.toString() : value),
    2,
  ),
);

function parseCluster(value: string | undefined): SolanaCluster {
  return value === "devnet" ? "devnet" : "mainnet-beta";
}
