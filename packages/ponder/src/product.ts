import { ponder } from "ponder:registry";
import { productTable } from "ponder:schema";
import { productRegistryAbi } from "../abis/registryAbis";
import { bytesToString } from "./utils/format";

ponder.on("ProductRegistry:ProductMinted", async ({ event, context }) => {
    // Get the metadata url
    const metadataUrl = await context.client.readContract({
        abi: productRegistryAbi,
        functionName: "tokenURI",
        address: context.contracts.ProductRegistry.address,
        args: [event.args.productId],
        blockNumber: event.block.number,
    });

    // Create the product
    await context.db
        .insert(productTable)
        .values({
            id: event.args.productId,
            domain: event.args.domain,
            productTypes: event.args.productTypes,
            name: bytesToString(event.args.name),
            createTimestamp: event.block.timestamp,
            metadataUrl,
            lastUpdateBlock: event.block.number,
        })
        .onConflictDoUpdate((current) => ({
            name: bytesToString(event.args.name),
            productTypes: event.args.productTypes,
            lastUpdateTimestamp: event.block.timestamp,
            metadataUrl: metadataUrl ?? current.metadataUrl,
            lastUpdateBlock: event.block.number,
        }));
});

ponder.on("ProductRegistry:ProductUpdated", async ({ event, context }) => {
    let metadataUrl: string | undefined = undefined;

    // Update the metadata url if needed
    if (event.args.customMetadataUrl.length > 0) {
        metadataUrl = event.args.customMetadataUrl;
    }

    // Update the product
    await context.db
        .update(productTable, { id: event.args.productId })
        .set((current) => ({
            name: bytesToString(event.args.name),
            productTypes: event.args.productTypes,
            lastUpdateTimestamp: event.block.timestamp,
            metadataUrl: metadataUrl ?? current.metadataUrl,
            lastUpdateBlock: event.block.number,
        }));
});
