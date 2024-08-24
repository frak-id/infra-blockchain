import { Port } from "aws-cdk-lib/aws-ec2";
import {
    type ApplicationLoadBalancer,
    ApplicationProtocol,
    type ApplicationTargetGroup,
    ListenerAction,
    ListenerCondition,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";

/**
 * Create the http port mapping
 *  - The http port mapping will expose erpc + ponder reader
 */
export function addHttpListener({
    alb,
    erpcTargetGroup,
    readerTargetGroup,
}: {
    alb: ApplicationLoadBalancer;
    erpcTargetGroup: ApplicationTargetGroup;
    readerTargetGroup: ApplicationTargetGroup;
}) {
    // Create the listener on port 80
    const httpListener = alb.addListener("HttpListener", {
        port: 80,
    });
    httpListener.connections.allowInternally(
        Port.tcp(4001),
        "Allow erpc metrics port internally"
    );
    httpListener.connections.allowInternally(
        Port.tcp(8080),
        "Allow erpc public port internally"
    );
    httpListener.connections.allowInternally(
        Port.tcp(42069),
        "Allow indexer public port internally"
    );

    // Create our erpc target group on port 8080 and bind it to the http listener
    httpListener.addAction("Erpc80ForwardAction", {
        action: ListenerAction.forward([erpcTargetGroup]),
    });
    httpListener.addTargetGroups("Erpc80Target", {
        targetGroups: [erpcTargetGroup],
        priority: 1,
        conditions: [
            ListenerCondition.pathPatterns(["/ponder-rpc/*", "/nexus-rpc/*"]),
        ],
    });

    // Create our listener for ponder reader
    httpListener.addAction("Ponder80ForwardAction", {
        action: ListenerAction.forward([readerTargetGroup]),
    });
    httpListener.addTargetGroups("Ponder80Target", {
        targetGroups: [readerTargetGroup],
        priority: 2,
        conditions: [ListenerCondition.pathPatterns(["/*"])],
    });
}

/**
 * Add a full exposure around the ponder indexer instance
 *   todo: Should be protected endpoint
 */
export function addFullPonderIndexerExposure({
    alb,
    indexerTargetGroup,
}: {
    alb: ApplicationLoadBalancer;
    indexerTargetGroup: ApplicationTargetGroup;
}) {
    const listener = alb.addListener("PondexerIndexerListener", {
        port: 8080,
        protocol: ApplicationProtocol.HTTP,
    });
    listener.connections.allowInternally(
        Port.tcp(42069),
        "Allow indexer public port internally"
    );

    // Create our listener for ponder reader
    listener.addAction("PonderIndexerForwardAction", {
        action: ListenerAction.forward([indexerTargetGroup]),
    });
    listener.addTargetGroups("PonderIndexerTarget", {
        targetGroups: [indexerTargetGroup],
    });
}

/**
 * Add a full exposure around the ponder indexer instance
 *   todo: Should be protected endpoint
 */
export function addFullErpcExposure({
    alb,
    erpcTargetGroup,
}: {
    alb: ApplicationLoadBalancer;
    erpcTargetGroup: ApplicationTargetGroup;
}) {
    const listener = alb.addListener("ErpcListener", {
        port: 8081,
        protocol: ApplicationProtocol.HTTP,
    });
    listener.connections.allowInternally(
        Port.tcp(4001),
        "Allow erpc metrics port internally"
    );
    listener.connections.allowInternally(
        Port.tcp(8080),
        "Allow erpc public port internally"
    );

    // Create our listener for ponder reader
    listener.addAction("ErpcListenerForwardAction", {
        action: ListenerAction.forward([erpcTargetGroup]),
    });
    listener.addTargetGroups("ErpcListenerTarget", {
        targetGroups: [erpcTargetGroup],
    });
}
