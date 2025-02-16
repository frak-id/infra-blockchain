import { db } from "ponder:api";
import {
    affiliationCampaignStatsTable,
    bankingContractTable,
    campaignTable,
    interactionEventTable,
    productInteractionContractTable,
    productTable,
    rewardTable,
} from "ponder:schema";
import { count, countDistinct, eq, gte, inArray, max } from "ponder";
import { type Address, type Hex, isAddressEqual } from "viem";
import app from ".";

/**
 * Get the overall system stats
 */
app.get("/stats/overall", async ({ json }) => {
    // Get the total nbr of user who performed an interaction
    const totalInteractions = await db
        .select({
            count: countDistinct(interactionEventTable.user),
        })
        .from(interactionEventTable);
    const totalPerType = await db
        .select({
            name: interactionEventTable.type,
            count: countDistinct(interactionEventTable.user),
        })
        .from(interactionEventTable)
        .groupBy(interactionEventTable.type);
    const totalPerProduct = await db
        .select({
            name: productTable.name,
            count: countDistinct(interactionEventTable.user),
        })
        .from(interactionEventTable)
        .innerJoin(
            productInteractionContractTable,
            eq(
                interactionEventTable.interactionId,
                productInteractionContractTable.id
            )
        )
        .innerJoin(
            productTable,
            eq(productInteractionContractTable.productId, productTable.id)
        )
        .groupBy(productTable.id);

    // Get the min time for the WAU and DAU
    const wauMinTime = BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000n;
    const dauMinTime = BigInt(Date.now() - 30 * 60 * 60 * 1000) / 1000n;

    // Get the WAU and DAU
    const wauInteractions = await db
        .select({
            count: countDistinct(interactionEventTable.user),
        })
        .from(interactionEventTable)
        .where(gte(interactionEventTable.timestamp, wauMinTime));
    const dauInteractions = await db
        .select({
            count: countDistinct(interactionEventTable.user),
        })
        .from(interactionEventTable)
        .where(gte(interactionEventTable.timestamp, dauMinTime));

    // Total number of product registered
    const totalProducts = await db
        .select({ count: count() })
        .from(productTable);

    return json({
        interactions: {
            total: totalInteractions[0]?.count,
            wau: wauInteractions[0]?.count,
            dau: dauInteractions[0]?.count,
            totalPerType,
            totalPerProduct,
        },
        products: totalProducts[0]?.count,
    });
});

/**
 * Get all the wallets related stats
 */
app.get("/stats/wallets", async ({ json }) => {
    // Total wallets with interactions
    const allWallets = await db
        .select({
            wallet: interactionEventTable.user,
            interactionsContract: interactionEventTable.interactionId,
            interactions: countDistinct(interactionEventTable.id),
            lastInteraction: max(interactionEventTable.timestamp),
        })
        .from(interactionEventTable)
        .groupBy(
            interactionEventTable.user,
            interactionEventTable.interactionId
        );

    // Get the product related to each interactions contract
    const uniqueInteractionContracts = [
        ...new Set(allWallets.map((wallet) => wallet.interactionsContract)),
    ] as Hex[];
    const uniqueWallets = [
        ...new Set(allWallets.map((wallet) => wallet.wallet)),
    ] as Address[];

    // Then find the list of products on which each wallet interacted
    const products = await db
        .select({
            id: productInteractionContractTable.id,
            productId: productInteractionContractTable.productId,
            name: productTable.name,
        })
        .from(productInteractionContractTable)
        .innerJoin(
            productTable,
            eq(productInteractionContractTable.productId, productTable.id)
        )
        .where(
            inArray(
                productInteractionContractTable.id,
                uniqueInteractionContracts
            )
        );

    // Then find the rewards for each wallets
    const rewards = await db
        .select({
            wallet: rewardTable.user,
            totalReceived: rewardTable.totalReceived,
            totalClaimed: rewardTable.totalReceived,
        })
        .from(rewardTable)
        .where(inArray(rewardTable.user, uniqueWallets));

    // Merge everything together (list = { wallet: products: [], rewards: []})
    const output = uniqueWallets.map((wallet) => {
        // Build the product map for this wallet
        const walletWithProducts = allWallets.filter((aWallet) =>
            isAddressEqual(aWallet.wallet, wallet)
        );
        const allConcernedProducts = walletWithProducts.map((wallet) => {
            const contract = wallet.interactionsContract;
            const product = products.find((product) =>
                isAddressEqual(product.id, contract)
            );
            return {
                id: product?.id,
                name: product?.name,
                interactions: wallet.interactions,
                lastTimestamp: wallet.lastInteraction,
            };
        });

        return {
            wallet: wallet,
            products: allConcernedProducts,
            rewards: rewards.filter((reward) =>
                isAddressEqual(reward.wallet, wallet)
            ),
        };
    });

    return json(output);
});

/**
 * Get some campaign related stats
 */
app.get("/stats/campaigns", async ({ json }) => {
    const afilliationCampaigns = await db
        .select({
            id: campaignTable.id,
            name: campaignTable.name,
            bank: campaignTable.bankingContractId,
            totalInteractions: affiliationCampaignStatsTable.totalInteractions,
            openInteractions: affiliationCampaignStatsTable.openInteractions,
            readInteractions: affiliationCampaignStatsTable.readInteractions,
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
        .from(affiliationCampaignStatsTable)
        .innerJoin(
            campaignTable,
            eq(affiliationCampaignStatsTable.campaignId, campaignTable.id)
        )
        .innerJoin(
            bankingContractTable,
            eq(campaignTable.bankingContractId, bankingContractTable.id)
        );

    return json(afilliationCampaigns);
});
