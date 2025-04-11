import path from "node:path";
import { KubernetesService } from "../components/KubernetesService";
import { getPonderEntrypoint, normalizedStageName } from "../utils";
import { erpcInstance } from "./erpc";
import { ponderSecrets } from "./secrets";
import { baseDomainName, blockchainNamespace, getDbUrl } from "./utils";

const appLabels = { app: "ponder" };
const imageName = "ponder";
const repository = `ponder-${normalizedStageName}`;

/**
 * Artifact registry for the ponder image
 */
const registry = new gcp.artifactregistry.Repository("ponder-gcr", {
    repositoryId: repository,
    format: "DOCKER",
    description: "Artifact registry for the ponder image",
    location: "europe-west1",
    project: gcp.config.project,
});

/**
 * Create the ponder image
 * todo: Should migrate to the new `dockerBuild` stuff from pulumi, but facing some issue with credentials
 */
const registryPath = registry.location.apply(
    (location) =>
        `${location}-docker.pkg.dev/${gcp.config.project}/${repository}`
);
const latestTag = registryPath.apply((path) => `${path}/${imageName}:latest`);
const ponderImage = new docker.Image(
    imageName,
    {
        imageName: latestTag,
        build: {
            context: path.join($cli.paths.root, "packages", "ponder"),
            platform: "linux/arm64",
            args: {
                NODE_ENV: "production",
                STAGE: normalizedStageName,
            },
        },
    },
    {
        dependsOn: [registry],
    }
);

/**
 * Deploy ponder using the new service
 */
export const ponderInstance = new KubernetesService(
    "Ponder",
    {
        // Global config
        namespace: blockchainNamespace.metadata.name,
        appLabels,

        // Pod config
        pod: {
            containers: [
                {
                    name: "ponder",
                    image: ponderImage.imageName,
                    ports: [{ containerPort: 42069 }],
                    command: getPonderEntrypoint("indexer"),
                    env: [
                        {
                            name: "PONDER_DATABASE_URL",
                            value: getDbUrl("ponder"),
                        },
                        {
                            name: "INTERNAL_RPC_URL",
                            value: $interpolate`http://erpc-${normalizedStageName}-service.${blockchainNamespace.metadata.name}:80/ponder-rpc/evm`,
                        },
                    ],
                    // Mount all the secrets
                    envFrom: [
                        {
                            secretRef: { name: ponderSecrets.metadata.name },
                        },
                    ],
                    // Add liveness probe
                    livenessProbe: {
                        httpGet: {
                            path: "/health",
                            port: 42069,
                        },
                        initialDelaySeconds: 15,
                        periodSeconds: 10,
                        timeoutSeconds: 5,
                        failureThreshold: 3,
                    },
                    // Add readiness probe
                    readinessProbe: {
                        httpGet: {
                            path: "/health",
                            port: 42069,
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
                { port: 80, targetPort: 42069, protocol: "TCP", name: "http" },
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
            host: `ponder.${baseDomainName}`,
            tlsSecretName: "ponder-tls",
        },

        // ServiceMonitor config
        serviceMonitor: {
            port: "http",
            path: "/metrics",
            interval: "15s",
        },

        // Local command
        dev: {
            dev: {
                directory: path.join($cli.paths.root, "packages", "ponder"),
                command: "bun run dev",
                autostart: false,
            },
        },
    },
    {
        dependsOn: [registry, ponderImage, ponderSecrets, erpcInstance],
    }
);
