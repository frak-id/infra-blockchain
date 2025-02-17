import { createEnvConfig } from "./configBuilder";

/**
 * Config for the dev env
 */
export default createEnvConfig({
    network: {
        chainId: 421614,
        deploymentBlock: 86607902,
    },
    networkKey: "arbitrumSepolia",
    // Limit the dev env to at most 10 requests per second
    maxRequestsPerSecond: 10,
});
