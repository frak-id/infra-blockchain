import { ponder } from "ponder:registry";
import {
    interactionEventTable,
    productInteractionContractTable,
    productTable,
} from "ponder:schema";
import { desc, eq } from "ponder";
import { type Address, isAddress } from "viem";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

/**
 * Get all the interactions for a wallet
 */
ponder.get("/interactions/:wallet", async (ctx) => {
    // Extract wallet
    const wallet = ctx.req.param("wallet") as Address;
    if (!isAddress(wallet)) {
        return ctx.text("Invalid wallet address", 400);
    }

    // Perform the sql query
    const interactions = await ctx.db
        .select({
            data: interactionEventTable.data,
            type: interactionEventTable.type,
            timestamp: interactionEventTable.timestamp,
            productId: productInteractionContractTable.productId,
            productName: productTable.name,
        })
        .from(interactionEventTable)
        .innerJoin(
            productInteractionContractTable,
            eq(
                productInteractionContractTable.id,
                interactionEventTable.interactionId
            )
        )
        .innerJoin(
            productTable,
            eq(productTable.id, productInteractionContractTable.productId)
        )
        .where(eq(interactionEventTable.user, wallet))
        .limit(100)
        .orderBy(desc(interactionEventTable.timestamp));

    // Return the result as json
    return ctx.json(interactions);
});
