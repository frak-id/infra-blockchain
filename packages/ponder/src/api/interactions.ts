import { db } from "ponder:api";
import {
    interactionEventTable,
    productInteractionContractTable,
    productTable,
} from "ponder:schema";
import { Elysia, t } from "elysia";
import { desc, eq } from "ponder";
import { type Address, isAddress } from "viem";

export const interactionRoutes = new Elysia()
    /**
     * Get all the interactions for a wallet
     */
    .get(
        "/interactions/:wallet",
        async ({ params, error }) => {
            // Extract wallet
            const wallet = params.wallet as Address;
            if (!isAddress(wallet)) {
                return error(400, "Invalid wallet address");
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
                    eq(
                        productTable.id,
                        productInteractionContractTable.productId
                    )
                )
                .where(eq(interactionEventTable.user, wallet))
                .limit(100)
                .orderBy(desc(interactionEventTable.timestamp));

            // Return the result as json
            return interactions;
        },
        {
            params: t.Object({
                wallet: t.String(),
            }),
        }
    );
