import type { FailsafeConfig, NetworkConfig } from "@erpc-cloud/config";

const defaultFailsafe: FailsafeConfig = {
    retry: {
        maxAttempts: 2,
        delay: "100ms",
        backoffMaxDelay: "2s",
        backoffFactor: 0.5,
        jitter: "200ms",
    },
    // @ts-ignore: Should expose a type union for the hedge policy
    hedge: {
        // delay: "3s",
        maxCount: 2,
        minDelay: "100ms",
        maxDelay: "2s",
        quantile: 0.95,
    },
};

export const arbNetwork = {
    architecture: "evm",
    failsafe: {
        ...defaultFailsafe,
        timeout: {
            duration: "5s",
        },
    },
    evm: {
        chainId: 42161,
        integrity: {
            enforceGetLogsBlockRange: true,
        },
    },
} as const satisfies NetworkConfig;

export const arbSepoliaNetwork = {
    architecture: "evm",
    failsafe: {
        ...defaultFailsafe,
        timeout: {
            duration: "10s",
        },
    },
    evm: {
        chainId: 421614,
        integrity: {
            enforceGetLogsBlockRange: true,
        },
    },
    // selectionPolicy: {
    //     // Evaluate upstream every 5min
    //     // @ts-ignore: Should export a TsDuration type
    //     evalInterval: 300_000_000_000,
    //     // Resample every 10min
    //     // @ts-ignore: Should export a TsDuration type
    //     resampleInterval: 600_000_000_000,
    //     resampleCount: 10
    // }
} as const satisfies NetworkConfig;
