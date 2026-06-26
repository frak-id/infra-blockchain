import type { RateLimitBudgetConfig } from "@erpc-cloud/config";

/**
 * Alchemy free tier: 500 CU/s over a 10s rolling window.
 * eth_call ~= 26 CU, so ~20 req/s keeps us safely within the budget.
 */
export const alchemyRateLimits = {
    id: "alchemy",
    rules: [
        {
            method: "*",
            maxCount: 20,
            period: 0, // == RateLimitPeriodSecond
        },
    ],
} as const satisfies RateLimitBudgetConfig;

/**
 * dRPC free tier: 120k CU/min normally (~100 eth_call/s), but can drop to a
 * 50,400 CU/min floor (~40 eth_call/s) under high regional demand. Cap at
 * 30 RPS to stay under the reduced-tier floor and avoid capacity-exceeded.
 */
export const drpcRateLimits = {
    id: "drpc",
    rules: [
        {
            method: "*",
            maxCount: 30,
            period: 0, // == RateLimitPeriodSecond
        },
    ],
} as const satisfies RateLimitBudgetConfig;

/**
 * Dwelir free tier: 20 responses/s (no burst on free tier).
 */
export const dwelirRateLimits = {
    id: "dwelir",
    rules: [
        {
            method: "*",
            maxCount: 20,
            period: 0, // == RateLimitPeriodSecond
        },
    ],
} as const satisfies RateLimitBudgetConfig;

/**
 * BlockPi free tier: 20 req/s (400 RU/s), 50M RU / 32 days.
 */
export const blockPiRateLimits = {
    id: "blockPi",
    rules: [
        {
            method: "*",
            maxCount: 20,
            period: 0, // == RateLimitPeriodSecond
        },
        {
            method: "*",
            maxCount: 500_000,
            period: 5, // == RateLimitPeriodMonth
        },
    ],
} as const satisfies RateLimitBudgetConfig;
