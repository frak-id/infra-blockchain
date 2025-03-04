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
        if ($dev) {
            await import("./infra/erpc-k8s.ts");
            return;
        }
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
