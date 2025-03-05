import path from "node:path";
import * as k8s from "@pulumi/kubernetes";
import { KubernetesService } from "./components/KubernetesService";

// Create a dedicated namespace for monitoring
const blockchainNamespace = new k8s.core.v1.Namespace("infra-blockchain", {
    metadata: { name: "infra-blockchain" },
});

const appLabels = { app: "erpc" };
const imageName = "erpc";
const repository = `erpc-${$app.stage}`;

/**
 * Artifact registry for the erpc image
 */
const registry = new gcp.artifactregistry.Repository("erpc-gcr", {
    repositoryId: repository,
    format: "DOCKER",
    description: "Artifact registry for the erpc image",
    location: "europe-west1",
});

/**
 * Create the erpc image
 * todo: Should migrate to the new `dockerBuild` stuff from pulumi, but facing some issue with credentials
 */
const registryPath = registry.location.apply(
    (location) =>
        `${location}-docker.pkg.dev/${gcp.config.project}/${repository}`
);
const latestTag = registryPath.apply((path) => `${path}/${imageName}:latest`);
const erpcImage = new docker.Image(imageName, {
    imageName: latestTag,
    build: {
        context: path.join($cli.paths.root, "packages", "erpc"),
        platform: "linux/arm64",
        args: {
            NODE_ENV: "production",
            STAGE: $app.stage,
        },
    },
});

// Craft the erpc db url
const dbStage = $app.stage !== "production" ? "dev" : "production";
const dbUser = `erpc_${dbStage}`;
const dbPassword = $output(
    gcp.secretmanager.getSecretVersion({
        secret: `erpc-db-secret-${dbStage}`,
    })
);
const instance = $output(
    gcp.sql.getDatabaseInstance({ name: `master-db-${dbStage}` })
);
const dbUrl = $interpolate`postgres://${dbUser}:${dbPassword.secretData}@${instance.privateIpAddress}:5432/erpc`;

/**
 * Deploy erpc using the new service
 */
export const erpcInstance = new KubernetesService("Erpc", {
    // Global config
    namespace: blockchainNamespace.metadata.name,
    appLabels,

    // Pod config
    pod: {
        containers: [
            {
                name: "erpc",
                image: erpcImage.imageName,
                ports: [{ containerPort: 8080 }, { containerPort: 6060 }],
                env: [
                    { name: "ERPC_DATABASE_URL", value: dbUrl },
                    {
                        name: "BLOCKPI_API_KEY_ARB_SEPOLIA",
                        value: "test",
                    },
                    { name: "BLOCKPI_API_KEY_ARB", value: "test" },
                    { name: "ALCHEMY_API_KEY", value: "test" },
                    { name: "PIMLICO_API_KEY", value: "test" },
                    { name: "DRPC_API_KEY", value: "test" },
                    { name: "DWELIR_API_KEY", value: "test" },
                    { name: "PONDER_RPC_SECRET", value: "test" },
                    { name: "NEXUS_RPC_SECRET", value: "test" },
                ],
                // Add liveness probe
                livenessProbe: {
                    httpGet: {
                        path: "/healthcheck",
                        port: 8080,
                    },
                    initialDelaySeconds: 15,
                    periodSeconds: 10,
                    timeoutSeconds: 5,
                    failureThreshold: 3,
                },
                // Add readiness probe
                readinessProbe: {
                    httpGet: {
                        path: "/healthcheck",
                        port: 8080,
                    },
                    initialDelaySeconds: 5,
                    periodSeconds: 10,
                    timeoutSeconds: 3,
                    failureThreshold: 2,
                },
            },
        ],
    },

    // Service config
    service: {
        ports: [
            { port: 80, targetPort: 8080, protocol: "TCP", name: "http" },
            {
                port: 4001,
                targetPort: 6060,
                protocol: "TCP",
                name: "metrics",
            },
        ],
    },

    // HPA config
    hpa: {
        min: 1,
        max: 4,
        cpuUtilization: 80,
    },

    // Ingress config
    ingress: {
        host: "erpc.gcp-dev.frak.id",
        tlsSecretName: "erpc-tls",
    },

    // ServiceMonitor config
    serviceMonitor: {
        port: "metrics",
        path: "/metrics",
        interval: "15s",
    },

    // Local command
    dev: {
        dev: {
            directory: path.join($cli.paths.root, "packages", "erpc"),
            command: "bun run dev",
            autostart: false,
        },
    },
});
