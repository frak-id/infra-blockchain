import {
    type CacheConfig,
    CacheEmptyBehaviorAllow,
    CacheEmptyBehaviorIgnore,
    type CachePolicyConfig,
    type ConnectorConfig,
    DataFinalityStateFinalized,
    DataFinalityStateRealtime,
    DataFinalityStateUnfinalized,
} from "@erpc-cloud/config";

if (!process.env.ERPC_DATABASE_URL) {
    throw new Error("Missing ERPC_DATABASE_URL environment variable");
}

/**
 * The connectors we will use
 */
const connectors = [
    {
        id: "pg-main",
        driver: "postgresql",
        postgresql: {
            connectionUri: process.env.ERPC_DATABASE_URL as string,
            table: "rpc_cache",
        },
    },
    {
        id: "memory-finalized",
        driver: "memory",
        memory: { maxItems: 4_096 },
    },
    {
        id: "memory-unfinalized",
        driver: "memory",
        memory: { maxItems: 4_096 },
    },
    {
        id: "memory-realtime",
        driver: "memory",
        memory: { maxItems: 4_096 },
    },
] as const satisfies ConnectorConfig[];

/**
 * Define the cache policies we will use
 */
const cachePolicies = [
    // Cache all the heavy finalized data in the pg database
    {
        connector: "pg-main",
        network: "*",
        method: "eth_getLogs | eth_getBlockBy* | eth_getTransactionReceipt",
        finality: DataFinalityStateFinalized,
        empty: CacheEmptyBehaviorAllow,
    },
    {
        connector: "memory-finalized",
        network: "*",
        method: "*",
        finality: DataFinalityStateFinalized,
        empty: CacheEmptyBehaviorAllow,
        ttl: "6h",
    },
    // Cache not finalized data for 2sec in the memory
    {
        connector: "memory-unfinalized",
        network: "*",
        method: "*",
        finality: DataFinalityStateUnfinalized,
        empty: CacheEmptyBehaviorIgnore,
        ttl: "2s",
        maxItemSize: "20kb",
    },
    // Cache realtime data for 2sec on the memory on arbitrum
    {
        connector: "memory-realtime",
        network: "evm:42161",
        method: "*",
        finality: DataFinalityStateRealtime,
        empty: CacheEmptyBehaviorIgnore,
        ttl: "2s",
    },
    // Cache realtime data for 30sec on arbitrum sepolia
    {
        connector: "memory-realtime",
        network: "evm:421614",
        method: "*",
        finality: DataFinalityStateRealtime,
        empty: CacheEmptyBehaviorIgnore,
        ttl: "5s",
    },
] as const satisfies CachePolicyConfig[];

/**
 * Export our final cache config
 */
export const cacheConfig = {
    connectors,
    policies: cachePolicies,
} as const satisfies CacheConfig;
