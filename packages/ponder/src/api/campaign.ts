import { db } from "ponder:api";
import { bankingContractTable, campaignTable } from "ponder:schema";
import { Elysia, t } from "elysia";
import { eq } from "ponder";
import { type Address, type Hex, isAddress, isHex } from "viem";
import { getTokens } from "./tokens";

export const campaignRoutes = new Elysia()
    /**
     * Get generic info about a campaign
     */
    .get(
        "/campaign",
        async ({ query, status }) => {
            // Extract wallet
            const campaignAddress = query.campaignAddress as
                | Address
                | undefined;
            const productId = query.productId as Hex | undefined;
            if (
                (campaignAddress && !isAddress(campaignAddress)) ||
                (productId && !isHex(productId))
            ) {
                return status(400, "Invalid campaign or product");
            }
            if (!campaignAddress && !productId) {
                return status(400, "Missing campaign or product params");
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
            return {
                campaigns,
                tokens,
            };
        },
        {
            query: t.Object({
                campaignAddress: t.Optional(t.String()),
                productId: t.Optional(t.String()),
            }),
        }
    );
