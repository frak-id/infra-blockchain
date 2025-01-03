import type { Service } from "../.sst/platform/src/components/aws/service.js";
import { vpc } from "./common.ts";

/**
 * Get a safe SST service constructor, cause the one in .sst/plateform is not
 */
export const SstService: typeof Service = await import(
    "../.sst/platform/src/components/aws/service.js"
)
    .then((m) => m.Service)
    .catch(() => {
        console.debug("SST Service not found, using a placeholder constructor");
        // @ts-ignore: Not exported in the SST platform
        return sst.aws.Service;
    });

/**
 * Get the ponder entrypoint
 * @param type
 */
export function getPonderEntrypoint(type: "indexer" | "reader") {
    const isProd = $app.stage === "production";
    const logLevel = isProd ? "warn" : "info";
    const configPath = isProd
        ? "config/config-prod.ts"
        : "config/config-dev.ts";
    const command = type === "indexer" ? "start" : "serve";

    return [
        "bun",
        "ponder",
        "--log-format",
        "json",
        "--log-level",
        logLevel,
        "--config",
        configPath,
        command,
        "--schema",
        $app.stage,
    ];
}

/**
 * Get the ponder env and ssm variable
 */
const cloudmapErpcUrl = vpc.nodes.cloudmapNamespace.name.apply(
    (namespaceName) =>
        `http://Erpc.production.frak-indexer.${namespaceName}:8080/ponder-rpc/evm`
);
const externalErpcUrl = `https://rpc.frak-labs.com/ponder-rpc/evm`;

/**
 * Export the ponder  environment
 */
export const ponderEnv = {
    environment: {
        // For legacy images
        ERPC_URL: cloudmapErpcUrl,
        INTERNAL_RPC_URL: cloudmapErpcUrl,
        EXTERNAL_RPC_URL: externalErpcUrl,
    },
    ssm: {
        // Endpoints secrets,
        PONDER_RPC_SECRET:
            "arn:aws:ssm:eu-west-1:262732185023:parameter/sst/frak-indexer/.fallback/Secret/PONDER_RPC_SECRET/value",
        // Postgres db
        PONDER_DATABASE_URL:
            "arn:aws:ssm:eu-west-1:262732185023:parameter/indexer/sst/Secret/PONDER_DATABASE_URL/value",
    },
};
