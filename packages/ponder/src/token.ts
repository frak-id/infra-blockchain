import console from "node:console";
import type { Context } from "ponder:registry";
import { tokenTable } from "ponder:schema";
import { type Address, erc20Abi } from "viem";

export async function upsertTokenIfNeeded({
    address,
    context: { client, db },
}: {
    address: Address;
    context: Context;
}) {
    // Create the token if needed
    const tokenDb = await db.find(tokenTable, { id: address });
    if (tokenDb) return;

    try {
        // Fetch a few onchain data
        const [name, symbol, decimals] = await client.multicall({
            contracts: [
                {
                    abi: erc20Abi,
                    functionName: "name",
                    address: address,
                },
                {
                    abi: erc20Abi,
                    functionName: "symbol",
                    address: address,
                },
                {
                    abi: erc20Abi,
                    functionName: "decimals",
                    address: address,
                },
            ] as const,
            allowFailure: false,
        });

        // Create the token
        await db.insert(tokenTable).values({
            id: address,
            name,
            symbol,
            decimals,
        });
    } catch (e) {
        console.error(e, "Unable to fetch token data");
    }
}
