import { db } from "ponder:api";
import {
    interactionEventTable,
    productInteractionContractTable,
    productTable,
} from "ponder:schema";
import { desc, eq } from "ponder";
import { type Address, isAddress } from "viem";
import app from ".";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

/**
 * Get all the interactions for a wallet
 */
app.get("/interactions/:wallet", async ({ req, json }) => {
    // Extract wallet
    const wallet = req.param("wallet") as Address;
    if (!isAddress(wallet)) {
        return json("Invalid wallet address", 400);
    }

    // Perform the sql query
    const interactions = await db
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
    return json(interactions);
});
