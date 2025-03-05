import * as k8s from "@pulumi/kubernetes";
import type * as inputs from "@pulumi/kubernetes/types/input";
import {
    ComponentResource,
    type ComponentResourceOptions,
    type Input,
} from "@pulumi/pulumi";
import type {
    DevCommand,
    DevCommandArgs,
} from "../../.sst/platform/src/components/experimental/index.js";

// SST Command import
const Command: typeof DevCommand = await import(
    "../../.sst/platform/src/components/experimental/index.js"
)
    .then((m) => m.DevCommand)
    .catch(() => {
        console.debug("SST Command not found, using a placeholder constructor");
        // @ts-ignore: Not exported in the SST platform
        return sst.x.DevCommand;
    });

/**
 * Arguments used to create a Kubernetes service
 */
type KubernetesServiceArgs = {
    // Dev command informations if needed
    dev?: DevCommandArgs;

    // Namespace where the pod should be deployed
    namespace: Input<string>;
    // The app labels
    appLabels: Record<string, string>;

    // Info for the pod deployment
    pod: {
        // The number of replicas
        replicas?: Input<number>; // Default to 1

        // Definition of each container
        containers: Input<inputs.core.v1.Container>[];
    };

    // Info for the service
    service?: {
        ports: Input<
            {
                port: Input<number>;
                targetPort: Input<number>;
                protocol: Input<string>;
                name: Input<string>;
            }[]
        >;
    };

    // Info for the hpa
    hpa?: {
        min?: Input<number>; // Default to 1
        max: Input<number>;
        cpuUtilization?: Input<number>; // Default to 80
    };

    // Info for the ingress
    ingress?: {
        host: Input<string>;
        tlsSecretName: Input<string>;
    };

    // Info for the service monitor
    serviceMonitor?: {
        port: Input<string>; // Matching a port defined in the `service.ports[number].name`
        path: Input<string>;
        interval?: Input<string>; // Default to 15
    };
};

/**
 * Deploy a full on kubernetes service with a deployment, service, hpa, ingress and service monitor
 */
export class KubernetesService extends ComponentResource {
    // Resources
    public readonly deployment: k8s.apps.v1.Deployment | null = null;
    public readonly service: k8s.core.v1.Service | null = null;
    public readonly hpa: k8s.autoscaling.v1.HorizontalPodAutoscaler | null =
        null;
    public readonly ingress: k8s.networking.v1.Ingress | null = null;
    public readonly serviceMonitor: k8s.apiextensions.CustomResource | null =
        null;
    public readonly devCommand: DevCommand | null = null;

    constructor(
        private name: string,
        private args: KubernetesServiceArgs,
        private opts?: ComponentResourceOptions
    ) {
        super("k8s:frak:KubernetesService", name, args, opts);

        // If we are running locally, just create a dev command
        if ($dev && this.args.dev) {
            this.devCommand = this.createDevCommand();
            return;
        }

        // Create the deployment
        this.deployment = this.createDeployment();

        // Create the service if defined
        if (this.args.service) {
            this.service = this.createService();
        }

        // Create the HPA if defined
        if (this.args.hpa) {
            this.hpa = this.createHPA();
        }

        // Create the ingress if defined
        if (this.args.ingress && this.service) {
            this.ingress = this.createIngress();
        }

        // Create the service monitor if defined
        if (this.args.serviceMonitor && this.service) {
            this.serviceMonitor = this.createServiceMonitor();
        }
    }

    private createDevCommand(): DevCommand | null {
        if (!Command || !this.args.dev) return null;

        return new Command(
            this.name,
            {
                ...this.args.dev,
            },
            { parent: this }
        );
    }

    private createDeployment(): k8s.apps.v1.Deployment {
        return new k8s.apps.v1.Deployment(
            `${this.name}Deployment`,
            {
                metadata: {
                    name: `${this.name}-deployment`.toLocaleLowerCase(),
                    namespace: this.args.namespace,
                    labels: this.args.appLabels,
                },
                spec: {
                    selector: { matchLabels: this.args.appLabels },
                    replicas: this.args.pod.replicas || 1,
                    template: {
                        metadata: { labels: this.args.appLabels },
                        spec: {
                            containers: this.args.pod.containers,
                            // We are always deploying on arm64
                            nodeSelector: {
                                "kubernetes.io/arch": "arm64",
                            },
                        },
                    },
                },
            },
            { ...this.opts, parent: this }
        );
    }

    private createService(): k8s.core.v1.Service {
        if (!this.deployment) {
            throw new Error("Deployment is required to create a Service");
        }

        if (!this.args.service) {
            throw new Error(
                "Service configuration is required to create a Service"
            );
        }

        return new k8s.core.v1.Service(
            `${this.name}Service`,
            {
                metadata: {
                    name: `${this.name}-service`.toLocaleLowerCase(),
                    labels: this.args.appLabels,
                    namespace: this.args.namespace,
                },
                spec: {
                    type: "ClusterIP",
                    ports: this.args.service.ports,
                    selector: this.args.appLabels,
                },
            },
            {
                ...this.opts,
                parent: this,
                dependsOn: this.deployment,
            }
        );
    }

    private createHPA(): k8s.autoscaling.v1.HorizontalPodAutoscaler {
        if (!this.deployment) {
            throw new Error("Deployment is required to create an HPA");
        }
        if (!this.args.hpa) {
            throw new Error("HPA configuration is required to create an HPA");
        }

        return new k8s.autoscaling.v1.HorizontalPodAutoscaler(
            `${this.name}Hpa`,
            {
                metadata: {
                    name: `${this.name}-hpa`.toLocaleLowerCase(),
                    namespace: this.args.namespace,
                },
                spec: {
                    scaleTargetRef: {
                        apiVersion: "apps/v1",
                        kind: "Deployment",
                        name: this.deployment.metadata.name,
                    },
                    minReplicas: this.args.hpa.min || 1,
                    maxReplicas: this.args.hpa.max,
                    targetCPUUtilizationPercentage:
                        this.args.hpa.cpuUtilization || 80,
                },
            },
            {
                ...this.opts,
                parent: this,
                dependsOn: this.deployment,
            }
        );
    }

    private createIngress(): k8s.networking.v1.Ingress {
        if (!this.args.ingress || !this.service) {
            throw new Error(
                "Ingress configuration and Service are required to create an Ingress"
            );
        }

        return new k8s.networking.v1.Ingress(
            `${this.name}Ingress`,
            {
                metadata: {
                    name: `${this.name}-ingress`.toLocaleLowerCase(),
                    namespace: this.args.namespace,
                    annotations: {
                        "nginx.ingress.kubernetes.io/rewrite-target": "/",
                        "kubernetes.io/ingress.class": "nginx",
                        "kubernetes.io/tls-acme": "true",
                        "cert-manager.io/cluster-issuer": "letsencrypt",
                        "nginx.ingress.kubernetes.io/ssl-redirect": "true",
                        "nginx.ingress.kubernetes.io/proxy-buffer-size": "8k",
                    },
                },
                spec: {
                    ingressClassName: "nginx",
                    rules: [
                        {
                            host: this.args.ingress.host,
                            http: {
                                paths: [
                                    {
                                        path: "/",
                                        pathType: "Prefix",
                                        backend: {
                                            service: {
                                                name: this.service.metadata
                                                    .name,
                                                port: {
                                                    number: 80, // Assuming the main port is always 80
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                    tls: [
                        {
                            hosts: [this.args.ingress.host],
                            secretName: this.args.ingress.tlsSecretName,
                        },
                    ],
                },
            },
            { ...this.opts, parent: this, dependsOn: this.service }
        );
    }

    private createServiceMonitor(): k8s.apiextensions.CustomResource {
        if (!this.args.serviceMonitor || !this.service) {
            throw new Error(
                "ServiceMonitor configuration and Service are required to create a ServiceMonitor"
            );
        }

        return new k8s.apiextensions.CustomResource(
            `${this.name}ServiceMonitor`,
            {
                apiVersion: "monitoring.coreos.com/v1",
                kind: "ServiceMonitor",
                metadata: {
                    name: `${this.name}-service-monitor`.toLocaleLowerCase(),
                    namespace: this.args.namespace,
                    labels: {
                        // Make sure it's discoverable by prometheus with both labels
                        "app.kubernetes.io/name": "prometheus",
                        release: "prometheus",
                        // Keep the app labels consistent with the service
                        ...this.args.appLabels,
                    },
                },
                spec: {
                    selector: {
                        matchLabels: this.args.appLabels,
                    },
                    endpoints: [
                        {
                            port: this.args.serviceMonitor.port,
                            path: this.args.serviceMonitor.path,
                            interval:
                                this.args.serviceMonitor.interval || "15s",
                        },
                    ],
                    namespaceSelector: {
                        matchNames: [this.args.namespace],
                    },
                },
            },
            { ...this.opts, parent: this, dependsOn: this.service }
        );
    }
}
