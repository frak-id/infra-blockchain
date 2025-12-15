import type { RateLimitBudgetConfig } from "@erpc-cloud/config";

/**
 * Max 20 RPS on dwelir
 */
export const dwelirRateLimits = {
    id: "dwelir",
    rules: [
        {
            method: "*",
            maxCount: 20,
            period: 0, // == RateLimitPeriodSecond
            waitTime: "5s",
        },
    ],
} as const satisfies RateLimitBudgetConfig;

/**
 * Max 20 RPS on blockpi
 */
export const blockPiRateLimits = {
    id: "blockPi",
    rules: [
        {
            method: "*",
            maxCount: 20,
            period: 0, // == RateLimitPeriodSecond
            waitTime: "5s",
        },
    ],
} as const satisfies RateLimitBudgetConfig;

/**
 * Max 50 RPS on the indexer
 */
export const indexerProjectRateLimits = {
    id: "indexer",
    rules: [
        {
            method: "*",
            maxCount: 200,
            period: 0, // == RateLimitPeriodSecond
            waitTime: "5s",
        },
    ],
} as const satisfies RateLimitBudgetConfig;
