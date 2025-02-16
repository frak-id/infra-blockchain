import { db } from "ponder:api";
import { bankingContractTable, campaignTable } from "ponder:schema";
import { eq } from "ponder";
import { type Address, type Hex, isAddress, isHex } from "viem";
import app from ".";
import { getTokens } from "./tokens";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

/**
 * Get generic info about a campaign
 */
app.get("/campaign", async ({ req, json }) => {
    // Extract wallet
    const campaignAddress = req.query("campaignAddress") as Address | undefined;
    const productId = req.query("productId") as Hex | undefined;
    if (
        (campaignAddress && !isAddress(campaignAddress)) ||
        (productId && !isHex(productId))
    ) {
        return json("Invalid campaign or product", 400);
    }
    if (!campaignAddress && !productId) {
        return json("Missing campaign or product params", 400);
    }

    // Perform the sql query
    const campaigns = await db
        .select({
            address: campaignTable.id,
            type: campaignTable.type,
            name: campaignTable.name,
            version: campaignTable.version,
            productId: campaignTable.productId,
            attached: campaignTable.attached,
            banking: campaignTable.bankingContractId,
            lastUpdateBlock: campaignTable.lastUpdateBlock,
            token: bankingContractTable.tokenId,
        })
        .from(campaignTable)
        .innerJoin(
            bankingContractTable,
            eq(bankingContractTable.id, campaignTable.bankingContractId)
        )
        .where(
            campaignAddress
                ? eq(campaignTable.id, campaignAddress)
                : eq(campaignTable.productId, BigInt(productId ?? 0n))
        );

    // Get all the tokens for the campaign
    const tokens = await getTokens({
        addresses: campaigns.map((r) => r.token),
    });

    // Return the result as json
    return json({
        campaigns,
        tokens,
    });
});
