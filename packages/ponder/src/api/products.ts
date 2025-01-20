import { ponder } from "ponder:registry";
import {
    affiliationCampaignStatsTable,
    bankingContractTable,
    campaignTable,
    productAdministratorTable,
    productInteractionContractTable,
    productTable,
    tokenTable,
} from "ponder:schema";
import { eq, inArray } from "ponder";
import { type Hex, isHex, keccak256, toHex } from "viem";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

/**
 * Get all the product administrators
 */
ponder.get("/products/:id/administrators", async (ctx) => {
    // Extract the id
    const id = ctx.req.param("id") as Hex;
    if (!isHex(id)) {
        return ctx.text("Invalid product id", 400);
    }

    // Perform the sql query
    const administrators = await ctx.db
        .select({
            wallet: productAdministratorTable.user,
            isOwner: productAdministratorTable.isOwner,
            roles: productAdministratorTable.roles,
            addedTimestamp: productAdministratorTable.createdTimestamp,
        })
        .from(productAdministratorTable)
        .where(eq(productAdministratorTable.productId, BigInt(id)));

    // Return the result as json
    return ctx.json(administrators);
});

/**
 * Get all the product banks
 */
ponder.get("/products/:id/banks", async (ctx) => {
    // Extract the id
    const id = ctx.req.param("id") as Hex;
    if (!isHex(id)) {
        return ctx.text("Invalid product id", 400);
    }

    // Perform the sql query
    const banks = await ctx.db
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
        .innerJoin(tokenTable, eq(bankingContractTable.tokenId, tokenTable.id))
        .where(eq(bankingContractTable.productId, BigInt(id)));

    // Return the result as json
    return ctx.json(banks);
});

/**
 * Get the overall product info
 */
ponder.get("/products/info", async ({ req, db, json }) => {
    // Extract the product id
    const domain = req.query("domain");
    let productId = req.query("id") as Hex | undefined;

    // If no id provided, recompute it from the domain
    if (!productId && domain) {
        productId = keccak256(toHex(domain));
    }

    if (!productId || !isHex(productId)) {
        return json({ msg: "Invalid product id", productId, domain });
    }

    // Get the product from the db
    const products = await db
        .select()
        .from(productTable)
        .where(eq(productTable.id, BigInt(productId)));
    const product = products?.[0];

    // If not found, early exit
    if (!product) {
        return json({ msg: "Product not found", productId, domain });
    }

    // Get all the admninistrators
    const administrators = await db
        .select()
        .from(productAdministratorTable)
        .where(eq(productAdministratorTable.productId, BigInt(productId)));

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
            eq(productInteractionContractTable.productId, BigInt(productId))
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
    return json({
        product,
        banks,
        interactionContracts,
        administrators,
        campaigns,
        campaignStats,
    });
});
