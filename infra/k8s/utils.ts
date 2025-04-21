import { isProd, normalizedStageName } from "../utils";

// Create a dedicated namespace for monitoring
export const blockchainNamespace = new kubernetes.core.v1.Namespace(
    "infra-blockchain",
    {
        metadata: { name: `blockchain-${normalizedStageName}` },
    }
);

/**
 * Get the db url for the given service
 */
export function getDbUrl(service: "erpc" | "ponder") {
    const dbUser = `${service}_${normalizedStageName}`;
    const dbPassword = $output(
        gcp.secretmanager.getSecretVersion({
            secret: `${service}-db-secret-${normalizedStageName}`,
        })
    ).apply((secret) => encodeURIComponent(secret.secretData));
    const instance = $output(
        gcp.sql.getDatabaseInstance({
            name: `master-db-${normalizedStageName}`,
        })
    );
    return $interpolate`postgres://${dbUser}:${dbPassword}@${instance.privateIpAddress}:5432/${service}`;
}

/**
 * The base domain name we will use for deployment
 */
export const baseDomainName = isProd ? "gcp.frak.id" : "gcp-dev.frak.id";
