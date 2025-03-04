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
const dbPassword = $output(gcp.secretmanager.getSecretVersion({
    secret: `erpc-db-secret-${dbStage}`,
}));
const instance = $output(gcp.sql.getDatabaseInstance({ name: `master-db-${dbStage}` }));
const dbUrl = $interpolate`postgres://${dbUser}:${dbPassword.secretData}@${instance.privateIpAddress}:5432/erpc`;

/**
 * Deployment of erpc (contain the logic)
 *  - potential fix: https://stackoverflow.com/questions/75366973/unable-to-pull-artifact-registry-private-images-in-newly-created-gke-cluster
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
                    serviceAccountName: "default",
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
                            ],
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
