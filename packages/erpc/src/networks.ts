import type { FailsafeConfig, NetworkConfig } from "@erpc-cloud/config";

const defaultFailsafe: FailsafeConfig = {
    retry: {
        maxAttempts: 2,
        delay: "100ms",
        backoffMaxDelay: "2s",
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
            duration: "5s",
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
            duration: "10s",
        },
    },
    evm: {
        chainId: 421614,
    },
} as const satisfies NetworkConfig;
