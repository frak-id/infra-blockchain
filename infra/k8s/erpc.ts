import path from "node:path";
import { KubernetesService } from "../components/KubernetesService";
import { isProd, normalizedStageName } from "../utils";
import { erpcSecrets } from "./secrets";
import { baseDomainName, blockchainNamespace, getDbUrl } from "./utils";

const appLabels = { app: "erpc" };
const imageName = "erpc";
const repository = `erpc-${normalizedStageName}`;

/**
 * Artifact registry for the erpc image
 */
const registry = new gcp.artifactregistry.Repository("erpc-gcr", {
    repositoryId: repository,
    format: "DOCKER",
    description: "Artifact registry for the erpc image",
    location: "europe-west1",
    project: gcp.config.project,
});

/**
 * Create the erpc image
 */
const registryPath = registry.location.apply(
    (location) =>
        `${location}-docker.pkg.dev/${gcp.config.project}/${repository}`
);
const erpcImage = new dockerbuild.Image(
    "erpc-image",
    {
        context: {
            location: path.join($cli.paths.root, "packages", "erpc"),
        },
        platforms: ["linux/amd64"],
        buildArgs: {
            NODE_ENV: "production",
            STAGE: normalizedStageName,
        },
        push: true,
        tags: registryPath.apply((path) => [
            `${path}/${imageName}:${process.env.COMMIT_HASH ? `git-${process.env.COMMIT_HASH}` : "local-build"}`,
            `${path}/${imageName}:latest`,
        ]),
    },
    {
        dependsOn: [registry],
    }
);

/**
 * Deploy erpc using the new service
 */
export const erpcInstance = new KubernetesService(
    "Erpc",
    {
        // Global config
        namespace: blockchainNamespace.metadata.name,
        appLabels,

        // Pod config
        pod: {
            containers: [
                {
                    name: "erpc",
                    image: erpcImage.ref,
                    ports: [{ containerPort: 8080 }, { containerPort: 6060 }],
                    env: [
                        { name: "ERPC_LOG_LEVEL", value: "warn" },
                        { name: "ERPC_DATABASE_URL", value: getDbUrl("erpc") },
                        { name: "STAGE", value: normalizedStageName },
                    ],
                    // Mount all the secrets
                    envFrom: [
                        {
                            secretRef: { name: erpcSecrets.metadata.name },
                        },
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
                    // Ressources per container
                    resources: {
                        limits: { cpu: "50m", memory: "1024Mi" },
                        requests: { cpu: "10m", memory: "512Mi" },
                    },
                },
            ],
        },

        // Pod auto scaling
        hpa: isProd
            ? {
                  min: 1,
                  max: 4,
                  cpuUtilization: 95,
              }
            : undefined,

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

        // Ingress config
        ingress: {
            host: `erpc.${baseDomainName}`,
            tlsSecretName: "erpc-tls",
            // Performance optimizations for rpc
            customAnnotations: {
                // Connection pooling for ingress -> backend pod connections
                "nginx.ingress.kubernetes.io/upstream-keepalive-connections":
                    "32",
                "nginx.ingress.kubernetes.io/upstream-keepalive-requests":
                    "1000",
                "nginx.ingress.kubernetes.io/upstream-keepalive-timeout": "60",
                // Optimized timeouts for API responses
                "nginx.ingress.kubernetes.io/proxy-connect-timeout": "5",
                "nginx.ingress.kubernetes.io/proxy-send-timeout": "60",
                "nginx.ingress.kubernetes.io/proxy-read-timeout": "60",
                // Buffer settings for API responses
                "nginx.ingress.kubernetes.io/proxy-buffering": "on",
                "nginx.ingress.kubernetes.io/proxy-buffers-number": "8",
                "nginx.ingress.kubernetes.io/proxy-buffer-size": "16k",
                "nginx.ingress.kubernetes.io/proxy-busy-buffers-size": "32k",
                "nginx.ingress.kubernetes.io/proxy-body-size": "10m",
            },
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
    },
    {
        dependsOn: [registry, erpcImage, erpcSecrets],
    }
);
