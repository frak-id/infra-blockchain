import { ponder } from "ponder:registry";
import {
    interactionEventTable,
    productInteractionContractTable,
    productTable,
} from "ponder:schema";
import { count, countDistinct, eq, gte } from "ponder";

/**
 * Get the overall system stats
 */
ponder.get("/stats/overall", async (ctx) => {
    // Get the total nbr of user who performed an interaction
    const totalInteractions = await ctx.db
        .select({
            count: countDistinct(interactionEventTable.user),
        })
        .from(interactionEventTable);
    const totalPerType = await ctx.db
        .select({
            name: interactionEventTable.type,
            count: countDistinct(interactionEventTable.user),
        })
        .from(interactionEventTable)
        .groupBy(interactionEventTable.type);
    const totalPerProduct = await ctx.db
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
    const wauInteractions = await ctx.db
        .select({
            count: countDistinct(interactionEventTable.user),
        })
        .from(interactionEventTable)
        .where(gte(interactionEventTable.timestamp, wauMinTime));
    const dauInteractions = await ctx.db
        .select({
            count: countDistinct(interactionEventTable.user),
        })
        .from(interactionEventTable)
        .where(gte(interactionEventTable.timestamp, dauMinTime));

    // Total number of product registered
    const totalProducts = await ctx.db
        .select({ count: count() })
        .from(productTable);

    return ctx.json({
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
