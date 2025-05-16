import { db } from "ponder:api";
import { tokenTable } from "ponder:schema";
import { Elysia, t } from "elysia";
import { eq, inArray } from "ponder";
import { type Address, isAddress } from "viem";

export const tokenRoutes = new Elysia({
    prefix: "/tokens",
})
    /**
     * Get all the known tokens
     */
    .get("/", async () =>
        db
            .select({
                address: tokenTable.id,
                name: tokenTable.name,
                symbol: tokenTable.symbol,
                decimals: tokenTable.decimals,
            })
            .from(tokenTable)
    )
    /**
     * Get a token's information by its address
     */
    .get(
        "/:address",
        async ({ params, status }) => {
            // Extract token address
            const address = params.address as Address;
            if (!isAddress(address)) {
                return status(400, "Invalid token address");
            }

            // Perform the sql query
            return await db
                .select({
                    address: tokenTable.id,
                    name: tokenTable.name,
                    symbol: tokenTable.symbol,
                    decimals: tokenTable.decimals,
                })
                .from(tokenTable)
                .where(eq(tokenTable.id, address));
        },
        {
            params: t.Object({
                address: t.String(),
            }),
        }
    );

/**
 * Get all the tokens information
 */
export async function getTokens({
    addresses,
}: { addresses: readonly Address[] }) {
    // If no addresses, return an empty array
    if (!addresses || addresses.length === 0) {
        return [];
    }

    // Convert the addresses to a set
    const addressSet = new Set(addresses);

    // Find all the tokens
    return db
        .select({
            address: tokenTable.id,
            name: tokenTable.name,
            symbol: tokenTable.symbol,
            decimals: tokenTable.decimals,
        })
        .from(tokenTable)
        .where(inArray(tokenTable.id, [...addressSet]));
}
