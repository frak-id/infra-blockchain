import { normalizedStageName } from "../utils";
import { blockchainNamespace } from "./utils";

const ponderRpcSecret = new sst.Secret("PONDER_RPC_SECRET");

/**
 * All the secrets for the erpc instance
 */
export const erpcSecrets = new kubernetes.core.v1.Secret("erpc-secrets", {
    metadata: {
        name: `erpc-secrets-${normalizedStageName}`,
        namespace: blockchainNamespace.metadata.name,
    },
    type: "Opaque",
    stringData: {
        BLOCKPI_API_KEY_ARB_SEPOLIA: new sst.Secret(
            "BLOCKPI_API_KEY_ARB_SEPOLIA"
        ).value,
        BLOCKPI_API_KEY_ARB: new sst.Secret("BLOCKPI_API_KEY_ARB").value,
        ALCHEMY_API_KEY: new sst.Secret("ALCHEMY_API_KEY").value,
        PIMLICO_API_KEY: new sst.Secret("PIMLICO_API_KEY").value,
        DRPC_API_KEY: new sst.Secret("DRPC_API_KEY").value,
        DWELIR_API_KEY: new sst.Secret("DWELIR_API_KEY").value,
        PONDER_RPC_SECRET: ponderRpcSecret.value,
        NEXUS_RPC_SECRET: new sst.Secret("NEXUS_RPC_SECRET").value,
    },
});

/**
 * All the secrets for the ponder instance
 */
export const ponderSecrets = new kubernetes.core.v1.Secret("ponder-secrets", {
    metadata: {
        name: `ponder-secrets-${normalizedStageName}`,
        namespace: blockchainNamespace.metadata.name,
    },
    type: "Opaque",
    stringData: {
        PONDER_RPC_SECRET: ponderRpcSecret.value,
    },
});
