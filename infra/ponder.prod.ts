import * as aws from "@pulumi/aws";
import { all } from "@pulumi/pulumi";
import { cluster, vpc } from "./common.ts";
import { ServiceTargets } from "./components/ServiceTargets.ts";
import { SstService, getPonderEntrypoint, ponderEnv } from "./utils.ts";

// Get the image we will deploy
const image = await aws.ecr.getImage({
    repositoryName: "indexer-prod",
    imageTag: process.env.PONDER_PROD_IMAGE_TAG ?? "latest",
});

/**
 * Build the ponder indexing service
 */
export const ponderIndexer = new SstService("PonderProdIndexer", {
    vpc,
    cluster: {
        name: cluster.clusterName,
        arn: cluster.arn,
    },
    // Disable scaling on prod reader
    scaling: {
        cpuUtilization: false,
        memoryUtilization: false,
    },
    // hardware config
    cpu: "0.25 vCPU",
    memory: "0.5 GB",
    storage: "20 GB",
    architecture: "arm64",
    // Image to be used
    image: image.imageUri,
    entrypoint: getPonderEntrypoint("indexer"),
    // Env
    ...ponderEnv,
    // Logging options
    logging: {
        retention: "3 days",
    },
    transform: {
        service: {
            // Disable rollup update for the indexer
            deploymentMinimumHealthyPercent: 0,
            deploymentMaximumPercent: 100,
        },
    },
});

// Create the service targets
const ponderServiceTargets = new ServiceTargets("PonderProdServiceDomain", {
    vpcId: vpc.id,
    domain: "indexer.frak.id",
    ports: [
        { listen: "80/http", forward: "42069/http" },
        { listen: "443/https", forward: "42069/http" },
    ],
    health: {
        path: "/health",
        interval: "60 seconds",
        timeout: "5 seconds",
        successCodes: "200-299",
        healthyThreshold: 2,
        unhealthyThreshold: 5,
    },
});

/**
 * Build the ponder indexing service
 */
export const ponderReader = new SstService("PonderProdReader", {
    vpc,
    cluster: {
        name: cluster.clusterName,
        arn: cluster.arn,
    },
    // hardware config
    cpu: "0.25 vCPU",
    memory: "0.5 GB",
    storage: "20 GB",
    architecture: "arm64",
    // Image to be used
    image: image.imageUri,
    entrypoint: getPonderEntrypoint("reader"),
    // Env
    ...ponderEnv,
    // Logging options
    logging: {
        retention: "3 days",
    },
    // Link the service to the target groups we previously build
    transform: {
        service: {
            loadBalancers: all(ponderServiceTargets.targetGroups).apply(
                (target) =>
                    Object.values(target).map((target) => ({
                        targetGroupArn: target.arn,
                        containerName: "PonderProdReader",
                        containerPort: target.port.apply(
                            (port) => port as number
                        ),
                    }))
            ),
        },
    },
});
