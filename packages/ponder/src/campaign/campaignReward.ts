import { ponder } from "ponder:registry";
import {
    bankingContractTable,
    rewardAddedEventTable,
    rewardClaimedEventTable,
    rewardTable,
} from "ponder:schema";
import { safeIncreaseCampaignsStats } from "../interactions/stats";

ponder.on("CampaignBanks:RewardAdded", async ({ event, context }) => {
    // Try to find a rewarding contract for the given event emitter
    const bankingContract = await context.db.find(bankingContractTable, {
        id: event.log.address,
    });
    if (!bankingContract) {
        console.error(`Banking contract not found: ${event.log.address}`);
        return;
    }

    // Update rewarding contract
    await context.db
        .update(bankingContractTable, {
            id: event.log.address,
        })
        .set({
            totalDistributed:
                bankingContract.totalDistributed + event.args.amount,
        });

    // Update the current user reward (insert it if not found)
    await context.db
        .insert(rewardTable)
        .values({
            contractId: bankingContract.id,
            user: event.args.user,
            pendingAmount: event.args.amount,
            totalReceived: event.args.amount,
            totalClaimed: 0n,
        })
        .onConflictDoUpdate((current) => ({
            pendingAmount: current.pendingAmount + event.args.amount,
            totalReceived: current.totalReceived + event.args.amount,
        }));

    // Insert the reward event
    await context.db.insert(rewardAddedEventTable).values({
        id: event.id,
        contractId: bankingContract.id,
        user: event.args.user,
        emitter: event.args.emitter,
        amount: event.args.amount,
        txHash: event.transaction.hash,
        timestamp: event.block.timestamp,
    });

    // Update the current campaigns stats for the distributed amount
    await safeIncreaseCampaignsStats({
        productId: bankingContract.productId,
        context,
        blockNumber: event.block.number,
        increments: {
            totalRewards: event.args.amount,
            rewardCount: 1n,
        },
    });
});

ponder.on("CampaignBanks:RewardClaimed", async ({ event, context: { db } }) => {
    // Try to find a rewarding contract for the given event emitter
    const bankingContract = await db.find(bankingContractTable, {
        id: event.log.address,
    });
    if (!bankingContract) {
        console.error(`Banking contract not found: ${event.log.address}`);
        return;
    }

    // Update rewarding contract
    await db
        .update(bankingContractTable, {
            id: event.log.address,
        })
        .set({
            totalClaimed: bankingContract.totalClaimed + event.args.amount,
        });

    // Update the current user reward (insert it if not found)
    await db
        .insert(rewardTable)
        .values({
            contractId: bankingContract.id,
            user: event.args.user,
            totalClaimed: event.args.amount,
            totalReceived: 0n,
            pendingAmount: 0n,
        })
        .onConflictDoUpdate((current) => ({
            pendingAmount: current.pendingAmount - event.args.amount,
            totalClaimed: current.totalClaimed + event.args.amount,
        }));

    // Insert the reward event
    await db.insert(rewardClaimedEventTable).values({
        id: event.id,
        contractId: bankingContract.id,
        user: event.args.user,
        amount: event.args.amount,
        txHash: event.transaction.hash,
        timestamp: event.block.timestamp,
    });
});
