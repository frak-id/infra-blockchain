import * as aws from "@pulumi/aws";
import { type ComponentResourceOptions, Output, all } from "@pulumi/pulumi";
import type { Component } from "../../.sst/platform/src/components/component.js";
import type * as sstDuration from "../../.sst/platform/src/components/duration";

// Some re-export from sst platform
const SstComponent: typeof Component = await import(
    "../../.sst/platform/src/components/component.js"
)
    .then((m) => m.Component)
    .catch(() => {
        console.debug(
            "SST Component not found, using a placeholder constructor"
        );
        // @ts-ignore: Not exported in the SST platform
        return sst.aws.Component;
    });

// Some re-export from sst platform
const duration: typeof sstDuration = await import(
    "../../.sst/platform/src/components/duration"
)
    .then((m) => m)
    .catch(() => {
        console.debug(
            "SST Component duration not found, using a placeholder constructor"
        );
        // @ts-ignore: Not exported in the SST platform
        return sst.aws.Component;
    });

type Port = `${number}/${"http" | "https" | "tcp" | "udp" | "tcp_udp" | "tls"}`;

type ServiceTargetArgs = {
    vpcId: Output<string>;
    // The domain on which it will be linked
    domain: string;
    // Ports config
    ports: {
        listen: Port;
        forward?: Port;
    }[];
    // Healthcheck config
    health: {
        path: string;
        interval: sstDuration.DurationMinutes;
        timeout: sstDuration.DurationMinutes;
        healthyThreshold?: number;
        unhealthyThreshold?: number;
        successCodes?: string;
    };
};

export class ServiceTargets extends SstComponent {
    private readonly dns = sst.aws.dns();

    private readonly lb: Promise<aws.lb.GetLoadBalancerResult>;

    public readonly targetGroups: Output<Record<string, aws.lb.TargetGroup>>;
    public readonly listeners: Output<Record<string, aws.lb.Listener>>;

    constructor(
        private name: string,
        private args: ServiceTargetArgs,
        opts?: ComponentResourceOptions
    ) {
        super("sst:frak:ServiceTarget", name, args, opts);

        // Get the master load balancer
        this.lb = this.getMasterLoadBalancer();

        // If on local, don't deploy anything
        if ($dev) {
            this.targetGroups = Output.create(
                {} as Record<string, aws.lb.TargetGroup>
            );
            this.listeners = Output.create(
                {} as Record<string, aws.lb.Listener>
            );
            return;
        }

        // Create the target groups
        const { listeners, targets } = this.createTargets();
        this.targetGroups = targets;
        this.listeners = listeners;

        // Register the service dns alias
        this.registerDnsAlias();
    }

    // Get the master load balancer
    private getMasterLoadBalancer() {
        return aws.lb.getLoadBalancer({
            name: `master-elb-${$dev ? "dev" : $app.stage}`,
        });
    }

    // Create the target groups
    private createTargets() {
        return all([this.args.ports, this.args.health, this.lb]).apply(
            ([ports, health, lb]) => {
                const listeners: Record<string, aws.lb.Listener> = {};
                const targets: Record<string, aws.lb.TargetGroup> = {};

                for (const p of ports) {
                    // Split the port to readable stuff
                    const listenParts = p.listen.split("/");
                    const forwardParts = p.forward
                        ? p.forward.split("/")
                        : listenParts;

                    const forwardProtocol = forwardParts[1].toUpperCase();
                    const forwardPort = Number.parseInt(forwardParts[0]);
                    const listenProtocol = listenParts[1].toUpperCase();
                    const listenPort = Number.parseInt(listenParts[0]);

                    // Build the target id
                    const targetId = `${forwardProtocol}${forwardPort}`;

                    // Create the target group
                    const target =
                        targets[targetId] ??
                        new aws.lb.TargetGroup(
                            `${this.name}Target${targetId}`,
                            {
                                namePrefix: forwardProtocol,
                                port: forwardPort,
                                protocol: forwardProtocol,
                                targetType: "ip",
                                vpcId: this.args.vpcId,
                                healthCheck: {
                                    path: health.path,
                                    healthyThreshold: health.healthyThreshold,
                                    unhealthyThreshold:
                                        health.unhealthyThreshold,
                                    interval: duration.toSeconds(
                                        health.interval
                                    ),
                                    timeout: duration.toSeconds(health.timeout),
                                    matcher: health.successCodes,
                                },
                                deregistrationDelay: 20,
                            },
                            { parent: this }
                        );
                    targets[targetId] = target;

                    // Try to find an existing listener
                    const existingListener = Output.create(
                        aws.lb
                            .getListener({
                                loadBalancerArn: lb.arn,
                                port: listenPort,
                            })
                            .catch(() => null)
                    );

                    // Get or build the listener for this [prt
                    const listenerId = `${listenProtocol}${listenPort}`;
                    const listener =
                        listeners[listenerId] ??
                        existingListener ??
                        new aws.lb.Listener(
                            `${this.name}Listener${listenerId}`,
                            {
                                loadBalancerArn: lb.arn,
                                port: listenPort,
                                protocol: listenProtocol,
                                defaultActions: [
                                    {
                                        type: "forward",
                                        targetGroupArn: target.arn,
                                    },
                                ],
                            },
                            { parent: this }
                        );
                    listeners[listenerId] = listener;

                    // Create the listener rule
                    new aws.lb.ListenerRule(`${this.name}Rule${listenerId}`, {
                        listenerArn: listener.arn,
                        actions: [
                            {
                                type: "forward",
                                targetGroupArn: target.arn,
                            },
                        ],
                        conditions: [
                            {
                                hostHeader: {
                                    values: [this.args.domain],
                                },
                            },
                        ],
                    });
                }

                return { listeners, targets };
            }
        );
    }

    // Register the service dns alias
    private registerDnsAlias() {
        all([this.lb]).apply(([lb]) => {
            this.dns.createAlias(
                this.name,
                {
                    name: this.args.domain,
                    aliasName: lb.dnsName,
                    aliasZone: lb.zoneId,
                },
                { parent: this }
            );
        });
    }
}
