import path from "node:path";
import { hashElement } from "folder-hash";

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
 * @param timestamp -> Used if we are deploying multiple instance at the same time, to ensure they are using the same schema
 */
export function getPonderEntrypoint(
    type: "indexer" | "reader",
    timestamp: number = Date.now()
) {
    const logLevel = isProd ? "warn" : "info";
    const configPath = isProd
        ? "config/config-prod.ts"
        : "config/config-dev.ts";
    const command = type === "indexer" ? "start" : "serve";

    // Get a readable date (dd.mm.yyyy)
    const date = new Date(timestamp);
    const readableDate = `${date.getUTCDate()}_${date.getUTCMonth() + 1}_${date.getUTCFullYear().toString().slice(2)}`;

    // Get the hash of the current ponder directory
    const ponderDir = path.join($cli.paths.root, "packages", "ponder");
    const ponderHash = $output(
        hashElement(ponderDir, {
            algo: "sha256",
            encoding: "hex",
            folders: {
                exclude: [".*", "generated", "node_modules"],
            },
            files: {
                include: ["**/*.ts", "config/**/*.ts", "package.json"],
            },
        })
    ).apply(({ hash }) => hash.substring(0, 8));

    // Build the schema name we will use ($stage_date_folderHash)
    const schemaName = $interpolate`ponder_${normalizedStageName}_${readableDate}_${process.env.COMMIT_HASH ?? "local"}_${ponderHash}`;

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
