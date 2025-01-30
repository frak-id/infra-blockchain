import type { UpstreamConfig } from "@erpc-cloud/config";

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

const indexingMethods = [
    "eth_chainId",
    "eth_blockNumber",
    "eth_getLogs",
    "eth_getBlock*",
    "eth_getTransaction*",
];

const freeRpcMethods = [
    "eth_chainId",
    "eth_blockNumber",
    "eth_call",
    "eth_getCode",
    "eth_getStorageAt",
    "eth_getBlock*",
    "eth_getTransaction*",
];

// Drpc methods are indexing + free rpc methods deduplicated
const drpcMethods = Array.from(
    new Set([...indexingMethods, ...freeRpcMethods])
);

export const envioUpstream = {
    endpoint: "evm+envio://rpc.hypersync.xyz",
    type: "evm+envio",
    vendorName: "Envio",
    ignoreMethods: ["*"],
    // Budget for rate limiting
    rateLimitBudget: "envio",
    // Only allow getLogs, getBlockBy and getTransactions*
    allowMethods: indexingMethods,
} as const satisfies UpstreamConfig;

export const alchemyUpstream = {
    endpoint: `evm+alchemy://${process.env.ALCHEMY_API_KEY}`,
    type: "evm+alchemy",
    vendorName: "Alchemy",
    // Budget for rate limiting
    rateLimitBudget: "alchemy",
    // Ignore all the pimlico
    ignoreMethods: erc4337Methods,
} as const satisfies UpstreamConfig;

export const pimlicoUpstream = {
    endpoint: `evm+pimlico://${process.env.PIMLICO_API_KEY}`,
    type: "evm+pimlico",
    vendorName: "Pimlico",
    // Budget for rate limiting
    rateLimitBudget: "pimlico",
    // Only allow the 4337 methods
    ignoreMethods: ["*"],
    allowMethods: ["eth_chainId", ...erc4337Methods],
} as const satisfies UpstreamConfig;

export const drpcUpstream = {
    endpoint: `drpc://${process.env.DRPC_API_KEY}`,
    type: "evm+drpc",
    vendorName: "drpc",
    // Budget for rate limiting
    rateLimitBudget: "drpc",
    // Only allow chainId, getBlockBy and getLogs
    ignoreMethods: ["*"],
    allowMethods: drpcMethods,
} as const satisfies UpstreamConfig;

export const dwelirArbUpstream = {
    endpoint: `https://api-arbitrum-mainnet-archive.dwellir.com/${process.env.DWELIR_API_KEY}`,
    type: "evm",
    vendorName: "dwelir",
    // Budget for rate limiting
    rateLimitBudget: "drpc",
    // Only allow chainId, getBlockBy and getLogs
    ignoreMethods: ["*"],
    allowMethods: drpcMethods,
} as const satisfies UpstreamConfig;

export const dwelirArbSepoliaUpstream = {
    endpoint: `https://api-arbitrum-sepolia-archive.dwellir.com/${process.env.DWELIR_API_KEY}`,
    type: "evm",
    vendorName: "dwelir",
    // Budget for rate limiting
    rateLimitBudget: "drpc",
    // Only allow chainId, getBlockBy and getLogs
    ignoreMethods: ["*"],
    allowMethods: drpcMethods,
} as const satisfies UpstreamConfig;
