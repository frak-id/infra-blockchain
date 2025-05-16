import { db } from "ponder:api";
import {
    affiliationCampaignStatsTable,
    campaignTable,
    interactionEventTable,
    productAdministratorTable,
    productInteractionContractTable,
    productTable,
} from "ponder:schema";
import { Elysia, t } from "elysia";
import { countDistinct, eq, inArray } from "ponder";
import { type Address, isAddress } from "viem";

export const adminRoutes = new Elysia({
    prefix: "/admin",
})
    /**
     * Get all of the product where a user is either manager or owner
     */
    .get(
        "/:wallet/products",
        async ({ params, status }) => {
            // Extract wallet
            const wallet = params.wallet as Address;
            if (!isAddress(wallet)) {
                return status(400, "Invalid wallet address");
            }

            // Perform the sql query
            return await db
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
        },
        {
            params: t.Object({
                wallet: t.String(),
            }),
        }
    )
    /**
     * Get all the campaign for a wallet, where the wallet is the manager
     */
    .get(
        "/:wallet/campaigns",
        async ({ params, status }) => {
            // Extract wallet
            const wallet = params.wallet as Address;
            if (!isAddress(wallet)) {
                return status(400, "Invalid wallet address");
            }

            // Perform the sql query
            return await db
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
                    eq(
                        productAdministratorTable.productId,
                        campaignTable.productId
                    )
                )
                .where(eq(productAdministratorTable.user, wallet));
        },
        {
            params: t.Object({
                wallet: t.String(),
            }),
        }
    )
    /**
     * Get all the campaign stats for a wallet
     */
    .get(
        "/:wallet/campaignsStats",
        async ({ params, status }) => {
            // Extract wallet
            const wallet = params.wallet as Address;
            if (!isAddress(wallet)) {
                return status(400, "Invalid wallet address");
            }

            // Perform the sql query
            const campaignsStats = await db
                .select({
                    productId: productAdministratorTable.productId,
                    isOwner: productAdministratorTable.isOwner,
                    roles: productAdministratorTable.roles,
                    id: campaignTable.id,
                    name: campaignTable.name,
                    bank: campaignTable.bankingContractId,
                    totalInteractions:
                        affiliationCampaignStatsTable.totalInteractions,
                    openInteractions:
                        affiliationCampaignStatsTable.openInteractions,
                    readInteractions:
                        affiliationCampaignStatsTable.readInteractions,
                    customerMeetingInteractions:
                        affiliationCampaignStatsTable.customerMeetingInteractions,
                    referredInteractions:
                        affiliationCampaignStatsTable.referredInteractions,
                    createReferredLinkInteractions:
                        affiliationCampaignStatsTable.createReferredLinkInteractions,
                    purchaseStartedInteractions:
                        affiliationCampaignStatsTable.purchaseStartedInteractions,
                    purchaseCompletedInteractions:
                        affiliationCampaignStatsTable.purchaseCompletedInteractions,
                    totalRewards: affiliationCampaignStatsTable.totalRewards,
                    rewardCount: affiliationCampaignStatsTable.rewardCount,
                })
                .from(productAdministratorTable)
                .innerJoin(
                    campaignTable,
                    eq(
                        productAdministratorTable.productId,
                        campaignTable.productId
                    )
                )
                .innerJoin(
                    affiliationCampaignStatsTable,
                    eq(
                        campaignTable.id,
                        affiliationCampaignStatsTable.campaignId
                    )
                )
                .where(eq(productAdministratorTable.user, wallet));

            // Get the unique wallet on this product
            if (campaignsStats.length === 0) {
                return { stats: [] };
            }

            // Get all the product ids for this admin
            const campaignProductIds = campaignsStats.map((c) => c.productId);
            const uniqueProductIds = [...new Set(campaignProductIds)];

            // Get the total number of unique users per product
            const totalPerProducts = await db
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
                    inArray(
                        productInteractionContractTable.productId,
                        uniqueProductIds
                    )
                )
                .groupBy(productInteractionContractTable.productId);

            return {
                stats: campaignsStats,
                users: totalPerProducts,
            };
        },
        {
            params: t.Object({
                wallet: t.String(),
            }),
        }
    );
