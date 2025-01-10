import { index, onchainEnum, onchainTable, primaryKey } from "ponder";

/* -------------------------------------------------------------------------- */
/*                            Product related stuff                           */
/* -------------------------------------------------------------------------- */

export const productTable = onchainTable(
    "Product",
    (t) => ({
        id: t.bigint().primaryKey(),

        domain: t.varchar().notNull(),
        productTypes: t.bigint().notNull(),
        name: t.varchar().notNull(),

        createTimestamp: t.bigint().notNull(),
        lastUpdateTimestamp: t.bigint(),

        lastUpdateBlock: t.bigint().notNull(),

        metadataUrl: t.varchar(),
    }),
    (table) => ({
        domainIdx: index().on(table.domain),
    })
);

export const productAdministratorTable = onchainTable(
    "ProductAdministrator",
    (t) => ({
        productId: t.bigint().notNull(),

        isOwner: t.boolean().notNull(),
        roles: t.bigint().notNull(),
        user: t.hex().notNull(),

        createdTimestamp: t.bigint().notNull(),
    }),
    (table) => ({
        pk: primaryKey({ columns: [table.productId, table.user] }),
        productIdIdx: index().on(table.productId),
        userIdx: index().on(table.user),
    })
);

export const productInteractionContractTable = onchainTable(
    "ProductInteractionContract",
    (t) => ({
        // todo: id become address
        id: t.hex().primaryKey(),

        productId: t.bigint().notNull(),
        referralTree: t.hex().notNull(),

        lastUpdateBlock: t.bigint().notNull(),

        createdTimestamp: t.bigint().notNull(),
        lastUpdateTimestamp: t.bigint().notNull(),
        removedTimestamp: t.bigint(),
    }),
    (table) => ({
        productIdIdx: index().on(table.productId),
    })
);

/* -------------------------------------------------------------------------- */
/*                          Interaction related stuff                         */
/* -------------------------------------------------------------------------- */

export const interactionEventTypeEnum = onchainEnum("InteractionEventType", [
    // Referral type
    "REFERRED",
    "CREATE_REFERRAL_LINK",
    // Press type
    "OPEN_ARTICLE",
    "READ_ARTICLE",
    // Purchase type
    "PURCHASE_STARTED",
    "PURCHASE_COMPLETED",
    // Webshop type
    "WEBSHOP_OPENNED",
    // Retail type
    "CUSTOMER_MEETING",
]);

export const interactionEventTable = onchainTable(
    "InteractionEvent",
    (t) => ({
        id: t.varchar().primaryKey(),

        interactionId: t.hex().notNull(),
        user: t.hex().notNull(),
        type: interactionEventTypeEnum().notNull(),
        data: t.json(),

        timestamp: t.bigint().notNull(),
    }),
    (table) => ({
        interactionIdx: index().on(table.interactionId),
        userIdx: index().on(table.user),
        userInteractionIdx: index().on(table.user, table.interactionId),
    })
);

/* -------------------------------------------------------------------------- */
/*                           Campaign related stuff                           */
/* -------------------------------------------------------------------------- */

export const campaignTable = onchainTable(
    "Campaign",
    (t) => ({
        // todo: id become address
        id: t.hex().primaryKey(),

        type: t.varchar().notNull(),
        name: t.varchar().notNull(),
        version: t.varchar().notNull(),

        productId: t.bigint().notNull(),
        interactionContractId: t.hex().notNull(),
        attached: t.boolean().notNull(),

        lastUpdateBlock: t.bigint().notNull(),

        attachTimestamp: t.bigint().notNull(),
        detachTimestamp: t.bigint(),

        bankingContractId: t.hex(),
        isAuthorisedOnBanking: t.boolean().notNull(),
    }),
    (table) => ({
        productIdIdx: index().on(table.productId),
        interactionContractIdx: index().on(table.interactionContractId),
        bankingContractIdx: index().on(table.bankingContractId),
    })
);

export const referralCampaignStatsTable = onchainTable(
    "ReferralCampaignStats",
    (t) => ({
        campaignId: t.hex().primaryKey().notNull(),

        totalInteractions: t.bigint().notNull(),

        openInteractions: t.bigint().notNull(),
        readInteractions: t.bigint().notNull(),

        referredInteractions: t.bigint().notNull(),
        createReferredLinkInteractions: t.bigint().notNull(),

        purchaseStartedInteractions: t.bigint().notNull(),
        purchaseCompletedInteractions: t.bigint().notNull(),

        webshopOpenned: t.bigint().notNull(),

        customerMeetingInteractions: t.bigint().notNull(),

        totalRewards: t.bigint().notNull(),
    }),
    (table) => ({
        campaignIdx: index().on(table.campaignId),
    })
);

export const campaignCapResetTable = onchainTable(
    "CampaignCapReset",
    (t) => ({
        campaignId: t.hex().notNull(),
        timestamp: t.bigint().notNull(),
        previousTimestamp: t.bigint().notNull(),
        distributedAmount: t.bigint().notNull(),
    }),
    (table) => ({
        pk: primaryKey({
            columns: [table.campaignId, table.previousTimestamp],
        }),
        campaignIdx: index().on(table.campaignId),
    })
);
/* -------------------------------------------------------------------------- */
/*                            Rewards related stuff                           */
/* -------------------------------------------------------------------------- */

export const tokenTable = onchainTable("Token", (t) => ({
    // todo: id become address
    id: t.hex().primaryKey(),
    decimals: t.integer().notNull(),
    name: t.varchar().notNull(),
    symbol: t.varchar().notNull(),
}));
export const bankingContractTable = onchainTable(
    "BankingContract",
    (t) => ({
        // todo: id become address
        id: t.hex().primaryKey(),
        tokenId: t.hex().notNull(),
        productId: t.bigint().notNull(),
        totalDistributed: t.bigint().notNull(),
        totalClaimed: t.bigint().notNull(),
        isDistributing: t.boolean().notNull(),
    }),
    (table) => ({
        tokenIdIdx: index().on(table.tokenId),
        productIdIdx: index().on(table.productId),
    })
);
export const rewardTable = onchainTable(
    "Reward",
    (t) => ({
        contractId: t.hex().notNull(),
        user: t.hex().notNull(),
        pendingAmount: t.bigint().notNull(),
        totalReceived: t.bigint().notNull(),
        totalClaimed: t.bigint().notNull(),
    }),
    (table) => ({
        pk: primaryKey({ columns: [table.contractId, table.user] }),
        userIdx: index().on(table.user),
        contractIdx: index().on(table.contractId),
        userContractIdx: index().on(table.user, table.contractId),
    })
);
export const rewardAddedEventTable = onchainTable(
    "RewardAddedEvent",
    (t) => ({
        id: t.varchar().primaryKey(),
        contractId: t.hex().notNull(),
        user: t.hex().notNull(),
        emitter: t.hex().notNull(),
        amount: t.bigint().notNull(),
        txHash: t.hex().notNull(),
        timestamp: t.bigint().notNull(),
    }),
    (table) => ({
        userIdx: index().on(table.user),
        contractIdx: index().on(table.contractId),
        emitterIdx: index().on(table.emitter),
    })
);
export const rewardClaimedEventTable = onchainTable(
    "RewardClaimedEvent",
    (t) => ({
        id: t.varchar().primaryKey(),
        contractId: t.hex().notNull(),
        user: t.hex().notNull(),
        amount: t.bigint().notNull(),
        txHash: t.hex().notNull(),
        timestamp: t.bigint().notNull(),
    }),
    (table) => ({
        userIdx: index().on(table.user),
        contractIdx: index().on(table.contractId),
    })
);
