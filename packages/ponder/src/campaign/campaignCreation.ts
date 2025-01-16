import { type Context, ponder } from "ponder:registry";
import { campaignTable, referralCampaignStatsTable } from "ponder:schema";
import type { Address } from "viem";
import {
    interactionCampaignAbi,
    referralCampaignAbi,
} from "../../abis/campaignAbis";
import { emptyCampaignStats } from "../interactions/stats";
import { bytesToString } from "../utils/format";

/**
 * On new campaign creation
 */
ponder.on("CampaignsFactory:CampaignCreated", async ({ event, context }) => {
    // Upsert the campaign
    await upsertNewCampaign({
        address: event.args.campaign,
        blockNumber: event.block.number,
        context,
    });
});

const affiliationCampaignTypes = [
    "frak.campaign.affiliation-fixed",
    "frak.campaign.affiliation-range",
    "frak.campaign.referral",
];

/**
 * Upsert a fresh campaign in the db
 * @param address
 * @param block
 */
export async function upsertNewCampaign({
    address,
    blockNumber,
    context: { client, db },
    onConflictUpdate = {},
}: {
    address: Address;
    blockNumber: bigint;
    context: Context;
    onConflictUpdate?: Partial<typeof campaignTable.$inferInsert>;
}) {
    // If the campaign already exist, just update it
    const campaign = await db.find(campaignTable, { id: address });
    if (campaign) {
        if (Object.keys(onConflictUpdate).length === 0) return;

        await db
            .update(campaignTable, {
                id: address,
            })
            .set(onConflictUpdate);
        return;
    }

    // Get the metadata and config of the campaign
    const [metadataResult, linkResult, configResult] = await client.multicall({
        contracts: [
            {
                abi: interactionCampaignAbi,
                address,
                functionName: "getMetadata",
            } as const,
            {
                abi: interactionCampaignAbi,
                address,
                functionName: "getLink",
            } as const,
            // We can still use the `getConfig` method here since it's the same for every interactions abis
            {
                abi: referralCampaignAbi,
                address,
                functionName: "getConfig",
            } as const,
        ],
        allowFailure: true,
        blockNumber,
    });

    if (
        metadataResult.status !== "success" ||
        linkResult.status !== "success"
    ) {
        console.error(
            `Failed to get metadata/linkResult for campaign ${address}`,
            { blockNumber }
        );
        return;
    }
    const [type, version, name] = metadataResult.result;
    const [productId, interactionContract] = linkResult.result;
    const formattedName = bytesToString(name);

    // Create the campaign
    await db
        .insert(campaignTable)
        .values({
            id: address,
            type,
            name: formattedName,
            version,
            productId,
            interactionContractId: interactionContract,
            attached: false,
            attachTimestamp: 0n,
            bankingContractId:
                configResult.status === "success"
                    ? configResult.result[2]
                    : undefined,
            isAuthorisedOnBanking: false,
            lastUpdateBlock: blockNumber,
            ...onConflictUpdate,
        })
        .onConflictDoUpdate(onConflictUpdate);

    // Upsert press campaign stats if it's the right type
    if (affiliationCampaignTypes.includes(type)) {
        await db
            .insert(referralCampaignStatsTable)
            .values({
                campaignId: address,
                ...emptyCampaignStats,
            })
            .onConflictDoNothing();
    }
}
