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
            command: "ponder --config config/config-dev.ts serve",
            directory: "packages/ponder",
        },
        environment: {
            PONDER_DATABASE_URL: dbUrl,
            DATABASE_SCHEMA: "ponder_dev_16_1_2025",
        },
        link: [database],
    });
}
