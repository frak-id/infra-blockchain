import type { ProviderConfig, UpstreamConfig } from "@erpc-cloud/config";

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
        },
    },
} as const satisfies ProviderConfig;

export const drpcArbUpstream = {
    endpoint: `https://lb.drpc.live/arbitrum/${process.env.DRPC_API_KEY}`,
    type: "evm",
    vendorName: "drpc",
    // Budget for rate limiting
    rateLimitBudget: "drpc",
    ignoreMethods: erc4337Methods,
} as const satisfies UpstreamConfig;

export const drpcArbSepoliaUpstream = {
    endpoint: `https://lb.drpc.live/arbitrum-sepolia/${process.env.DRPC_API_KEY}`,
    type: "evm",
    vendorName: "drpc",
    // Budget for rate limiting
    rateLimitBudget: "drpc",
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
    ignoreMethods: erc4337Methods,
} as const satisfies UpstreamConfig;

export const dwelirArbSepoliaUpstream = {
    endpoint: `https://api-arbitrum-sepolia.n.dwellir.com/${process.env.DWELIR_API_KEY}`,
    type: "evm",
    vendorName: "dwelir",
    // Budget for rate limiting
    rateLimitBudget: "dwelir",
    ignoreMethods: erc4337Methods,
} as const satisfies UpstreamConfig;

export const blockPiArbUpstream = {
    endpoint: `https://arbitrum.blockpi.network/v1/rpc/${process.env.BLOCKPI_API_KEY_ARB}`,
    type: "evm",
    vendorName: "blockPi",
    // Budget for rate limiting
    rateLimitBudget: "blockPi",
    ignoreMethods: erc4337Methods,
} as const satisfies UpstreamConfig;

export const blockPiArbSepoliaUpstream = {
    endpoint: `https://arbitrum-sepolia.blockpi.network/v1/rpc/${process.env.BLOCKPI_API_KEY_ARB_SEPOLIA}`,
    type: "evm",
    vendorName: "blockPi",
    // Budget for rate limiting
    rateLimitBudget: "blockPi",
    ignoreMethods: erc4337Methods,
} as const satisfies UpstreamConfig;
