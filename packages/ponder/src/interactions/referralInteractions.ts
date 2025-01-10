import { ponder } from "ponder:registry";
import { interactionEventTable } from "ponder:schema";
import { safeIncreaseCampaignsStats } from "./stats";

ponder.on(
    "ProductInteraction:ReferralLinkCreation",
    async ({ event, context }) => {
        // Insert the press event
        await context.db.insert(interactionEventTable).values({
            id: event.log.id,
            interactionId: event.log.address,
            user: event.args.user,
            type: "CREATE_REFERRAL_LINK",
            timestamp: event.block.timestamp,
            data: undefined,
        });

        // Update the current campaigns stats
        await safeIncreaseCampaignsStats({
            interactionEmitter: event.log.address,
            blockNumber: event.block.number,
            context,
            increments: {
                createReferredLinkInteractions: 1n,
            },
        });
    }
);

ponder.on("ProductInteraction:UserReferred", async ({ event, context }) => {
    // Insert the press event
    await context.db.insert(interactionEventTable).values({
        id: event.log.id,
        interactionId: event.log.address,
        user: event.args.user,
        type: "REFERRED",
        timestamp: event.block.timestamp,
        data: { referrer: event.args.referrer },
    });

    // Update the current campaigns stats
    await safeIncreaseCampaignsStats({
        interactionEmitter: event.log.address,
        blockNumber: event.block.number,
        context,
        increments: {
            referredInteractions: 1n,
        },
    });
});
