import { ponder } from "ponder:registry";
import { interactionEventTable } from "ponder:schema";
import { safeIncreaseCampaignsStats } from "./stats";

ponder.on("ProductInteraction:CustomerMeeting", async ({ event, context }) => {
    // Insert the press event
    await context.db.insert(interactionEventTable).values({
        id: event.id,
        interactionId: event.log.address,
        user: event.args.user,
        type: "CUSTOMER_MEETING",
        timestamp: event.block.timestamp,
        data: { agencyId: event.args.agencyId },
    });

    // Update the current campaigns stats
    await safeIncreaseCampaignsStats({
        interactionEmitter: event.log.address,
        blockNumber: event.block.number,
        context,
        increments: {
            customerMeetingInteractions: 1n,
        },
    });
});
