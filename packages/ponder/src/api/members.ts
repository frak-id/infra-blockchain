import { db } from "ponder:api";
import {
    interactionEventTable,
    productAdministratorTable,
    productInteractionContractTable,
    productTable,
    rewardTable,
} from "ponder:schema";
import {
    and,
    asc,
    between,
    count,
    desc,
    eq,
    gte,
    inArray,
    lte,
    min,
    sql,
    sum,
} from "ponder";
import { type Address, type Hex, isAddress } from "viem";
import app from ".";

/**
 * Params for the members fetching
 */
type GetMembersParams = {
    // Indicating if we only want the total count
    noData?: boolean;
    // Indicating if we only want user address
    onlyAddress?: boolean;
    // Some filters to apply to the query
    filter?: {
        productIds?: Hex[];
        interactions?: {
            min?: number;
            max?: number;
        };
        rewards?: {
            min?: Hex;
            max?: Hex;
        };
        firstInteractionTimestamp?: {
            min?: number;
            max?: number;
        };
    };
    // Some sorting options to apply
    sort?: {
        by:
            | "user"
            | "totalInteractions"
            | "rewards"
            | "firstInteractionTimestamp";
        order: "asc" | "desc";
    };
    // Pagination options
    limit?: number;
    offset?: number;
};

/**
 * Get all the members for a product admin
 *  todo: The POST request here is mapped to a PUT hono handler --'
 */
app.post("/members/:productAdmin", async ({ req, json }) => {
    // Extract wallet
    const wallet = req.param("productAdmin") as Address;
    if (!isAddress(wallet)) {
        return json("Invalid productAdmin address", 400);
    }

    // Get the request params
    const { filter, sort, limit, offset, noData, onlyAddress } =
        await req.json<GetMembersParams>();

    // Perform the sql query
    const productIds = await db
        .select({
            id: productAdministratorTable.productId,
            name: productTable.name,
        })
        .from(productAdministratorTable)
        .innerJoin(
            productTable,
            eq(productAdministratorTable.productId, productTable.id)
        )
        .where(eq(productAdministratorTable.user, wallet));

    // If no product found, early exit
    if (!productIds.length) {
        return json({ totalResult: 0, members: [], users: [] });
    }

    const { whereClauses, havingClauses } = getFilterClauses({
        filter,
    });

    // Append a clause to filter only the products for this admin
    whereClauses.push(
        inArray(
            productInteractionContractTable.productId,
            productIds.map((p) => BigInt(p.id))
        )
    );

    // Then get all the members for the given products id, we want the total interactions for each users who have interacted with the product
    // Relation is as follow: InteractionEvent (user, interactionId) -> ProductInteractionContract (productId)
    // We want to get the total interactions for each user
    const membersQuery = db
        .select({
            user: interactionEventTable.user,
            totalInteractions: count(interactionEventTable.id),
            rewards: sql<bigint>`coalesce(sum(${rewardTable.totalReceived}), 0)`,
            productIds: sql<
                string[]
            >`array_agg(distinct ${productInteractionContractTable.productId}::text)`,
            firstInteractionTimestamp: min(interactionEventTable.timestamp),
        })
        .from(interactionEventTable)
        .innerJoin(
            productInteractionContractTable,
            eq(
                interactionEventTable.interactionId,
                productInteractionContractTable.id
            )
        )
        .leftJoin(rewardTable, eq(rewardTable.user, interactionEventTable.user))
        .where(
            whereClauses.length === 1 ? whereClauses[0] : and(...whereClauses)
        )
        .having(
            havingClauses.length === 0
                ? undefined
                : havingClauses.length === 1
                  ? havingClauses[0]
                  : and(...havingClauses)
        )
        .groupBy(interactionEventTable.user);

    // Get the total results count
    const membersSubQuery = membersQuery.as("members");
    const totalResult = await db
        .select({ count: count() })
        .from(membersSubQuery);

    // If we don't want the data, we can return the total count
    if (noData) {
        return json({ totalResult: totalResult?.[0]?.count });
    }

    // Apply the limit and offset
    if (limit) {
        membersQuery.limit(limit);
    }
    if (offset) {
        membersQuery.offset(offset);
    }

    // Apply the order
    if (sort) {
        const sortFieldMap = {
            user: interactionEventTable.user,
            totalInteractions: count(interactionEventTable.id),
            rewards: sql<bigint>`coalesce(sum(${rewardTable.totalReceived}), 0)`,
            firstInteractionTimestamp: min(interactionEventTable.timestamp),
        };
        const orderByField = sortFieldMap[sort.by as keyof typeof sortFieldMap];
        if (!orderByField) {
            return json("Invalid sort field", 400);
        }
        membersQuery.orderBy(
            sort.order === "asc" ? asc(orderByField) : desc(orderByField)
        );
    }

    // If we only want the address, we early exit now
    if (onlyAddress) {
        const members = await db
            .select({ user: membersSubQuery.user })
            .from(membersSubQuery);
        return json({
            totalResult: totalResult?.[0]?.count,
            users: members.map((m) => m.user),
        });
    }

    const members = await membersQuery;

    // Add product names + format rewards cleanly
    const membersWithPName = members.map((member) => {
        const productNames = productIds
            .filter((p) => member.productIds.includes(p.id.toString()))
            .map((p) => p.name);
        return { ...member, productNames };
    });

    return json({
        totalResult: totalResult?.[0]?.count,
        members: membersWithPName,
    });
});

/**
 * Get all the filter clauses
 */
function getFilterClauses({ filter }: { filter: GetMembersParams["filter"] }) {
    // Build our where and having clauses depending on the filters
    const whereClauses = [];
    const havingClauses = [];

    if (filter?.productIds) {
        whereClauses.push(
            inArray(
                productInteractionContractTable.productId,
                filter.productIds.map((p) => BigInt(p))
            )
        );
    }

    if (filter?.interactions) {
        const clause = buildRangeClause({
            field: count(interactionEventTable.id),
            ...filter.interactions,
        });
        if (clause) {
            havingClauses.push(clause);
        }
    }
    if (filter?.rewards) {
        const bigintRewards = {
            min: filter.rewards.min ? BigInt(filter.rewards.min) : undefined,
            max: filter.rewards.max ? BigInt(filter.rewards.max) : undefined,
        };
        const clause = buildRangeClause({
            field: sum(rewardTable.totalReceived),
            ...bigintRewards,
        });
        if (clause) {
            havingClauses.push(clause);
        }
    }
    if (filter?.firstInteractionTimestamp) {
        const clause = buildRangeClause({
            field: min(interactionEventTable.timestamp),
            ...filter.firstInteractionTimestamp,
        });
        if (clause) {
            havingClauses.push(clause);
        }
    }

    return { whereClauses, havingClauses };
}

/**
 * The potential columns that can be used for the range clause
 */
type RangeClauseColumn =
    | ReturnType<typeof count>
    | ReturnType<typeof sum>
    | ReturnType<typeof min<typeof interactionEventTable.timestamp>>;

/**
 * Build a range clause
 */
function buildRangeClause({
    field,
    min,
    max,
}: {
    field: RangeClauseColumn;
    min?: number | bigint;
    max?: number | bigint;
}) {
    if (min && max) {
        return between(field, min, max);
    }
    if (min) {
        return gte(field, min);
    }
    if (max) {
        return lte(field, max);
    }

    return undefined;
}
