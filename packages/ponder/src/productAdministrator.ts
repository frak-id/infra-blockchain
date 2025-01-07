import { type Context, ponder } from "ponder:registry";
import { productAdministratorTable } from "ponder:schema";
import { isAddressEqual, zeroAddress } from "viem";

/*
 * Handle transfer stuff
 */
ponder.on("ProductRegistry:Transfer", async ({ event, context }) => {
    const productId = event.args.id;

    // Remove the previous administrator
    if (!isAddressEqual(event.args.from, zeroAddress)) {
        await context.db
            .insert(productAdministratorTable)
            .values({
                productId,
                user: event.args.from,
                roles: 0n,
                isOwner: false,
                createdTimestamp: event.block.timestamp,
            })
            .onConflictDoUpdate({ isOwner: false });
    }

    // Create the new administrator
    if (!isAddressEqual(event.args.to, zeroAddress)) {
        await context.db
            .insert(productAdministratorTable)
            .values({
                isOwner: true,
                productId,
                roles: 0n,
                user: event.args.to,
                createdTimestamp: event.block.timestamp,
            })
            .onConflictDoUpdate({ isOwner: true });
    }

    // Cleanup the administrators
    await administratorCleanup(context);
});

ponder.on(
    "ProductAdministratorRegistry:ProductRolesUpdated",
    async ({ event, context }) => {
        await context.db
            .insert(productAdministratorTable)
            .values({
                isOwner: false,
                productId: event.args.product,
                roles: event.args.roles,
                user: event.args.user,
                createdTimestamp: event.block.timestamp,
            })
            .onConflictDoUpdate({
                roles: event.args.roles,
            });

        // Cleanup the administrators
        await administratorCleanup(context);
    }
);

/**
 * Find every administrator where isOwner = false and roles = 0 and delete them
 */
async function administratorCleanup(_: Context) {
    // todo: Disabled for now since fcked up on this ponder version
    return;
    // const { ProductAdministrator } = context.db;

    // // Get the administrators to delete
    // const administrators = await ProductAdministrator.findMany({
    //     where: {
    //         AND: [{ isOwner: false }, { roles: 0n }],
    //     },
    // });

    // // Delete them
    // for (const admin of administrators.items) {
    //     console.log(`Will delete administrator ${admin.id}`);
    //     await ProductAdministrator.delete({ id: admin.id });
    // }
}
