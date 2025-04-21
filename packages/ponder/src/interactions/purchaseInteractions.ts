import { ponder } from "ponder:registry";
import { interactionEventTable } from "ponder:schema";
import { safeIncreaseCampaignsStats } from "./stats";

ponder.on("ProductInteraction:PurchaseStarted", async ({ event, context }) => {
    // Insert the press event
    await context.db.insert(interactionEventTable).values({
        id: event.id,
        interactionId: event.log.address,
        user: event.args.user,
        type: "PURCHASE_STARTED",
        timestamp: event.block.timestamp,
        data: { purchaseId: event.args.purchaseId },
    });

    // Update the current campaigns stats
    await safeIncreaseCampaignsStats({
        interactionEmitter: event.log.address,
        blockNumber: event.block.number,
        context,
        increments: {
            purchaseStartedInteractions: 1n,
        },
    });
});
ponder.on(
    "ProductInteraction:PurchaseCompleted",
    async ({ event, context }) => {
        // Insert the press event
        await context.db.insert(interactionEventTable).values({
            id: event.id,
            interactionId: event.log.address,
            user: event.args.user,
            type: "PURCHASE_COMPLETED",
            timestamp: event.block.timestamp,
            data: { purchaseId: event.args.purchaseId },
        });

        // Update the current campaigns stats
        await safeIncreaseCampaignsStats({
            interactionEmitter: event.log.address,
            blockNumber: event.block.number,
            context,
            increments: {
                purchaseCompletedInteractions: 1n,
            },
        });
    }
);
