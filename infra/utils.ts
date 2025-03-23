import { dbUrl, vpc } from "./common.ts";

/**
 * Check if we are in gcp
 */
export const isGcp = $app?.stage?.startsWith("gcp") ?? false;

/**
 * Check if we are in production
 */
export const isProd = $app?.stage?.endsWith("production") ?? false;

/**
 * The normalized stage name
 */
export const normalizedStageName =
    $app?.stage?.replace("gcp-", "")?.replace("aws-", "") ?? "";

/**
 * Get the ponder entrypoint
 * @param type
 */
export function getPonderEntrypoint(type: "indexer" | "reader") {
    const logLevel = isProd ? "warn" : "info";
    const configPath = isProd
        ? "config/config-prod.ts"
        : "config/config-dev.ts";
    const command = type === "indexer" ? "start" : "serve";

    // Build the schema name we will use ($stage_DD_MM_YYYY)
    const date = new Date();
    const schemaName = `ponder_${$app.stage}_${date.getDate()}_${date.getMonth()}_${date.getFullYear()}`;

    // Return the full docker entrypoint command
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
        schemaName,
    ];
}

/**
 * Get the ponder env and ssm variable
 */
const cloudmapErpcUrl = vpc.nodes.cloudmapNamespace.name.apply(
    (namespaceName) =>
        `http://Erpc.production.frak-indexer.${namespaceName}:8080/ponder-rpc/evm`
);
const externalErpcUrl = "https://rpc.frak-labs.com/ponder-rpc/evm";

/**
 * Export the ponder  environment
 */
export const ponderEnv = {
    environment: {
        // For legacy images
        ERPC_URL: cloudmapErpcUrl,
        INTERNAL_RPC_URL: cloudmapErpcUrl,
        EXTERNAL_RPC_URL: externalErpcUrl,
        // Link it to the database
        PONDER_DATABASE_URL: dbUrl,
    },
    ssm: {
        // Endpoints secrets,
        PONDER_RPC_SECRET:
            "arn:aws:ssm:eu-west-1:262732185023:parameter/sst/frak-indexer/.fallback/Secret/PONDER_RPC_SECRET/value",
    },
};
