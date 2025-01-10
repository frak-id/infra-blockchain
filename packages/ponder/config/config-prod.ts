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
    // Reduce polling interval on prod to 60sec
    pollingInterval: 30_000,
});
