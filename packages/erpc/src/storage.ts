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
        id: "memory-unfinalized",
        driver: "memory",
        memory: {
            // max 4k items for un-finalized cache
            maxItems: 4_096,
        },
    },
    {
        id: "memory-realtime",
        driver: "memory",
        memory: {
            // Max 4k items for realtime cache
            maxItems: 4_096,
        },
    },
] as const satisfies ConnectorConfig[];

/**
 * Define the cache policies we will use
 *  todo: Should check with 4337 userOpGas price if it play nicely
 *  todo: Also find a way to cache 4337 related et_getCode method for longer period in memory? Only if non empty maybe?
 */
const cachePolicies = [
    // Cache all finalized data in the pg database
    {
        connector: "pg-main",
        network: "*",
        method: "*",
        finality: DataFinalityStateFinalized,
        empty: CacheEmptyBehaviorAllow,
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
        ttl: "30s",
    },
] as const satisfies CachePolicyConfig[];

/**
 * Export our final cache config
 */
export const cacheConfig = {
    connectors,
    policies: cachePolicies,
} as const satisfies CacheConfig;
