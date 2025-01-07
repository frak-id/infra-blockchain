import { ponder } from "ponder:registry";
import { productInteractionContractTable } from "ponder:schema";
import { productInteractionDiamondAbi } from "../abis/interactionAbis";

ponder.on(
    "ProductInteractionManager:InteractionContractDeployed",
    async ({ event, context: { client, db } }) => {
        // Get the referral tree of this interaction contract
        const referralTree = await client.readContract({
            abi: productInteractionDiamondAbi,
            address: event.args.interactionContract,
            functionName: "getReferralTree",
            blockNumber: event.block.number,
        });

        // Create the interaction contract
        await db.insert(productInteractionContractTable).values({
            id: event.args.interactionContract,
            productId: event.args.productId,
            createdTimestamp: event.block.timestamp,
            lastUpdateTimestamp: event.block.timestamp,
            referralTree,
            lastUpdateBlock: event.block.number,
        });
    }
);
ponder.on(
    "ProductInteractionManager:InteractionContractUpdated",
    async ({ event, context: { db } }) => {
        await db
            .update(productInteractionContractTable, {
                id: event.args.interactionContract,
            })
            .set({
                lastUpdateTimestamp: event.block.timestamp,
                lastUpdateBlock: event.block.number,
            });
    }
);
ponder.on(
    "ProductInteractionManager:InteractionContractDeleted",
    async ({ event, context: { db } }) => {
        await db
            .update(productInteractionContractTable, {
                id: event.args.interactionContract,
            })
            .set({
                removedTimestamp: event.block.timestamp,
                lastUpdateBlock: event.block.number,
            });
    }
);
