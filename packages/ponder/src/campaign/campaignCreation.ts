import { type Context, ponder } from "ponder:registry";
import { affiliationCampaignStatsTable, campaignTable } from "ponder:schema";
import { type Address, isAddressEqual, zeroAddress } from "viem";
import {
    interactionCampaignAbi,
    referralCampaignAbi,
} from "../../abis/campaignAbis";
import {
    affiliationCampaignTypes,
    emptyCampaignStats,
} from "../interactions/stats";
import { bytesToString } from "../utils/format";

const defaultCampaignValues: Omit<
    typeof campaignTable.$inferInsert,
    "id" | "lastUpdateBlock"
> = {
    type: "0",
    name: "",
    version: "0",
    productId: 0n,
    isAuthorisedOnBanking: false,
    attached: false,
    attachTimestamp: 0n,
    interactionContractId: zeroAddress,
};

/**
 * On new campaign creation
 */
ponder.on("CampaignsFactory:CampaignCreated", async ({ event, context }) => {
    // Upsert the campaign
    await upsertCampaign({
        address: event.args.campaign,
        blockNumber: event.block.number,
        context,
    });
});

/**
 * Upsert a fresh campaign in the db
 * @param address
 * @param block
 */
export async function upsertCampaign({
    address,
    blockNumber,
    context,
    onConflictUpdate = {},
}: {
    address: Address;
    blockNumber: bigint;
    context: Context;
    onConflictUpdate?: Partial<typeof campaignTable.$inferInsert>;
}) {
    const haveUpdates = Object.keys(onConflictUpdate).length > 0;

    // Create the campaign
    const initialQuery = context.db.insert(campaignTable).values({
        ...defaultCampaignValues,
        id: address,
        lastUpdateBlock: blockNumber,
        ...onConflictUpdate,
    });

    // Add the updates properties if needed
    if (haveUpdates) {
        await initialQuery.onConflictDoUpdate(onConflictUpdate);
    } else {
        await initialQuery.onConflictDoNothing();
    }

    // Then enrich the campaign if needed
    try {
        await enrichCampaignIfNeeded({
            address,
            blockNumber,
            context,
        });
    } catch (error) {
        console.error(
            `[Campaign] Failed to enrich campaign ${address} on block ${blockNumber}`,
            {
                error,
            }
        );
    }
}

/**
 * Enrich a fresh campaign with the metadata and config
 */
async function enrichCampaignIfNeeded({
    address,
    blockNumber,
    context: { client, db },
}: {
    address: Address;
    blockNumber: bigint;
    context: Context;
}) {
    const campaign = await db.find(campaignTable, { id: address });
    // Skipping because not yet inserted
    if (!campaign) {
        console.error(
            `[Campaign] Can't enrich campaign, not found: ${address}`
        );
        return;
    }

    // Skipping because we already enriched it
    if (!isAddressEqual(campaign.interactionContractId, zeroAddress)) {
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
            `[Campaign] Failed to get metadata/linkResult for campaign ${address} on block ${blockNumber}`
        );
        return;
    }
    if (configResult.status !== "success") {
        console.error(
            `[Campaign] Failed to get config for campaign ${address} on block ${blockNumber}`
        );
        return;
    }

    const [type, version, name] = metadataResult.result;
    const [productId, interactionContract] = linkResult.result;
    const formattedName = bytesToString(name);

    // Update the campaign
    await db.update(campaignTable, { id: address }).set({
        type,
        name: formattedName,
        version,
        productId,
        interactionContractId: interactionContract,
        bankingContractId:
            configResult.status === "success"
                ? configResult.result[2]
                : undefined,
    });

    // Upsert press campaign stats if it's the right type
    if (affiliationCampaignTypes.includes(type)) {
        await db
            .insert(affiliationCampaignStatsTable)
            .values({
                campaignId: address,
                ...emptyCampaignStats,
            })
            .onConflictDoNothing();
    }
}
