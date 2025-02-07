import type { RateLimitRuleConfig } from "@erpc-cloud/config";

/**
 * Build a generic rate limits rules, counting on the number of request per minutes
 * @param count
 */
function genericRateLimitsRules(count: number): RateLimitRuleConfig {
    return {
        method: "*",
        maxCount: count,
        period: "1s",
        waitTime: "30s",
    };
}

type RuleExport = [RateLimitRuleConfig, ...RateLimitRuleConfig[]];

export const envioRateRules: RuleExport = [
    genericRateLimitsRules(600),
    {
        method: "eth_getLogs",
        maxCount: 300,
        period: "1s",
        waitTime: "5s",
    },
    {
        method: "eth_getBlockByNumber",
        maxCount: 300,
        period: "1s",
        waitTime: "5s",
    },
];

export const alchemyRateRules: RuleExport = [
    genericRateLimitsRules(50),
    {
        method: "eth_getLogs",
        maxCount: 10,
        period: "1s",
        waitTime: "10s",
    },
    {
        method: "eth_getBlockByNumber",
        maxCount: 15,
        period: "1s",
        waitTime: "10s",
    },
];

export const pimlicoRateRules: RuleExport = [genericRateLimitsRules(400)];

export const blockPiRateRules: RuleExport = [genericRateLimitsRules(100)];

export const drpcRateRules: RuleExport = [genericRateLimitsRules(100)];

export const dwelirRateRules: RuleExport = [genericRateLimitsRules(30)];
