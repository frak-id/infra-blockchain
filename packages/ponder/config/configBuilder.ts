import { createConfig, mergeAbis } from "ponder";
import { factory } from "ponder";
import { type Address, parseAbiItem } from "viem";
import { arbitrum } from "viem/chains";
import * as deployedAddresses from "../abis/addresses.json";
import {
    affiliationFixedCampaignAbi,
    affiliationRangeCampaignAbi,
    campaignBankAbi,
    campaignBankFactoryAbi,
    campaignFactoryAbi,
    interactionCampaignAbi,
    referralCampaignAbi,
} from "../abis/campaignAbis";
import {
    dappInteractionFacetAbi,
    pressInteractionFacetAbi,
    productInteractionDiamondAbi,
    productInteractionManagerAbi,
    purchaseFeatureFacetAbi,
    referralFeatureFacetAbi,
    retailInteractionFacetAbi,
    webShopInteractionFacetAbi,
} from "../abis/interactionAbis";
import {
    productAdministratorRegistryAbi,
    productRegistryAbi,
} from "../abis/registryAbis";

type EvmChainConfig = {
    chainId: number;
    deploymentBlock?: number;
};

/**
 * Set of old factory addresses we wan't to continue to index
 */
const oldAddresses = {
    campaignFactoy: [
        "0x0000000000278e0EFbC5968020A798AaB1571E5c",
        "0x3401B830b4C6805Dc192906679514e849aFeda41",
    ],
} as const;

/**
 * Create a env gated config
 */
export function createEnvConfig<ChainKey extends string>({
    chain,
    chainKey,
    pollingInterval,
    maxRequestsPerSecond,
}: {
    chain: EvmChainConfig;
    chainKey: ChainKey;
    pollingInterval?: number;
    maxRequestsPerSecond?: number;
}) {
    const contractChainConfig = {
        [chainKey]: {
            startBlock: chain.deploymentBlock,
        },
    } as const;

    return createConfig({
        // db config
        database: process.env.PONDER_DATABASE_URL
            ? {
                  kind: "postgres",
                  connectionString: process.env.PONDER_DATABASE_URL,
              }
            : {
                  kind: "pglite",
              },
        // chains config
        chains: {
            [chainKey]: {
                id: chain.chainId,
                rpc: getTransportUrl(chain.chainId),
                // Polling interval to 60sec by default
                pollingInterval: pollingInterval ?? 60_000,
                // Max request per second
                maxRequestsPerSecond,
                // Max block range
                ethGetLogsBlockRange: 10_000,
            },
        },
        // contracts config
        contracts: {
            // The product registry
            ProductRegistry: {
                abi: productRegistryAbi,
                address: deployedAddresses.productRegistry as Address,
                chain: contractChainConfig,
            },
            // The product registry
            ProductAdministratorRegistry: {
                abi: productAdministratorRegistryAbi,
                address:
                    deployedAddresses.productAdministratorRegistry as Address,
                chain: contractChainConfig,
            },
            // The interaction manager
            ProductInteractionManager: {
                abi: productInteractionManagerAbi,
                address: deployedAddresses.productInteractionManager as Address,
                chain: contractChainConfig,
            },
            // Every product interactions
            ProductInteraction: {
                abi: mergeAbis([
                    productInteractionDiamondAbi,
                    // Each facets
                    pressInteractionFacetAbi,
                    retailInteractionFacetAbi,
                    dappInteractionFacetAbi,
                    webShopInteractionFacetAbi,
                    referralFeatureFacetAbi,
                    purchaseFeatureFacetAbi,
                ]),
                address: factory({
                    address:
                        deployedAddresses.productInteractionManager as Address,
                    event: parseAbiItem(
                        "event InteractionContractDeployed(uint256 indexed productId, address interactionContract)"
                    ),
                    parameter: "interactionContract",
                }),
                chain: contractChainConfig,
            },
            // The campaign factory
            CampaignsFactory: {
                abi: campaignFactoryAbi,
                address: [
                    deployedAddresses.campaignFactory as Address,
                    ...oldAddresses.campaignFactoy,
                ],
                chain: contractChainConfig,
            },
            // Every campaigns
            Campaigns: {
                abi: mergeAbis([
                    interactionCampaignAbi,
                    referralCampaignAbi,
                    affiliationFixedCampaignAbi,
                    affiliationRangeCampaignAbi,
                ]),
                address: factory({
                    address: [
                        deployedAddresses.campaignFactory as Address,
                        ...oldAddresses.campaignFactoy,
                    ],
                    event: parseAbiItem(
                        "event CampaignCreated(address campaign)"
                    ),
                    parameter: "campaign",
                }),
                chain: contractChainConfig,
            },
            // The campaign banks factory
            CampaignBanksFactory: {
                abi: campaignBankFactoryAbi,
                address: deployedAddresses.campaignBankFactory as Address,
                chain: contractChainConfig,
            },
            // Every campaign banks
            CampaignBanks: {
                abi: campaignBankAbi,
                address: factory({
                    address: deployedAddresses.campaignBankFactory as Address,
                    event: parseAbiItem(
                        "event CampaignBankCreated(address campaignBank)"
                    ),
                    parameter: "campaignBank",
                }),
                chain: contractChainConfig,
            },
        },
    });
}

/**
 * Get an transport for the given chain id
 * @param chainId
 * @returns
 */
function getTransportUrl(chainId: number) {
    // Get our erpc instance transport
    const erpcInternalUrl = process.env.INTERNAL_RPC_URL;
    if (!erpcInternalUrl) {
        throw new Error("Missing erpc environment variable");
    }

    // Get the erpc url
    const erpcUrl = `${erpcInternalUrl}/${chainId}?token=${process.env.PONDER_RPC_SECRET}`;
    const urls = [erpcUrl];

    // Add envio rpc url
    if (process.env.ENVIO_API_KEY)
        urls.push(
            `https://${chainId}.rpc.hypersync.xyz/${process.env.ENVIO_API_KEY}`
        );

    // If chain === arbitrum (prod), also add alchemy and blockpi
    if (chainId === arbitrum.id) {
        if (process.env.BLOCKPI_API_KEY_ARB)
            urls.push(
                `https://arbitrum.blockpi.network/v1/rpc/${process.env.BLOCKPI_API_KEY_ARB}`
            );
    }

    return urls;
}
