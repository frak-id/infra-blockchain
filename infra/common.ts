import * as aws from "@pulumi/aws";
import { Output, all } from "@pulumi/pulumi";

// Get the VPC
const { id: vpcId } = await aws.ec2.getVpc({
    filters: [{ name: "tag:Name", values: ["master-vpc"] }],
});
export const vpc = sst.aws.Vpc.get("MasterVpc", vpcId);

// Get the master cluster
const clusterName = `master-cluster-${$dev ? "dev" : $app.stage}`;
export const sstCluster = sst.aws.Cluster.get("MasterCluster", {
    id: Output.create(aws.ecs.getCluster({ clusterName })).apply((c) => c.id),
    vpc: vpc,
});

/**
 * Build the postgres DB for the current env
 */
export const database =
    $app.stage !== "production"
        ? sst.aws.Postgres.get("blockchain", {
              id: "frak-indexer-production-blockchaininstance",
          })
        : new sst.aws.Postgres("blockchain", {
              vpc: Output.create(vpc).apply((v) => ({
                  subnets: v.privateSubnets,
              })),
          });

/**
 * Build the database url
 */
export const dbUrl = all([
    database.host,
    database.port,
    database.username,
    database.password,
    database.database,
]).apply(([host, port, username, password, database]) => {
    return `postgres://${username}:${password}@${host}:${port}/${database}`;
});

if ($dev) {
    // Db studio command
    new sst.x.DevCommand("db:studio", {
        dev: {
            title: "[DB] Studio",
            autostart: false,
            command: "bun run db:studio",
            directory: "tools",
        },
        environment: {
            POSTGRES_HOST: database.host,
            POSTGRES_DB: database.database,
            POSTGRES_PORT: database.port.apply((p) => p.toString()),
            POSTGRES_USER: database.username,
            POSTGRES_PASSWORD: database.password ?? "",
        },
        link: [database],
    });

    // Ponder serve command
    new sst.x.DevCommand("ponder:serve", {
        dev: {
            title: "[Ponder] Serve",
            command:
                "ponder --config config/config-prod.ts --log-level debug serve",
            directory: "packages/ponder",
            autostart: false,
        },
        environment: {
            PONDER_DATABASE_URL: dbUrl,
            DATABASE_SCHEMA: "ponder_local",
        },
        link: [database],
    });

    // Ponder serve command
    new sst.x.DevCommand("ponder:start", {
        dev: {
            title: "[Ponder] Start",
            command:
                "ponder --config config/config-prod.ts --log-level debug start",
            directory: "packages/ponder",
            autostart: false,
        },
        environment: {
            PONDER_DATABASE_URL: dbUrl,
            DATABASE_SCHEMA: "ponder_local",
            NO_API: "true",
        },
        link: [database],
    });
}

/**
 * Get the ponder env and ssm variable
 */
const cloudmapErpcUrl = vpc.nodes.cloudmapNamespace.name.apply(
    (namespaceName) =>
        `http://Erpc.production.frak-indexer.${namespaceName}:8080/ponder-rpc/evm`
);
const externalErpcUrl = "https://rpc.frak-labs.com/ponder-rpc/evm";

/**
 * Export the ponder  environment
 */
export const ponderEnv = {
    environment: {
        // For legacy images
        ERPC_URL: cloudmapErpcUrl,
        INTERNAL_RPC_URL: cloudmapErpcUrl,
        EXTERNAL_RPC_URL: externalErpcUrl,
        // Link it to the database
        PONDER_DATABASE_URL: dbUrl,
    },
    ssm: {
        // Endpoints secrets,
        PONDER_RPC_SECRET:
            "arn:aws:ssm:eu-west-1:262732185023:parameter/sst/frak-indexer/.fallback/Secret/PONDER_RPC_SECRET/value",
    },
};
