import { db } from "ponder:api";
import {
    bankingContractTable,
    productTable,
    rewardAddedEventTable,
    rewardClaimedEventTable,
    rewardTable,
} from "ponder:schema";
import { Elysia, t } from "elysia";
import { and, desc, eq, not } from "ponder";
import { type Address, isAddress } from "viem";
import { getTokens } from "./tokens";

export const rewardRoutes = new Elysia({
    prefix: "/rewards",
})
    /**
     * Get all the current rewards for a wallet
     */
    .get(
        "/:wallet",
        async ({ params, status }) => {
            // Extract wallet
            const wallet = params.wallet as Address;
            if (!isAddress(wallet)) {
                return status(400, "Invalid wallet address");
            }

            // Perform the sql query
            const rewards = await db
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
            });

            // Return the result
            return {
                rewards,
                tokens,
            };
        },
        {
            params: t.Object({
                wallet: t.String(),
            }),
        }
    )
    /**
     * Get all the rewards history for a wallet
     */
    .get(
        "/:wallet/history",
        async ({ params, status }) => {
            // Extract wallet
            const wallet = params.wallet as Address;
            if (!isAddress(wallet)) {
                return status(400, "Invalid wallet address");
            }

            // Perform the sql query
            const rewardAddedPromise = db
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
                    eq(
                        bankingContractTable.id,
                        rewardAddedEventTable.contractId
                    )
                )
                .innerJoin(
                    productTable,
                    eq(productTable.id, bankingContractTable.productId)
                )
                .where(eq(rewardAddedEventTable.user, wallet))
                .limit(100)
                .orderBy(desc(rewardAddedEventTable.timestamp));

            // Perform the sql query
            const rewardClaimedPromise = db
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
                    eq(
                        bankingContractTable.id,
                        rewardClaimedEventTable.contractId
                    )
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
                addresses: [...rewardAdded, ...rewardClaimed].map(
                    (r) => r.token
                ),
            });

            // Return the result
            return {
                added: rewardAdded,
                claimed: rewardClaimed,
                tokens,
            };
        },
        {
            params: t.Object({
                wallet: t.String(),
            }),
        }
    );
