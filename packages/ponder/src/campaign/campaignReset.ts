import { ponder } from "ponder:registry";
import { campaignCapResetTable } from "ponder:schema";

ponder.on(
    "Campaigns:DistributionCapReset",
    async ({ event, context: { db } }) => {
        await db.insert(campaignCapResetTable).values({
            campaignId: event.log.address,
            timestamp: event.block.timestamp,
            previousTimestamp: BigInt(event.args.previousTimestamp),
            distributedAmount: event.args.distributedAmount,
        });
    }
);
