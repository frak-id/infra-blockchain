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

/**
 * Shared Envoy Gateway `https` listener, deployed by frak-id/infra-core
 * (`infra/kubernetes/networking/gateway.ts`). Always target `https`: the
 * `http` listener only carries the HTTPS redirect.
 */
const gatewayHttpsParentRef = {
    name: "frak-gateway",
    namespace: "networking",
    sectionName: "https",
};

/**
 * `httpRoute` args for KubernetesService: the real host (inert until its DNS
 * points at the Gateway instead of nginx) and its `*.gw` shadow host, served
 * by the Gateway right away.
 */
export function gatewayRoute(subdomain: string) {
    return {
        hostnames: [
            `${subdomain}.${baseDomainName}`,
            `${subdomain}.gw.${baseDomainName}`,
        ],
        parentRefs: [gatewayHttpsParentRef],
    };
}
