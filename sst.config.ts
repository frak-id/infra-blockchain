/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
    app(input) {
        return {
            name: "frak-indexer",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
            provider: {
                aws: {
                    region: "eu-west-1",
                },
            },
            providers: {
                kubernetes: "4.21.1",
                "docker-build": "0.0.10",
                gcp: {
                    version: "8.20.0",
                    region: "europe-west1",
                    project: "kubernetes-450316",
                },
                docker: "4.6.1",
            },
        };
    },
    async run() {
        await import("./infra/common.ts");

        const isGcp = $app?.stage?.startsWith("gcp");
        const _isProd = $app?.stage?.endsWith("production");

        // Gcp specific deployment
        if (isGcp) {
            await import("./infra/k8s/erpc.ts");
            await import("./infra/k8s/ponder-dev.ts");
            return;
        }

        // Aws specific deployment
        if ($app.stage === "production") {
            // ERPC + ponder deployment on prod
            await import("./infra/erpc.ts");
            await import("./infra/ponder.prod.ts");
        } else {
            // Only ponder on dev
            await import("./infra/ponder.dev.ts");
        }
    },
});
