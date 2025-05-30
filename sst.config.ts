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
                kubernetes: "4.23.0",
                "docker-build": "0.0.12",
                gcp: {
                    version: "8.32.1",
                    project: "frak-main-v1",
                    region: "europe-west1",
                },
                docker: "4.7.0",
            },
        };
    },
    async run() {
        const isGcp = $app?.stage?.startsWith("gcp");

        // Gcp specific deployment
        if (isGcp) {
            await import("./infra/k8s/erpc.ts");
            await import("./infra/k8s/ponder.ts");
            return;
        }

        console.log("Not deploying anything");
        return;
    },
});
