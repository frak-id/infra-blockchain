import { ponder } from "ponder:registry";
import {
    bankingContractTable,
    productTable,
    rewardAddedEventTable,
    rewardClaimedEventTable,
    rewardTable,
} from "ponder:schema";
import { and, desc, eq, not } from "ponder";
import { type Address, isAddress } from "viem";
import { getTokens } from "./tokens";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

/**
 * Get all the current rewards for a wallet
 */
ponder.get("/rewards/:wallet", async (ctx) => {
    // Extract wallet
    const wallet = ctx.req.param("wallet") as Address;
    if (!isAddress(wallet)) {
        return ctx.text("Invalid wallet address", 400);
    }

    // Perform the sql query
    const rewards = await ctx.db
        .select({
            amount: rewardTable.pendingAmount,
            address: rewardTable.contractId,
            token: bankingContractTable.tokenId,
        })
        .from(rewardTable)
        .innerJoin(
            bankingContractTable,
            eq(bankingContractTable.id, rewardTable.contractId)
        )
        .where(
            and(
                eq(rewardTable.user, wallet),
                not(eq(rewardTable.pendingAmount, 0n))
            )
        )
        .orderBy(desc(rewardTable.pendingAmount));

    // Get all the tokens for the rewards
    const tokens = await getTokens({
        addresses: rewards.map((r) => r.token),
        ctx,
    });

    // Return the result as json
    return ctx.json({
        rewards,
        tokens,
    });
});

/**
 * Get all the rewards history for a wallet
 */
ponder.get("/rewards/:wallet/history", async (ctx) => {
    // Extract wallet
    const wallet = ctx.req.param("wallet") as Address;
    if (!isAddress(wallet)) {
        return ctx.text("Invalid wallet address", 400);
    }

    // Perform the sql query
    const rewardAddedPromise = ctx.db
        .select({
            amount: rewardAddedEventTable.amount,
            txHash: rewardAddedEventTable.txHash,
            timestamp: rewardAddedEventTable.timestamp,
            token: bankingContractTable.tokenId,
            productId: bankingContractTable.productId,
            productName: productTable.name,
        })
        .from(rewardAddedEventTable)
        .innerJoin(
            bankingContractTable,
            eq(bankingContractTable.id, rewardAddedEventTable.contractId)
        )
        .innerJoin(
            productTable,
            eq(productTable.id, bankingContractTable.productId)
        )
        .where(eq(rewardAddedEventTable.user, wallet))
        .limit(100)
        .orderBy(desc(rewardAddedEventTable.timestamp));

    // Perform the sql query
    const rewardClaimedPromise = ctx.db
        .select({
            amount: rewardClaimedEventTable.amount,
            txHash: rewardClaimedEventTable.txHash,
            timestamp: rewardClaimedEventTable.timestamp,
            token: bankingContractTable.tokenId,
            productId: bankingContractTable.productId,
            productName: productTable.name,
        })
        .from(rewardClaimedEventTable)
        .innerJoin(
            bankingContractTable,
            eq(bankingContractTable.id, rewardClaimedEventTable.contractId)
        )
        .innerJoin(
            productTable,
            eq(productTable.id, bankingContractTable.productId)
        )
        .where(eq(rewardClaimedEventTable.user, wallet))
        .limit(100)
        .orderBy(desc(rewardClaimedEventTable.timestamp));

    const [rewardAdded, rewardClaimed] = await Promise.all([
        rewardAddedPromise,
        rewardClaimedPromise,
    ]);

    // Get all the tokens for the rewards events
    const tokens = await getTokens({
        addresses: [...rewardAdded, ...rewardClaimed].map((r) => r.token),
        ctx,
    });

    // Return the result as json
    return ctx.json({
        added: rewardAdded,
        claimed: rewardClaimed,
        tokens,
    });
});
