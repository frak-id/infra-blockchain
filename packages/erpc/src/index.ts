import type { LogLevel } from "@erpc-cloud/config";
import { initErpcConfig } from "@konfeature/erpc-config-generator";
import { arbNetwork, arbSepoliaNetwork } from "./networks";
import {
    alchemyRateRules,
    blockPiRateRules,
    drpcRateRules,
    dwelirRateRules,
    envioRateRules,
    pimlicoRateRules,
} from "./rateLimits";
import { cacheConfig } from "./storage";
import {
    alchemyUpstream,
    drpcUpstream,
    dwelirArbSepoliaUpstream,
    dwelirArbUpstream,
    envioUpstream,
    pimlicoUpstream,
} from "./upstreams";

/**
 * Build our top level erpc config
 */
export default initErpcConfig({
    logLevel: (process.env.ERPC_LOG_LEVEL ?? "debug") as LogLevel,
    database: {
        evmJsonRpcCache: cacheConfig,
    },
    server: {
        httpPort: 8080,
        maxTimeout: "60s",
        listenV6: false,
    },
    metrics: { enabled: false },
})
    .addRateLimiters({
        alchemy: alchemyRateRules,
        envio: envioRateRules,
        pimlico: pimlicoRateRules,
        blockPi: blockPiRateRules,
        drpc: drpcRateRules,
        dwelir: dwelirRateRules,
    })
    // Add networks to the config
    .decorate("networks", {
        arbitrum: arbNetwork,
        arbitrumSepolia: arbSepoliaNetwork,
    })
    // Add upstreams to the config
    .decorate("upstreams", {
        envio: envioUpstream,
        alchemy: alchemyUpstream,
        pimlico: pimlicoUpstream,
        drpc: drpcUpstream,
        dwelirArb: dwelirArbUpstream,
        dwelirArbSepolia: dwelirArbSepoliaUpstream,
    })
    // Add our ponder prod project
    .addProject(({ store: { upstreams, networks } }) => ({
        id: "ponder-rpc",
        networks: [networks.arbitrum, networks.arbitrumSepolia],
        upstreams: [
            upstreams.alchemy,
            upstreams.envio,
            upstreams.drpc,
            upstreams.dwelirArb,
            upstreams.dwelirArbSepolia,
        ],
        providers: [],
        auth: {
            strategies: [
                {
                    type: "secret",
                    secret: {
                        value: process.env.PONDER_RPC_SECRET ?? "a",
                    },
                },
            ],
        },
    }))
    // Add our wallet project
    .addProject(({ store: { upstreams, networks } }) => ({
        id: "nexus-rpc",
        networks: [networks.arbitrum, networks.arbitrumSepolia],
        upstreams: [
            upstreams.alchemy,
            upstreams.drpc,
            upstreams.pimlico,
            upstreams.dwelirArb,
            upstreams.dwelirArbSepolia,
        ],
        providers: [],
        auth: {
            strategies: [
                {
                    type: "secret",
                    secret: {
                        value: process.env.NEXUS_RPC_SECRET ?? "a",
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
    }))
    // And bundle it altogether
    .build();
