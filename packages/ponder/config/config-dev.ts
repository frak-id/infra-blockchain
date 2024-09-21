import { createEnvConfig } from "./configBuilder";

/**
 * Config for the dev env
 */
export default createEnvConfig({
    pgDatabase: "ponder_dev",
    network: {
        chainId: 421614,
        deploymentBlock: 75793399,
    },
    networkKey: "arbitrumSepolia",
});
