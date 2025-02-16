import { db } from "ponder:api";
import {
    affiliationCampaignStatsTable,
    bankingContractTable,
    campaignTable,
    productAdministratorTable,
    productInteractionContractTable,
    productTable,
    tokenTable,
} from "ponder:schema";
import { Elysia, t } from "elysia";
import { eq, inArray } from "ponder";
import { type Hex, isHex, keccak256, toHex } from "viem";

export const productRoutes = new Elysia({
    prefix: "/products",
})
    /**
     * Get all the product administrators
     */
    .get(
        ":id/administrators",
        async ({ params, error }) => {
            // Extract the id
            const id = params.id as Hex;
            if (!isHex(id)) {
                return error(400, "Invalid product id");
            }

            // Perform the sql query
            const administrators = await db
                .select({
                    wallet: productAdministratorTable.user,
                    isOwner: productAdministratorTable.isOwner,
                    roles: productAdministratorTable.roles,
                    addedTimestamp: productAdministratorTable.createdTimestamp,
                })
                .from(productAdministratorTable)
                .where(eq(productAdministratorTable.productId, BigInt(id)));

            // Return the result as json
            return administrators;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
        }
    )
    /**
     * Get all the product banks
     */
    .get(
        ":id/banks",
        async ({ params, error }) => {
            // Extract the id
            const id = params.id as Hex;
            if (!isHex(id)) {
                return error(400, "Invalid product id");
            }

            // Perform the sql query
            const banks = await db
                .select({
                    address: bankingContractTable.id,
                    totalDistributed: bankingContractTable.totalDistributed,
                    totalClaimed: bankingContractTable.totalClaimed,
                    isDistributing: bankingContractTable.isDistributing,
                    token: {
                        address: tokenTable.id,
                        name: tokenTable.name,
                        symbol: tokenTable.symbol,
                        decimals: tokenTable.decimals,
                    },
                })
                .from(bankingContractTable)
                .where(eq(bankingContractTable.productId, BigInt(id)));

            // Return the result as json
            return banks;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
        }
    )
    /**
     * Get all the product info
     */
    .get(
        "info",
        async ({ query, error }) => {
            // Extract the product id
            const domain = query.domain;
            let productId = query.productId as Hex | undefined;

            // If no id provided, recompute it from the domain
            if (!productId && domain) {
                productId = keccak256(toHex(domain));
            }

            if (!productId || !isHex(productId)) {
                return error(403, {
                    msg: "Invalid product id",
                    productId,
                    domain,
                });
            }

            // Get the product from the db
            const products = await db
                .select()
                .from(productTable)
                .where(eq(productTable.id, BigInt(productId)));
            const product = products?.[0];

            // If not found, early exit
            if (!product) {
                return error(404, {
                    msg: "Product not found",
                    productId,
                    domain,
                });
            }

            // Get all the administrators
            const administrators = await db
                .select()
                .from(productAdministratorTable)
                .where(
                    eq(productAdministratorTable.productId, BigInt(productId))
                );

            // Get all the banks
            const banks = await db
                .select()
                .from(bankingContractTable)
                .where(eq(bankingContractTable.productId, BigInt(productId)));

            // Get the interaction contracts
            const interactionContracts = await db
                .select()
                .from(productInteractionContractTable)
                .where(
                    eq(
                        productInteractionContractTable.productId,
                        BigInt(productId)
                    )
                );

            // Get the campaigns
            const campaigns = await db
                .select()
                .from(campaignTable)
                .where(eq(campaignTable.productId, BigInt(productId)));

            // Get the campaigns tats
            const campaignStats = campaigns.length
                ? await db
                      .select()
                      .from(affiliationCampaignStatsTable)
                      .where(
                          inArray(
                              affiliationCampaignStatsTable.campaignId,
                              campaigns.map((c) => c.id)
                          )
                      )
                : [];

            // Return all the data related to the product
            return {
                product,
                banks,
                interactionContracts,
                administrators,
                campaigns,
                campaignStats,
            };
        },
        {
            query: t.Object({
                productId: t.Optional(t.String()),
                domain: t.Optional(t.String()),
            }),
        }
    );
