import type { RateLimitBudgetConfig } from "@erpc-cloud/config";

/**
 * Every budget below is consumed in credit mode: each upstream using it sets
 * `rateLimitCountMode: "credit"`, so a call draws its vendor credit cost
 * (Alchemy CU, dRPC CU, BlockPi RU, ...) from ONE pool shared by every method.
 *
 * Don't fall back to the default "request" mode: it keys counters per method,
 * so a `method: "*"` rule of 20 means 20/s for EACH method, not 20/s in total.
 * Mixing both modes on one budget also splits it into two separate counters.
 *
 * Keep a single rule per budget: the auto-tuner rescales every rule matching
 * the method and clamps each one to its min/max bounds, so a second (daily,
 * monthly) rule would get clamped down to the per-second bounds. Quotas are
 * left to the providers; the in-memory counters are per pod and reset on every
 * deploy anyway.
 *
 * The state poller goes through these budgets too (eth_getBlockByNumber for
 * latest + finalized, every 30s, on every upstream).
 */

/**
 * Alchemy free tier: 500 CU/s (10s rolling window, account wide), 30M CU/month.
 * Credits come from Alchemy's CU table, auto-fetched by erpc (eth_call = 26 CU).
 */
export const alchemyRateLimits = {
    id: "alchemy",
    rules: [
        {
            method: "*",
            maxCount: 500,
            period: 0, // == RateLimitPeriodSecond
        },
    ],
} as const satisfies RateLimitBudgetConfig;

/**
 * dRPC free tier: 120k CU/min normally, but can drop to a 50,400 CU/min floor
 * (~840 CU/s) under high regional demand; 210M CU / 30 days. erpc's built-in
 * table charges a flat 20 CU per billable call, so 600 CU/s (30 calls/s) stays
 * under the reduced-tier floor and avoids capacity-exceeded errors.
 */
export const drpcRateLimits = {
    id: "drpc",
    rules: [
        {
            method: "*",
            maxCount: 600,
            period: 0, // == RateLimitPeriodSecond
        },
    ],
} as const satisfies RateLimitBudgetConfig;

/**
 * Dwellir free tier: 20 responses/s (no burst), 100k responses/day.
 * Dwellir bills 1 credit per response, whatever the method.
 */
export const dwellirRateLimits = {
    id: "dwellir",
    rules: [
        {
            method: "*",
            maxCount: 20,
            period: 0, // == RateLimitPeriodSecond
        },
    ],
} as const satisfies RateLimitBudgetConfig;

/**
 * BlockPi free tier: 20 req/s and 400 RU/s per endpoint, 50M RU / 32 days.
 * Credits are BlockPi RUs (see `blockPiRequestUnits`); eth_call = 20 RU, so the
 * RU cap also keeps us around the 20 req/s one.
 */
export const blockPiRateLimits = {
    id: "blockpi",
    rules: [
        {
            method: "*",
            maxCount: 400,
            period: 0, // == RateLimitPeriodSecond
        },
    ],
} as const satisfies RateLimitBudgetConfig;
