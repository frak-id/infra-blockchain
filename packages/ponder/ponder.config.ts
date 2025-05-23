import { createEnvConfig } from "./config/configBuilder";

/**
 * Default config, needed the file auto gen
 *   - waiting for this to be merged: https://github.com/ponder-sh/ponder/pull/1116
 */
export default createEnvConfig({
    chain: {
        chainId: 421614,
        deploymentBlock: 86607902,
    },
    chainKey: "arbitrumSepolia",
});
