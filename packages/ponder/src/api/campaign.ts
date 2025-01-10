import { ponder } from "ponder:registry";
import { bankingContractTable, campaignTable } from "ponder:schema";
import { eq } from "ponder";
import { type Address, type Hex, isAddress, isHex } from "viem";
import { getTokens } from "./tokens";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

/**
 * Get generic info about a campaign
 */
ponder.get("/campaign", async (ctx) => {
    // Extract wallet
    const campaignAddress = ctx.req.query("campaignAddress") as
        | Address
        | undefined;
    const productId = ctx.req.query("productId") as Hex | undefined;
    if (
        (campaignAddress && !isAddress(campaignAddress)) ||
        (productId && !isHex(productId))
    ) {
        return ctx.text("Invalid campaign or product", 400);
    }
    if (!campaignAddress && !productId) {
        return ctx.text("Missing campaign or product params", 400);
    }

    // Perform the sql query
    const campaigns = await ctx.db
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
        ctx,
    });

    // Return the result as json
    return ctx.json({
        campaigns,
        tokens,
    });
});
