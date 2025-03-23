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
                kubernetes: "4.22.1",
                "docker-build": "0.0.10",
                gcp: {
                    version: "8.22.0",
                    project: "frak-main-v1",
                    region: "europe-west1",
                },
                docker: "4.6.1",
            },
        };
    },
    async run() {
        const isGcp = $app?.stage?.startsWith("gcp");
        const _isProd = $app?.stage?.endsWith("production");

        // Gcp specific deployment
        if (isGcp) {
            await import("./infra/k8s/erpc.ts");
            // await import("./infra/k8s/ponder-dev.ts");
            return;
        }

        // Aws specific deployment
        await import("./infra/common.ts");
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
