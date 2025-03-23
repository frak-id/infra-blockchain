import * as aws from "@pulumi/aws";
import { all } from "@pulumi/pulumi";
import { database, ponderEnv, sstCluster, vpc } from "./common.ts";
import { ServiceTargets } from "./components/ServiceTargets.ts";
import { getPonderEntrypoint } from "./utils.ts";

// Get the image we will deploy
const image = await aws.ecr.getImage({
    repositoryName: "indexer-dev",
    imageTag: process.env.PONDER_DEV_IMAGE_TAG ?? "latest",
});

// Create the service targets
const ponderServiceTargets = new ServiceTargets("PonderDevServiceDomain", {
    vpcId: vpc.id,
    domain: "indexer-dev.frak.id",
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
new sst.aws.Service("PonderDevIndexer", {
    cluster: sstCluster,
    // Disable scaling on dev
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
    // Link it to the database
    link: [database],
    // Env
    ...ponderEnv,
    // Logging options
    logging: {
        retention: "3 days",
    },
    // Tell the service registry to forward requests to the 42069 port
    serviceRegistry: {
        port: 42069,
    },
    // Link the service to the target groups we previously build
    transform: {
        service: {
            // Disable rollup update for the indexer
            deploymentMinimumHealthyPercent: 0,
            deploymentMaximumPercent: 100,
            // Link to the target groups
            loadBalancers: all(ponderServiceTargets.targetGroups).apply(
                (target) =>
                    Object.values(target).map((target) => ({
                        targetGroupArn: target.arn,
                        containerName: "PonderDevIndexer",
                        containerPort: target.port.apply(
                            (port) => port as number
                        ),
                    }))
            ),
        },
    },
});
