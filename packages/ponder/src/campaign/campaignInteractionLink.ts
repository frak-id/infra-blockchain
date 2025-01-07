import { ponder } from "ponder:registry";
import { campaignTable, productInteractionContractTable } from "ponder:schema";
import { upsertNewCampaign } from "./campaignCreation";

ponder.on("ProductInteraction:CampaignAttached", async ({ event, context }) => {
    // Find the interaction contract
    const interactionContract = await context.db.find(
        productInteractionContractTable,
        {
            id: event.log.address,
        }
    );
    if (!interactionContract) {
        console.error(`Interaction contract not found: ${event.log.address}`);
        return;
    }

    // Get the metadata and create it
    await upsertNewCampaign({
        address: event.args.campaign,
        blockNumber: event.block.number,
        context,
        onConflictUpdate: {
            attached: true,
            attachTimestamp: event.block.timestamp,
            lastUpdateBlock: event.block.number,
        },
    });

    // Update the interaction contract
    await context.db
        .update(productInteractionContractTable, {
            id: event.log.address,
        })
        .set({
            lastUpdateTimestamp: event.block.timestamp,
            lastUpdateBlock: event.block.number,
        });
});

ponder.on(
    "ProductInteraction:CampaignDetached",
    async ({ event, context: { db } }) => {
        // Find the campaign to product and mark it as detached
        await db
            .update(campaignTable, {
                id: event.args.campaign,
            })
            .set({
                attached: false,
                detachTimestamp: event.block.timestamp,
                lastUpdateBlock: event.block.number,
            });

        // Update the interaction contract
        await db
            .update(productInteractionContractTable, {
                id: event.log.address,
            })
            .set({
                lastUpdateTimestamp: event.block.timestamp,
                lastUpdateBlock: event.block.number,
            });
    }
);
