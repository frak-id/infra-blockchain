import type {
    ProviderConfig,
    RateLimitAutoTuneConfig,
    UpstreamConfig,
} from "@erpc-cloud/config";

if (!process.env.ALCHEMY_API_KEY) {
    throw new Error("Missing ALCHEMY_API_KEY environment variable");
}
if (!process.env.PIMLICO_API_KEY) {
    throw new Error("Missing PIMLICO_API_KEY environment variable");
}
if (!process.env.DRPC_API_KEY) {
    throw new Error("Missing DRPC_API_KEY environment variable");
}
if (!process.env.DWELIR_API_KEY) {
    throw new Error("Missing DWELIR_API_KEY environment variable");
}
if (!process.env.BLOCKPI_API_KEY_ARB) {
    throw new Error("Missing BLOCKPI_API_KEY_ARB environment variable");
}
if (!process.env.BLOCKPI_API_KEY_ARB_SEPOLIA) {
    throw new Error("Missing BLOCKPI_API_KEY_ARB_SEPOLIA environment variable");
}

/**
 * Auto-tune helper for free-tier upstreams.
 *
 * Adding a `rateLimitBudget` implicitly enables the auto-tuner, so we configure
 * it explicitly to avoid the unsafe defaults (`minBudget: 0` can drive the
 * budget to always-blocked; `maxBudget: 100000` lets it balloon past the free
 * tier). We pin `maxBudget` to the manual cap so the tuner only ever backs off
 * during throttling (capacity/429 storms) and recovers back up to the ceiling.
 *
 * Bounds are in the budget's unit, i.e. credits per second (every budget runs
 * in credit mode, see rateLimits.ts). Keep `minBudget` above the most expensive
 * method we route to the upstream, otherwise that method can never be admitted.
 */
const freeTierAutoTune = (
    minBudget: number,
    maxBudget: number
): RateLimitAutoTuneConfig => ({
    enabled: true,
    adjustmentPeriod: "30s",
    errorRateThreshold: 0.1,
    // recover gently, cut hard during a throttle storm
    increaseFactor: 1.1,
    decreaseFactor: 0.7,
    minBudget,
    maxBudget,
});

/**
 * Method specifics for the smart wallets
 */
const erc4337Methods = [
    "eth_estimateUserOperationGas",
    "eth_getUserOperation*",
    "eth_sendUserOperation",
    "eth_supportedEntryPoints",
    "pm_*",
    "pimlico_*",
];

/**
 * BlockPi request-unit (RU) cost of the methods we can route there.
 * Source: https://docs.blockpi.io/pricing/request-unit-ru/evm-ru-table
 * BlockPi bills unlisted methods by payload size (5 RU / 250 bytes), so "*"
 * falls back to the cost of a plain eth_call. Archive mode adds +30%.
 */
const blockPiRequestUnits = {
    "*": 20,
    eth_chainId: 5,
    eth_syncing: 5,
    net_version: 5,
    eth_blockNumber: 10,
    eth_gasPrice: 15,
    eth_getBalance: 15,
    eth_getCode: 15,
    eth_getStorageAt: 15,
    eth_getTransactionCount: 15,
    eth_getTransactionReceipt: 15,
    eth_call: 20,
    eth_estimateGas: 20,
    eth_getBlockByHash: 20,
    eth_getBlockByNumber: 20,
    eth_getTransactionByHash: 35,
    eth_getLogs: 50,
    eth_getBlockReceipts: 150,
    eth_sendRawTransaction: 200,
} satisfies Record<string, number>;

export const alchemyProvider = {
    vendor: "alchemy",
    settings: {
        apiKey: process.env.ALCHEMY_API_KEY,
    },
    overrides: {
        "evm:*": {
            ignoreMethods: erc4337Methods,
            rateLimitBudget: "alchemy",
            rateLimitCountMode: "credit",
            // 130 CU/s ~= 5 eth_call/s, 500 CU/s = free tier throughput
            rateLimitAutoTune: freeTierAutoTune(130, 500),
        },
    },
} as const satisfies ProviderConfig;

export const pimlicoProvider = {
    vendor: "pimlico",
    settings: {
        apiKey: process.env.PIMLICO_API_KEY,
    },
    overrides: {
        // Only allow the 4337 methods
        "evm:*": {
            ignoreMethods: ["*"],
            allowMethods: ["eth_chainId", ...erc4337Methods],
        },
    },
} as const satisfies ProviderConfig;

/**
 * dRPC: `vendorName` binds the built-in dRPC vendor (not auto-detected for
 * lb.drpc.live endpoints), which prices every billable call at a flat 20 CU.
 */
const drpcUpstreamBase = {
    type: "evm",
    vendorName: "drpc",
    rateLimitBudget: "drpc",
    rateLimitCountMode: "credit",
    // 100 CU/s = 5 calls/s, 600 CU/s = 30 calls/s
    rateLimitAutoTune: freeTierAutoTune(100, 600),
    ignoreMethods: erc4337Methods,
} as const satisfies Omit<UpstreamConfig, "endpoint">;

export const drpcArbUpstream = {
    ...drpcUpstreamBase,
    id: "drpc-arb",
    endpoint: `https://lb.drpc.live/arbitrum/${process.env.DRPC_API_KEY}`,
    evm: { chainId: 42161 },
} as const satisfies UpstreamConfig;

export const drpcArbSepoliaUpstream = {
    ...drpcUpstreamBase,
    id: "drpc-arb-sepolia",
    endpoint: `https://lb.drpc.live/arbitrum-sepolia/${process.env.DRPC_API_KEY}`,
    evm: { chainId: 421614 },
} as const satisfies UpstreamConfig;

/**
 * Dwellir: flat 1 credit per response. Made explicit since the vendor has no
 * built-in pricing table.
 */
const dwellirUpstreamBase = {
    type: "evm",
    vendorName: "dwellir",
    rateLimitBudget: "dwellir",
    rateLimitCountMode: "credit",
    creditUnits: { "*": 1 },
    rateLimitAutoTune: freeTierAutoTune(5, 20),
    ignoreMethods: erc4337Methods,
} as const satisfies Omit<UpstreamConfig, "endpoint">;

export const dwellirArbUpstream = {
    ...dwellirUpstreamBase,
    id: "dwellir-arb",
    endpoint: `https://api-arbitrum-mainnet-archive.n.dwellir.com/${process.env.DWELIR_API_KEY}`,
    evm: { chainId: 42161 },
} as const satisfies UpstreamConfig;

export const dwellirArbSepoliaUpstream = {
    ...dwellirUpstreamBase,
    id: "dwellir-arb-sepolia",
    endpoint: `https://api-arbitrum-sepolia.n.dwellir.com/${process.env.DWELIR_API_KEY}`,
    evm: { chainId: 421614 },
} as const satisfies UpstreamConfig;

/**
 * BlockPi: priced in RUs (see `blockPiRequestUnits`).
 *
 * BlockPi returns Arbitrum's eth_syncing result as a (base64) string instead of
 * a boolean/object, which the evm state poller can't parse, so the syncing
 * check is skipped and the upstream is treated as always synced.
 */
const blockPiUpstreamBase = {
    type: "evm",
    vendorName: "blockpi",
    rateLimitBudget: "blockpi",
    rateLimitCountMode: "credit",
    creditUnits: blockPiRequestUnits,
    // floor at 200 RU/s so eth_sendRawTransaction (200 RU) stays admissible,
    // 400 RU/s = free tier throughput
    rateLimitAutoTune: freeTierAutoTune(200, 400),
    ignoreMethods: erc4337Methods,
} as const satisfies Omit<UpstreamConfig, "endpoint">;

export const blockPiArbUpstream = {
    ...blockPiUpstreamBase,
    id: "blockpi-arb",
    endpoint: `https://arbitrum.blockpi.network/v1/rpc/${process.env.BLOCKPI_API_KEY_ARB}`,
    evm: { chainId: 42161, skipSyncingCheck: true },
} as const satisfies UpstreamConfig;

export const blockPiArbSepoliaUpstream = {
    ...blockPiUpstreamBase,
    id: "blockpi-arb-sepolia",
    endpoint: `https://arbitrum-sepolia.blockpi.network/v1/rpc/${process.env.BLOCKPI_API_KEY_ARB_SEPOLIA}`,
    evm: { chainId: 421614, skipSyncingCheck: true },
} as const satisfies UpstreamConfig;
