import { createEnvConfig } from "./configBuilder";

/**
 * Config for the prod env
 */
export default createEnvConfig({
    network: {
        chainId: 42161,
        deploymentBlock: 261367992,
    },
    networkKey: "arbitrum",
    // Reduce polling interval on prod to 20sec
    pollingInterval: 20_000,
    // Limit the prod env to at most 30 requests per second
    maxRequestsPerSecond: 30,
});
