import { ponder } from "@/generated";

ponder.on("ERC20:Transfer", async ({ event, context }) => {
    const { Account, TransferEvent } = context.db;

    // Create an Account for the sender, or update the balance if it already exists.
    await Account.upsert({
        id: event.args.from,
        create: {
            balance: BigInt(0),
        },
        update: ({ current }) => ({
            balance: current.balance - event.args.amount,
        }),
    });

    // Create an Account for the recipient, or update the balance if it already exists.
    await Account.upsert({
        id: event.args.to,
        create: {
            balance: event.args.amount,
        },
        update: ({ current }) => ({
            balance: current.balance + event.args.amount,
        }),
    });

    // Create a TransferEvent.
    await TransferEvent.create({
        id: event.log.id,
        data: {
            chain: context.network.chainId,
            fromId: event.args.from,
            toId: event.args.to,
            amount: event.args.amount,
            timestamp: Number(event.block.timestamp),
        },
    });
});
