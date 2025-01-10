import { ponder } from "ponder:registry";
import {
    campaignTable,
    interactionEventTable,
    productAdministratorTable,
    productInteractionContractTable,
    productTable,
    referralCampaignStatsTable,
} from "ponder:schema";
import { countDistinct, eq, inArray } from "ponder";
import { type Address, isAddress } from "viem";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

/**
 * Get all of the product where a user is either manager or owner
 */
ponder.get("/admin/:wallet/products", async (ctx) => {
    // Extract wallet
    const wallet = ctx.req.param("wallet") as Address;
    if (!isAddress(wallet)) {
        return ctx.text("Invalid wallet address", 400);
    }

    // Perform the sql query
    const products = await ctx.db
        .select({
            id: productAdministratorTable.productId,
            isOwner: productAdministratorTable.isOwner,
            roles: productAdministratorTable.roles,
            domain: productTable.domain,
            name: productTable.name,
            productTypes: productTable.productTypes,
        })
        .from(productAdministratorTable)
        .innerJoin(
            productTable,
            eq(productAdministratorTable.productId, productTable.id)
        )
        .where(eq(productAdministratorTable.user, wallet));

    // Return the result as json
    return ctx.json(products);
});

/**
 * Get all the campaign for a wallet, where the wallet is the manager
 */
ponder.get("/admin/:wallet/campaigns", async (ctx) => {
    // Extract wallet
    const wallet = ctx.req.param("wallet") as Address;
    if (!isAddress(wallet)) {
        return ctx.text("Invalid wallet address", 400);
    }

    // Perform the sql query
    const campaigns = await ctx.db
        .select({
            productId: productAdministratorTable.productId,
            isOwner: productAdministratorTable.isOwner,
            roles: productAdministratorTable.roles,
            id: campaignTable.id,
            type: campaignTable.type,
            name: campaignTable.name,
            version: campaignTable.version,
            attached: campaignTable.attached,
            attachTimestamp: campaignTable.attachTimestamp,
            detachTimestamp: campaignTable.detachTimestamp,
        })
        .from(productAdministratorTable)
        .innerJoin(
            campaignTable,
            eq(productAdministratorTable.productId, campaignTable.productId)
        )
        .where(eq(productAdministratorTable.user, wallet));

    // Return the result as json
    return ctx.json(campaigns);
});

// Get all the campaign stats for a wallet
ponder.get("/admin/:wallet/campaignsStats", async (ctx) => {
    // Extract wallet
    const wallet = ctx.req.param("wallet") as Address;
    if (!isAddress(wallet)) {
        return ctx.text("Invalid wallet address", 400);
    }

    // Perform the sql query
    const campaignsStats = await ctx.db
        .select({
            productId: productAdministratorTable.productId,
            isOwner: productAdministratorTable.isOwner,
            roles: productAdministratorTable.roles,
            id: campaignTable.id,
            name: campaignTable.name,
            bank: campaignTable.bankingContractId,
            totalInteractions: referralCampaignStatsTable.totalInteractions,
            openInteractions: referralCampaignStatsTable.openInteractions,
            readInteractions: referralCampaignStatsTable.readInteractions,
            customerMeetingInteractions:
                referralCampaignStatsTable.customerMeetingInteractions,
            referredInteractions:
                referralCampaignStatsTable.referredInteractions,
            createReferredLinkInteractions:
                referralCampaignStatsTable.createReferredLinkInteractions,
            purchaseStartedInteractions:
                referralCampaignStatsTable.purchaseStartedInteractions,
            purchaseCompletedInteractions:
                referralCampaignStatsTable.purchaseCompletedInteractions,
            totalRewards: referralCampaignStatsTable.totalRewards,
        })
        .from(productAdministratorTable)
        .innerJoin(
            campaignTable,
            eq(productAdministratorTable.productId, campaignTable.productId)
        )
        .innerJoin(
            referralCampaignStatsTable,
            eq(campaignTable.id, referralCampaignStatsTable.campaignId)
        )
        .where(eq(productAdministratorTable.user, wallet));

    // Get the unique wallet on this product
    if (campaignsStats.length === 0) {
        return ctx.json({ stats: [] });
    }

    // Get all the product ids for this admin
    const campaignProductIds = campaignsStats.map((c) => c.productId);
    const uniqueProductIds = [...new Set(campaignProductIds)];

    // Get the total number of unique users per product
    const totalPerProducts = await ctx.db
        .select({
            productId: productInteractionContractTable.productId,
            wallets: countDistinct(interactionEventTable.user),
        })
        .from(interactionEventTable)
        .innerJoin(
            productInteractionContractTable,
            eq(
                interactionEventTable.interactionId,
                productInteractionContractTable.id
            )
        )
        .where(
            inArray(productInteractionContractTable.productId, uniqueProductIds)
        )
        .groupBy(productInteractionContractTable.productId);

    // Return the result as json
    return ctx.json({
        stats: campaignsStats,
        users: totalPerProducts,
    });
});
