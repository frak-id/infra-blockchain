import * as console from "node:console";
import { type Context, ponder } from "ponder:registry";
import { bankingContractTable, campaignTable } from "ponder:schema";
import { type Address, isAddressEqual } from "viem";
import { campaignBankAbi } from "../../abis/campaignAbis";
import { upsertTokenIfNeeded } from "../token";
import { upsertCampaign } from "./campaignCreation";

ponder.on(
    "CampaignBanksFactory:CampaignBankCreated",
    async ({ event, context }) => {
        await upsertCampaignBank({
            address: event.args.campaignBank,
            blockNumber: event.block.number,
            context,
        });
    }
);

ponder.on(
    "CampaignBanks:CampaignAuthorisationUpdated",
    async ({ event, context }) => {
        // Find the interaction contract
        const campaign = await context.db.find(campaignTable, {
            id: event.args.campaign,
        });
        if (!campaign?.bankingContractId) {
            console.error(
                `Campaign contract not found: ${event.args.campaign}`
            );
            return;
        }

        if (!isAddressEqual(event.log.address, campaign.bankingContractId)) {
            console.error(
                `Banking contract mismatch: ${event.log.address} vs ${campaign.bankingContractId}`
            );
            return;
        }

        // Update the campaign
        await upsertCampaign({
            address: event.args.campaign,
            blockNumber: event.block.number,
            context,
            onConflictUpdate: {
                isAuthorisedOnBanking: event.args.isAllowed,
                lastUpdateBlock: event.block.number,
            },
        });
    }
);

ponder.on(
    "CampaignBanks:DistributionStateUpdated",
    async ({ event, context }) => {
        // Upsert the campaign and set the distributing status
        await upsertCampaignBank({
            address: event.log.address,
            blockNumber: event.block.number,
            context,
            onConflictUpdate: {
                isDistributing: event.args.isDistributing,
            },
        });
    }
);

async function upsertCampaignBank({
    address,
    blockNumber,
    context,
    onConflictUpdate = {},
}: {
    address: Address;
    blockNumber: bigint;
    context: Context;
    onConflictUpdate?: Partial<typeof bankingContractTable.$inferInsert>;
}) {
    const haveUpdates = Object.keys(onConflictUpdate).length > 0;
    // Check if the campaign bank already exist, if yes just update it if we got stuff to update
    const campaignBank = await context.db.find(bankingContractTable, {
        id: address,
    });
    if (campaignBank) {
        if (!haveUpdates) return;

        await context.db
            .update(bankingContractTable, {
                id: address,
            })
            .set(onConflictUpdate);
        return;
    }

    // If not found, find the token of this campaign
    const [productId, token] = await context.client.readContract({
        abi: campaignBankAbi,
        address,
        functionName: "getConfig",
        blockNumber: blockNumber,
    });

    // And upsert it
    const initialQuery = context.db.insert(bankingContractTable).values({
        id: address,
        tokenId: token,
        totalDistributed: 0n,
        totalClaimed: 0n,
        productId,
        isDistributing: false,
        ...onConflictUpdate,
    });

    // If we have updates, we need to do an update on conflict
    if (haveUpdates) {
        await initialQuery.onConflictDoUpdate(onConflictUpdate);
    } else {
        await initialQuery.onConflictDoNothing();
    }

    // Upsert the token if needed
    await upsertTokenIfNeeded({
        address: token,
        context,
    });

    // Then enrich it with blockchain data
}
