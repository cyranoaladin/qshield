import {
  type EnvWithScanProvider,
  type ServerEnv,
  assertScanProviderEnv,
} from "@quantalayer/shared";
import {
  HeliusClient,
  JupiterPriceClient,
  scanAddress,
  type HeliusDataClient,
  type JupiterPriceClientLike,
  type RawWalletScan,
} from "@quantalayer/solana";

type RuntimeScanProvider = {
  readonly scanAddress: (address: string) => Promise<RawWalletScan>;
};

type ScanAddressImpl = typeof scanAddress;

type RuntimeScanProviderDeps = {
  readonly createHeliusClient?: (env: EnvWithScanProvider) => HeliusDataClient;
  readonly createJupiterClient?: (env: EnvWithScanProvider) => JupiterPriceClientLike;
  readonly scanAddressImpl?: ScanAddressImpl;
};

type RuntimeClients = {
  readonly helius: HeliusDataClient;
  readonly jupiter: JupiterPriceClientLike;
};

export function buildRuntimeScanProvider(
  env: ServerEnv,
  deps: RuntimeScanProviderDeps = {},
): RuntimeScanProvider {
  let clients: RuntimeClients | null = null;
  const scanAddressImpl = deps.scanAddressImpl ?? scanAddress;

  return {
    async scanAddress(address: string): Promise<RawWalletScan> {
      assertScanProviderEnv(env);

      clients ??= {
        helius: (deps.createHeliusClient ?? defaultCreateHeliusClient)(env),
        jupiter: (deps.createJupiterClient ?? defaultCreateJupiterClient)(env),
      };

      return scanAddressImpl(address, {
        cluster: env.solanaCluster,
        helius: clients.helius,
        jupiter: clients.jupiter,
      });
    },
  };
}

function defaultCreateHeliusClient(env: EnvWithScanProvider): HeliusDataClient {
  return new HeliusClient({
    apiKey: env.heliusApiKey,
    rpcUrl: env.heliusRpcUrl,
  });
}

function defaultCreateJupiterClient(env: EnvWithScanProvider): JupiterPriceClientLike {
  return new JupiterPriceClient({
    baseUrl: env.jupiterPriceUrl,
  });
}
