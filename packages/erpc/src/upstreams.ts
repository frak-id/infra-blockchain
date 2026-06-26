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
 * Method specifics for for the smart wallets
 */
const erc4337Methods = [
    "eth_estimateUserOperationGas",
    "eth_getUserOperation*",
    "eth_sendUserOperation",
    "eth_supportedEntryPoints",
    "pm_*",
    "pimlico_*",
];

export const alchemyProvider = {
    vendor: "alchemy",
    settings: {
        apiKey: process.env.ALCHEMY_API_KEY,
    },
    overrides: {
        "evm:*": {
            ignoreMethods: erc4337Methods,
            rateLimitBudget: "alchemy",
            rateLimitAutoTune: freeTierAutoTune(5, 20),
        },
    },
} as const satisfies ProviderConfig;

export const drpcArbUpstream = {
    endpoint: `https://lb.drpc.live/arbitrum/${process.env.DRPC_API_KEY}`,
    type: "evm",
    vendorName: "drpc",
    // Budget for rate limiting
    rateLimitBudget: "drpc",
    rateLimitAutoTune: freeTierAutoTune(5, 30),
    ignoreMethods: erc4337Methods,
} as const satisfies UpstreamConfig;

export const drpcArbSepoliaUpstream = {
    endpoint: `https://lb.drpc.live/arbitrum-sepolia/${process.env.DRPC_API_KEY}`,
    type: "evm",
    vendorName: "drpc",
    // Budget for rate limiting
    rateLimitBudget: "drpc",
    rateLimitAutoTune: freeTierAutoTune(5, 30),
    ignoreMethods: erc4337Methods,
} as const satisfies UpstreamConfig;

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

export const dwelirArbUpstream = {
    endpoint: `https://api-arbitrum-mainnet-archive.n.dwellir.com/${process.env.DWELIR_API_KEY}`,
    type: "evm",
    vendorName: "dwelir",
    // Budget for rate limiting
    rateLimitBudget: "dwelir",
    rateLimitAutoTune: freeTierAutoTune(5, 20),
    ignoreMethods: erc4337Methods,
} as const satisfies UpstreamConfig;

export const dwelirArbSepoliaUpstream = {
    endpoint: `https://api-arbitrum-sepolia.n.dwellir.com/${process.env.DWELIR_API_KEY}`,
    type: "evm",
    vendorName: "dwelir",
    // Budget for rate limiting
    rateLimitBudget: "dwelir",
    rateLimitAutoTune: freeTierAutoTune(5, 20),
    ignoreMethods: erc4337Methods,
} as const satisfies UpstreamConfig;

// BlockPi returns Arbitrum's eth_syncing result as a (base64) string instead of
// a boolean/object, which the evm state poller cannot parse. Ignore the method
// so the poller marks it unsupported on the first cycle and stops retrying
// (otherwise it logs a warning ~10 times per pod before giving up).
const blockPiIgnoreMethods = [...erc4337Methods, "eth_syncing"];

export const blockPiArbUpstream = {
    endpoint: `https://arbitrum.blockpi.network/v1/rpc/${process.env.BLOCKPI_API_KEY_ARB}`,
    type: "evm",
    vendorName: "blockPi",
    // Budget for rate limiting
    rateLimitBudget: "blockPi",
    rateLimitAutoTune: freeTierAutoTune(5, 20),
    ignoreMethods: blockPiIgnoreMethods,
} as const satisfies UpstreamConfig;

export const blockPiArbSepoliaUpstream = {
    endpoint: `https://arbitrum-sepolia.blockpi.network/v1/rpc/${process.env.BLOCKPI_API_KEY_ARB_SEPOLIA}`,
    type: "evm",
    vendorName: "blockPi",
    // Budget for rate limiting
    rateLimitBudget: "blockPi",
    rateLimitAutoTune: freeTierAutoTune(5, 20),
    ignoreMethods: blockPiIgnoreMethods,
} as const satisfies UpstreamConfig;
