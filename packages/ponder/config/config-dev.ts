import { createEnvConfig } from "./configBuilder";

/**
 * Config for the dev env
 */
export default createEnvConfig({
    chain: {
        chainId: 421614,
        deploymentBlock: 86607902,
    },
    chainKey: "arbitrumSepolia",
});
