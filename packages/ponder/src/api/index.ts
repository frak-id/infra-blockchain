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
 * Build our hono app
 */
const honoApp = new Hono();

// Check if we have an api
const hasApi = process.env.NO_API !== "true";

/**
 * If we got an api, create the elysia app and mount it on the hono app
 */
if (hasApi) {
    // Build the elysia app that will serve the api
    const elysiaApp = new Elysia()
        .use(adminRoutes)
        .use(campaignRoutes)
        .use(interactionRoutes)
        .use(productRoutes)
        .use(rewardRoutes)
        .use(membersRoutes)
        .use(statsRoutes);

    // Mount the elysia app on the hono app
    honoApp.mount("/", elysiaApp.fetch);
}

// Export the hono app
export default honoApp;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};
