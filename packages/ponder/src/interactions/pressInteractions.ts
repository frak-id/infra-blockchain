import { ponder } from "ponder:registry";
import { interactionEventTable } from "ponder:schema";
import { safeIncreaseCampaignsStats } from "./stats";

ponder.on("ProductInteraction:ArticleRead", async ({ event, context }) => {
    // Insert the press event
    await context.db.insert(interactionEventTable).values({
        id: event.log.id,
        interactionId: event.log.address,
        user: event.args.user,
        type: "READ_ARTICLE",
        timestamp: event.block.timestamp,
        data: { articleId: event.args.articleId },
    });

    // Update the current campaigns stats
    await safeIncreaseCampaignsStats({
        interactionEmitter: event.log.address,
        blockNumber: event.block.number,
        context,
        increments: {
            readInteractions: 1n,
        },
    });
});

ponder.on("ProductInteraction:ArticleOpened", async ({ event, context }) => {
    // Insert the press event
    await context.db.insert(interactionEventTable).values({
        id: event.log.id,
        interactionId: event.log.address,
        user: event.args.user,
        type: "OPEN_ARTICLE",
        timestamp: event.block.timestamp,
        data: { articleId: event.args.articleId },
    });

    // Update the current campaigns stats
    await safeIncreaseCampaignsStats({
        interactionEmitter: event.log.address,
        blockNumber: event.block.number,
        context,
        increments: {
            openInteractions: 1n,
        },
    });
});
