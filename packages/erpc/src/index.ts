import type { Config, LogLevel, ProjectConfig } from "@erpc-cloud/config";
import {
    alchemyRateLimits,
    blockPiRateLimits,
    drpcRateLimits,
    dwellirRateLimits,
} from "./rateLimits";
import { cacheConfig } from "./storage";
import {
    alchemyProvider,
    blockPiArbSepoliaUpstream,
    blockPiArbUpstream,
    drpcArbSepoliaUpstream,
    drpcArbUpstream,
    dwellirArbSepoliaUpstream,
    dwellirArbUpstream,
    pimlicoProvider,
} from "./upstreams";

/**
 * The nexus rpc project
 *  - only on alchemy + pimlico + drpc
 */
const nexusProject = {
    id: "nexus-rpc",
    // The nexus secret ships in the wallet bundles, so anyone can call us:
    // deny every client directive (X-ERPC-* headers / ?skip-cache-read=,
    // ?use-upstream=, ...) so callers can't bypass the cache or pin upstreams
    allowClientDirectives: "",
    providers: [alchemyProvider, pimlicoProvider],
    upstreams: [
        drpcArbUpstream,
        drpcArbSepoliaUpstream,
        dwellirArbUpstream,
        dwellirArbSepoliaUpstream,
        blockPiArbUpstream,
        blockPiArbSepoliaUpstream,
    ],
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
                    // delay resolves to base + p95 latency, clamped to [min, max]
                    delay: {
                        base: "50ms",
                        quantile: 0.95,
                        min: "300ms",
                        max: "2s",
                    },
                },
                timeout: {
                    // Timeout each request after 5s
                    duration: "5s",
                },
            },
        ],
        // erpc's default selection policy, with the block-head lag gate sized
        // for Arbitrum. The default excludes at 16 blocks / 30s, but Arbitrum
        // makes ~4 blocks/s and heads are polled every 30s: polls land a few
        // seconds apart, so an upstream is up to ~120 blocks "behind" between
        // its polls. The network head is the second-highest polled head, so
        // Alchemy (2-3s ahead of the others) got excluded on every poll
        // cycle and stickyPrimary kept traffic off it. 240 blocks / 60s =
        // two poll intervals, only trips on a genuinely stuck upstream.
        selectionPolicy: {
            evalFunc: (upstreams) =>
                upstreams
                    .removeCordoned()
                    .excludeIf(all(samplesAbove(10), errorRateAbove(0.7)))
                    .excludeIf(all(samplesAbove(10), throttleRateAbove(0.4)))
                    .excludeIf(
                        any(
                            all(
                                samplesAbove(20),
                                latencyAbove(3000),
                                latencyDeviationAbove(3, { mode: "majority" })
                            ),
                            latencyAbove(10_000)
                        )
                    )
                    .excludeIf(
                        any(blockNumberLagAbove(240), blockSecondsLagAbove(60))
                    )
                    .whenEmpty(() => upstreams)
                    .preferTag("!tier:fallback", {
                        minHealthy: 1,
                        fallback: "tier:fallback",
                    })
                    .sortByScore(PREFER_FASTEST)
                    .stickyPrimary({
                        hysteresis: 0.3,
                        minSwitchInterval: "30s",
                    })
                    .probeExcluded({
                        sampleRate: 0.1,
                        minSamples: 10,
                        minSamplesWindow: "60s",
                        maxConcurrent: 4,
                        timeout: "10s",
                    }),
        },
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
        listenV4: true,
        httpPortV4: 8080,
        maxTimeout: "60s",
        listenV6: false,
        // Keep the X-ERPC-* counters, drop the per-attempt upstream trace
        executionHeaders: "summary",
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
    projects: [nexusProject],
    // Each rate limits
    rateLimiters: {
        budgets: [
            alchemyRateLimits,
            drpcRateLimits,
            dwellirRateLimits,
            blockPiRateLimits,
        ],
    },
} as const satisfies Config;
