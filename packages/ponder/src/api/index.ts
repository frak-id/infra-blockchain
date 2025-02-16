import { Elysia } from "elysia";
import { Hono } from "hono";
import { adminRoutes } from "./admin";
import { campaignRoutes } from "./campaign";
import { interactionRoutes } from "./interactions";
import { membersRoutes } from "./members";
import { productRoutes } from "./products";
import { rewardRoutes } from "./rewards";
import { statsRoutes } from "./stats";

/**
 * Build the elysia app
 */
const elysiaApp = new Elysia()
    .use(adminRoutes)
    .use(campaignRoutes)
    .use(interactionRoutes)
    .use(productRoutes)
    .use(rewardRoutes)
    .use(membersRoutes)
    .use(statsRoutes);

/**
 * Export an hono app that expose the elysia app
 */
export default new Hono().mount("/", elysiaApp.fetch);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};
