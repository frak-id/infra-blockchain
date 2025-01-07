import type { FailsafeConfig, NetworkConfig } from "@erpc-cloud/config";

const defaultFailsafe: FailsafeConfig = {
    retry: {
        maxAttempts: 5,
        delay: "500ms",
        backoffMaxDelay: "10s",
        backoffFactor: 0.5,
        jitter: "200ms",
    },
    hedge: {
        delay: "3s",
        maxCount: 2,
    },
};

export const arbNetwork = {
    architecture: "evm",
    failsafe: {
        ...defaultFailsafe,
        timeout: {
            duration: "30s",
        },
    },
    evm: {
        chainId: 42161,
    },
} as const satisfies NetworkConfig;

export const arbSepoliaNetwork = {
    architecture: "evm",
    failsafe: {
        ...defaultFailsafe,
        timeout: {
            duration: "60s",
        },
    },
    evm: {
        chainId: 421614,
    },
} as const satisfies NetworkConfig;
