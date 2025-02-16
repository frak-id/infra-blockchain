import { db } from "ponder:api";
import { tokenTable } from "ponder:schema";
import { eq, inArray } from "ponder";
import { type Address, isAddress } from "viem";
import app from ".";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

/**
 * Get a tokens information by its address
 */
app.get("/tokens/:address", async ({ req, json }) => {
    // Extract token address
    const address = req.param("address") as Address;
    if (!isAddress(address)) {
        return json("Invalid token address address", 400);
    }

    // Perform the sql query
    const rewards = await db
        .select({
            address: tokenTable.id,
            name: tokenTable.name,
            symbol: tokenTable.symbol,
            decimals: tokenTable.decimals,
        })
        .from(tokenTable)
        .where(eq(tokenTable.id, address));

    // Return the result as json
    return json(rewards);
});

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
