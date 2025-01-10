import type { Context } from "ponder:registry";
import {
    campaignTable,
    productInteractionContractTable,
    referralCampaignStatsTable,
} from "ponder:schema";
import { and, desc, eq } from "ponder";
import type { Address } from "viem";
import { interactionCampaignAbi } from "../../abis/campaignAbis";

/**
 * Default campaign stats
 */
export const emptyCampaignStats = {
    totalInteractions: 0n,
    openInteractions: 0n,
    readInteractions: 0n,
    referredInteractions: 0n,
    createReferredLinkInteractions: 0n,
    purchaseStartedInteractions: 0n,
    purchaseCompletedInteractions: 0n,
    customerMeetingInteractions: 0n,
    webshopOpenned: 0n,
    totalRewards: 0n,
};

export type StatsIncrementsParams = Partial<
    Omit<typeof referralCampaignStatsTable.$inferSelect, "campaignId">
>;

type IncreaseCampaignStatsArgs = {
    interactionEmitter?: Address;
    productId?: bigint;
    context: Context;
    blockNumber: bigint;
    increments: StatsIncrementsParams;
};

/**
 * Safely increase campaign stats, without crash if it's failing
 * @param args
 */
export async function safeIncreaseCampaignsStats(
    args: IncreaseCampaignStatsArgs
) {
    try {
        await increaseCampaignsStats(args);
    } catch (error) {
        console.error("Error during increaseCampaignsStats", error);
    }
}

/**
 * Get the rewarding contract for the given event emitter
 * @param interactionContract
 * @param context
 * @param increments fields to increments
 */
async function increaseCampaignsStats({
    interactionEmitter,
    productId,
    context: { client, db },
    increments,
    blockNumber,
}: IncreaseCampaignStatsArgs) {
    // Find the interaction contract
    let interactionContract:
        | typeof productInteractionContractTable.$inferSelect
        | null = null;
    if (interactionEmitter) {
        interactionContract = await db.find(productInteractionContractTable, {
            id: interactionEmitter,
        });
    } else if (productId) {
        // Find all the interactions contract, sorted with the one created lastly first
        const interactions = await db.sql
            .select()
            .from(productInteractionContractTable)
            .where(eq(productInteractionContractTable.productId, productId))
            .orderBy(desc(productInteractionContractTable.createdTimestamp))
            .limit(1)
            .execute();
        interactionContract = interactions?.[0] ?? null;
    }

    if (!interactionContract) {
        console.log("Interaction contract not found for stats update", {
            interactionEmitter,
            productId,
        });
        return;
    }

    if (!interactionContract) {
        console.log("Interaction contract not found for stats update", {
            interactionEmitter,
        });
        return;
    }

    // Find all the associated campaigns, of referral type, that are attached
    const campaigns = await db.sql
        .select()
        .from(campaignTable)
        .where(
            and(
                eq(campaignTable.productId, interactionContract.productId),
                eq(campaignTable.type, "frak.campaign.referral"),
                eq(campaignTable.attached, true)
            )
        );
    if (!campaigns.length) {
        return;
    }

    // Ensure the given campaign was active at this block
    let isActiveDuringInteraction: boolean[] = [];
    try {
        isActiveDuringInteraction = await client.multicall({
            allowFailure: false,
            contracts: campaigns.map(
                (campaign) =>
                    ({
                        address: campaign.id,
                        abi: interactionCampaignAbi,
                        functionName: "isActive",
                    }) as const
            ),
            blockNumber: blockNumber,
        });
    } catch (error) {
        console.error("Error during campaign.isActive multicall check", error);
        return;
    }

    // Filter to only get active campaigns during this even
    const activeCampaigns = campaigns.filter((campaign, index) => {
        if (!isActiveDuringInteraction[index]) {
            console.log(
                `Campaign ${campaign.id} was not active during the interaction`
            );
            return false;
        }
        return true;
    });

    // Upsert every stats
    await db
        .insert(referralCampaignStatsTable)
        .values(
            activeCampaigns.map((campaign) => ({
                ...emptyCampaignStats,
                ...increments,
                campaignId: campaign.id,
            }))
        )
        .onConflictDoUpdate((current) => updateStats(current, increments));
}

// Define a function to handle the update logic
function updateStats(
    current: typeof referralCampaignStatsTable.$inferSelect,
    increments: StatsIncrementsParams
) {
    const updatedStats = {
        ...current,
        totalInteractions: current.totalInteractions + 1n,
    };

    for (const key of Object.keys(increments)) {
        const tKey = key as keyof StatsIncrementsParams;
        updatedStats[tKey] = (current[tKey] ?? 0n) + (increments[tKey] ?? 0n);
    }

    return updatedStats;
}
