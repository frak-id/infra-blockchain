import path from "node:path";
import * as k8s from "@pulumi/kubernetes";

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
 * Deployment of erpc (contain the logic)
 */
export const erpcDeployment = new k8s.apps.v1.Deployment(
    `${imageName}-deployment`,
    {
        metadata: { namespace: blockchainNamespace.metadata.name },
        spec: {
            selector: { matchLabels: appLabels },
            replicas: 1,
            template: {
                metadata: { labels: appLabels },
                spec: {
                    containers: [
                        {
                            name: "erpc",
                            image: erpcImage.imageName,
                            ports: [
                                { containerPort: 8080 },
                                { containerPort: 6060 },
                            ],
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
                    nodeSelector: {
                        "kubernetes.io/arch": "arm64",
                    },
                },
            },
        },
    },
    { dependsOn: [erpcImage] }
);

// Create the Service on top (to expose it basicly)
export const service = new k8s.core.v1.Service("erpc-service", {
    metadata: {
        labels: appLabels,
        namespace: blockchainNamespace.metadata.name,
    },
    spec: {
        type: "ClusterIP",
        ports: [
            {
                port: 80,
                targetPort: 8080,
                protocol: "TCP",
                name: "http",
            },
            {
                port: 4001,
                targetPort: 6060,
                protocol: "TCP",
                name: "metrics",
            },
        ],
        selector: appLabels,
    },
});

// Create the Horizontal Pod Autoscaler
// - This will scale the deployment based on the CPU usage
export const hpa = new k8s.autoscaling.v1.HorizontalPodAutoscaler("erpc-hpa", {
    metadata: {
        namespace: blockchainNamespace.metadata.name,
    },
    spec: {
        scaleTargetRef: {
            apiVersion: "apps/v1",
            kind: "Deployment",
            name: erpcDeployment.metadata.name,
        },
        minReplicas: 1,
        maxReplicas: 4,
        targetCPUUtilizationPercentage: 80,
    },
});

// Create the Ingress resource
// - This will plug to the ingress controller and expose the erpc service under the erpc subdomain
export const erpcIngress = new k8s.networking.v1.Ingress("erpc-ingress", {
    metadata: {
        namespace: blockchainNamespace.metadata.name,
        annotations: {
            "nginx.ingress.kubernetes.io/rewrite-target": "/",
            "kubernetes.io/ingress.class": "nginx",
            "kubernetes.io/tls-acme": "true",
            "cert-manager.io/cluster-issuer": "letsencrypt",
            "nginx.ingress.kubernetes.io/ssl-redirect": "true",
            "nginx.ingress.kubernetes.io/proxy-buffer-size": "8k",
        },
    },
    spec: {
        ingressClassName: "nginx",
        rules: [
            {
                host: "erpc.gcp-dev.frak.id",
                http: {
                    paths: [
                        {
                            path: "/",
                            pathType: "Prefix",
                            backend: {
                                service: {
                                    name: service.metadata.name,
                                    port: {
                                        number: 80,
                                    },
                                },
                            },
                        },
                        {
                            path: "/metrics",
                            pathType: "Prefix",
                            backend: {
                                service: {
                                    name: service.metadata.name,
                                    port: {
                                        number: 4001,
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        ],
        tls: [
            {
                hosts: ["erpc.gcp-dev.frak.id"],
                secretName: "erpc-tls",
            },
        ],
    },
});

// Create a ServiceMonitor for your application
export const erpcServiceMonitor = new k8s.apiextensions.CustomResource(
    "erpc-service-monitor",
    {
        apiVersion: "monitoring.coreos.com/v1",
        kind: "ServiceMonitor",
        metadata: {
            name: "erpc-service-monitor",
            namespace: blockchainNamespace.metadata.name,
            labels: {
                // Make sure it's discoverable by prometheus with both labels
                "app.kubernetes.io/name": "prometheus",
                release: "prometheus",
                // Keep the app label consistent with your service
                ...appLabels,
            },
        },
        spec: {
            selector: {
                matchLabels: appLabels,
            },
            endpoints: [
                {
                    port: "metrics", // This matches the named port in your Service definition
                    path: "/metrics",
                    interval: "15s", // Scrape interval - adjust as needed
                },
            ],
            namespaceSelector: {
                matchNames: [blockchainNamespace.metadata.name],
            },
        },
    },
    { dependsOn: [service] }
);
