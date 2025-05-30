import type { Context } from "ponder:registry";
import {
    affiliationCampaignStatsTable,
    campaignTable,
    productInteractionContractTable,
} from "ponder:schema";
import { and, desc, eq, inArray } from "ponder";
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
    rewardCount: 0n,
};

/**
 * All the type of campaigns that are affiliation related
 */
export const affiliationCampaignTypes = [
    "frak.campaign.affiliation-fixed",
    "frak.campaign.affiliation-range",
    "frak.campaign.referral",
];

export type StatsIncrementsParams = Partial<
    Omit<typeof affiliationCampaignStatsTable.$inferSelect, "campaignId">
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
                inArray(campaignTable.type, affiliationCampaignTypes),
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
    const activeCampaigns = campaigns.filter((_, index) => {
        if (!isActiveDuringInteraction[index]) {
            return false;
        }
        return true;
    });

    // Upsert every stats
    await db
        .insert(affiliationCampaignStatsTable)
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
    current: typeof affiliationCampaignStatsTable.$inferSelect,
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
