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
                kubernetes: "4.28.0",
                "docker-build": "0.0.15",
                gcp: {
                    version: "9.18.0",
                    project: "frak-main-v1",
                    region: "europe-west1",
                },
            },
        };
    },
    async run() {
        const isGcp = $app?.stage?.startsWith("gcp");

        // Gcp specific deployment
        if (isGcp) {
            await import("./infra/k8s/erpc.ts");
            return;
        }

        console.log("Not deploying anything");
        return;
    },
});
