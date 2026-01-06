import type { Config, LogLevel, ProjectConfig } from "@erpc-cloud/config";
import {
    blockPiRateLimits,
    dwelirRateLimits,
    indexerProjectRateLimits,
} from "./rateLimits";
import { cacheConfig } from "./storage";
import {
    alchemyProvider,
    blockPiArbSepoliaUpstream,
    blockPiArbUpstream,
    drpcProvider,
    dwelirArbSepoliaUpstream,
    dwelirArbUpstream,
    envioProvider,
    freeRpcProvider,
    pimlicoProvider,
} from "./upstreams";

/**
 * The ponder rpc project
 *  - indexing only on envio + dwelir + blockPi
 */
const ponderProject = {
    id: "ponder-rpc",
    rateLimitBudget: "indexer",
    providers: [envioProvider, freeRpcProvider],
    upstreams: [blockPiArbUpstream, blockPiArbSepoliaUpstream],
    networkDefaults: {
        failsafe: [
            {
                retry: {
                    maxAttempts: 2,
                    delay: "100ms",
                    backoffMaxDelay: "2s",
                    backoffFactor: 0.5,
                    jitter: "200ms",
                },
                hedge: {
                    // Wait at least 2s before hedging a request
                    delay: "5s",
                    maxCount: 3,
                },
                timeout: {
                    // Timeout each request after 10s
                    duration: "10s",
                },
            },
        ],
        evm: {
            integrity: {
                enforceGetLogsBlockRange: true,
                enforceHighestBlock: true,
            },
        },
    },
    auth: {
        strategies: [
            {
                type: "secret",
                secret: {
                    id: "ponder-rpc-secret",
                    value: process.env.PONDER_RPC_SECRET ?? "a",
                },
            },
        ],
    },
} as const satisfies ProjectConfig;

/**
 * The nexus rpc project
 *  - only on alchemy + pimlico + drpc
 */
const nexusProject = {
    id: "nexus-rpc",
    providers: [alchemyProvider, pimlicoProvider, drpcProvider],
    upstreams: [dwelirArbUpstream, dwelirArbSepoliaUpstream],
    auth: {
        strategies: [
            {
                type: "secret",
                secret: {
                    id: "nexus-rpc-secret",
                    value: process.env.NEXUS_RPC_SECRET ?? "a",
                },
            },
        ],
    },
    networkDefaults: {
        failsafe: [
            {
                retry: {
                    maxAttempts: 3,
                    delay: "80ms",
                    backoffMaxDelay: "500ms",
                    backoffFactor: 0.5,
                    jitter: "200ms",
                },
                hedge: {
                    maxCount: 2,
                    delay: "50ms",
                    minDelay: "300ms",
                    maxDelay: "2s",
                    quantile: 0.95,
                },
                timeout: {
                    // Timeout each request after 5s
                    duration: "5s",
                },
            },
        ],
    },
    cors: {
        allowedOrigins: ["*"],
        allowedMethods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["X-Request-ID"],
        allowCredentials: true,
        maxAge: 3600,
    },
} as const satisfies ProjectConfig;

/**
 * Create the erpc config
 */
export default {
    // Log level
    logLevel: (process.env.ERPC_LOG_LEVEL ?? "debug") as LogLevel,
    // Server + metrics config
    server: {
        httpPort: 8080,
        maxTimeout: "60s",
        listenV6: false,
    },
    metrics: {
        enabled: true,
        listenV4: true,
        hostV4: "0.0.0.0",
        port: 6060,
        listenV6: false,
    },
    // Caching configuration
    database: {
        evmJsonRpcCache: cacheConfig,
    },
    // Each projects
    projects: [ponderProject, nexusProject],
    // Each rate limits
    rateLimiters: {
        budgets: [
            dwelirRateLimits,
            blockPiRateLimits,
            indexerProjectRateLimits,
        ],
    },
} as const satisfies Config;
