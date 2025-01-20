//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AffiliationFixedCampaign
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const affiliationFixedCampaignAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_config",
                internalType: "struct AffiliationFixedCampaignConfig",
                type: "tuple",
                components: [
                    { name: "name", internalType: "bytes32", type: "bytes32" },
                    {
                        name: "campaignBank",
                        internalType: "contract CampaignBank",
                        type: "address",
                    },
                    {
                        name: "capConfig",
                        internalType: "struct CapConfig",
                        type: "tuple",
                        components: [
                            {
                                name: "period",
                                internalType: "uint48",
                                type: "uint48",
                            },
                            {
                                name: "amount",
                                internalType: "uint208",
                                type: "uint208",
                            },
                        ],
                    },
                    {
                        name: "activationPeriod",
                        internalType: "struct ActivationPeriod",
                        type: "tuple",
                        components: [
                            {
                                name: "start",
                                internalType: "uint48",
                                type: "uint48",
                            },
                            {
                                name: "end",
                                internalType: "uint48",
                                type: "uint48",
                            },
                        ],
                    },
                    {
                        name: "chainingConfig",
                        internalType: "struct RewardChainingConfig",
                        type: "tuple",
                        components: [
                            {
                                name: "userPercent",
                                internalType: "uint256",
                                type: "uint256",
                            },
                            {
                                name: "deperditionPerLevel",
                                internalType: "uint256",
                                type: "uint256",
                            },
                        ],
                    },
                    {
                        name: "triggers",
                        internalType: "struct FixedAffiliationTriggerConfig[]",
                        type: "tuple[]",
                        components: [
                            {
                                name: "interactionType",
                                internalType: "InteractionType",
                                type: "bytes4",
                            },
                            {
                                name: "baseReward",
                                internalType: "uint256",
                                type: "uint256",
                            },
                            {
                                name: "maxCountPerUser",
                                internalType: "uint256",
                                type: "uint256",
                            },
                        ],
                    },
                ],
            },
            {
                name: "_referralRegistry",
                internalType: "contract ReferralRegistry",
                type: "address",
            },
            {
                name: "_productAdministratorRegistry",
                internalType: "contract ProductAdministratorRegistry",
                type: "address",
            },
            {
                name: "_interaction",
                internalType: "contract ProductInteractionDiamond",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "getConfig",
        outputs: [
            {
                name: "capConfig",
                internalType: "struct CapConfig",
                type: "tuple",
                components: [
                    { name: "period", internalType: "uint48", type: "uint48" },
                    {
                        name: "amount",
                        internalType: "uint208",
                        type: "uint208",
                    },
                ],
            },
            {
                name: "activationPeriod",
                internalType: "struct ActivationPeriod",
                type: "tuple",
                components: [
                    { name: "start", internalType: "uint48", type: "uint48" },
                    { name: "end", internalType: "uint48", type: "uint48" },
                ],
            },
            {
                name: "bank",
                internalType: "contract CampaignBank",
                type: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getLink",
        outputs: [
            { name: "productId", internalType: "uint256", type: "uint256" },
            {
                name: "interactionContract",
                internalType: "address",
                type: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getMetadata",
        outputs: [
            { name: "_type", internalType: "string", type: "string" },
            { name: "version", internalType: "string", type: "string" },
            { name: "name", internalType: "bytes32", type: "bytes32" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_data", internalType: "bytes", type: "bytes" }],
        name: "handleInteraction",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "isActive",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "isRunning",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_isRunning", internalType: "bool", type: "bool" }],
        name: "setRunningStatus",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_productType",
                internalType: "ProductTypes",
                type: "uint256",
            },
        ],
        name: "supportProductType",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "pure",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_newPeriod",
                internalType: "struct ActivationPeriod",
                type: "tuple",
                components: [
                    { name: "start", internalType: "uint48", type: "uint48" },
                    { name: "end", internalType: "uint48", type: "uint48" },
                ],
            },
        ],
        name: "updateActivationPeriod",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_config",
                internalType: "struct CapConfig",
                type: "tuple",
                components: [
                    { name: "period", internalType: "uint48", type: "uint48" },
                    {
                        name: "amount",
                        internalType: "uint208",
                        type: "uint208",
                    },
                ],
            },
        ],
        name: "updateCapConfig",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "previousTimestamp",
                internalType: "uint48",
                type: "uint48",
                indexed: false,
            },
            {
                name: "distributedAmount",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
        ],
        name: "DistributionCapReset",
    },
    { type: "error", inputs: [], name: "DistributionCapReached" },
    { type: "error", inputs: [], name: "InactiveCampaign" },
    { type: "error", inputs: [], name: "InvalidConfig" },
    { type: "error", inputs: [], name: "Reentrancy" },
    { type: "error", inputs: [], name: "Unauthorized" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AffiliationRangeCampaign
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const affiliationRangeCampaignAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_config",
                internalType: "struct AffiliationRangeCampaignConfig",
                type: "tuple",
                components: [
                    { name: "name", internalType: "bytes32", type: "bytes32" },
                    {
                        name: "campaignBank",
                        internalType: "contract CampaignBank",
                        type: "address",
                    },
                    {
                        name: "capConfig",
                        internalType: "struct CapConfig",
                        type: "tuple",
                        components: [
                            {
                                name: "period",
                                internalType: "uint48",
                                type: "uint48",
                            },
                            {
                                name: "amount",
                                internalType: "uint208",
                                type: "uint208",
                            },
                        ],
                    },
                    {
                        name: "activationPeriod",
                        internalType: "struct ActivationPeriod",
                        type: "tuple",
                        components: [
                            {
                                name: "start",
                                internalType: "uint48",
                                type: "uint48",
                            },
                            {
                                name: "end",
                                internalType: "uint48",
                                type: "uint48",
                            },
                        ],
                    },
                    {
                        name: "chainingConfig",
                        internalType: "struct RewardChainingConfig",
                        type: "tuple",
                        components: [
                            {
                                name: "userPercent",
                                internalType: "uint256",
                                type: "uint256",
                            },
                            {
                                name: "deperditionPerLevel",
                                internalType: "uint256",
                                type: "uint256",
                            },
                        ],
                    },
                    {
                        name: "triggers",
                        internalType: "struct RangeAffiliationTriggerConfig[]",
                        type: "tuple[]",
                        components: [
                            {
                                name: "interactionType",
                                internalType: "InteractionType",
                                type: "bytes4",
                            },
                            {
                                name: "maxCountPerUser",
                                internalType: "uint256",
                                type: "uint256",
                            },
                            {
                                name: "startReward",
                                internalType: "uint256",
                                type: "uint256",
                            },
                            {
                                name: "endReward",
                                internalType: "uint256",
                                type: "uint256",
                            },
                            {
                                name: "percentBeta",
                                internalType: "uint256",
                                type: "uint256",
                            },
                        ],
                    },
                ],
            },
            {
                name: "_referralRegistry",
                internalType: "contract ReferralRegistry",
                type: "address",
            },
            {
                name: "_productAdministratorRegistry",
                internalType: "contract ProductAdministratorRegistry",
                type: "address",
            },
            {
                name: "_interaction",
                internalType: "contract ProductInteractionDiamond",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "getConfig",
        outputs: [
            {
                name: "capConfig",
                internalType: "struct CapConfig",
                type: "tuple",
                components: [
                    { name: "period", internalType: "uint48", type: "uint48" },
                    {
                        name: "amount",
                        internalType: "uint208",
                        type: "uint208",
                    },
                ],
            },
            {
                name: "activationPeriod",
                internalType: "struct ActivationPeriod",
                type: "tuple",
                components: [
                    { name: "start", internalType: "uint48", type: "uint48" },
                    { name: "end", internalType: "uint48", type: "uint48" },
                ],
            },
            {
                name: "bank",
                internalType: "contract CampaignBank",
                type: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getLink",
        outputs: [
            { name: "productId", internalType: "uint256", type: "uint256" },
            {
                name: "interactionContract",
                internalType: "address",
                type: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getMetadata",
        outputs: [
            { name: "_type", internalType: "string", type: "string" },
            { name: "version", internalType: "string", type: "string" },
            { name: "name", internalType: "bytes32", type: "bytes32" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_data", internalType: "bytes", type: "bytes" }],
        name: "handleInteraction",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "isActive",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "isRunning",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_isRunning", internalType: "bool", type: "bool" }],
        name: "setRunningStatus",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_productType",
                internalType: "ProductTypes",
                type: "uint256",
            },
        ],
        name: "supportProductType",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "pure",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_newPeriod",
                internalType: "struct ActivationPeriod",
                type: "tuple",
                components: [
                    { name: "start", internalType: "uint48", type: "uint48" },
                    { name: "end", internalType: "uint48", type: "uint48" },
                ],
            },
        ],
        name: "updateActivationPeriod",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_config",
                internalType: "struct CapConfig",
                type: "tuple",
                components: [
                    { name: "period", internalType: "uint48", type: "uint48" },
                    {
                        name: "amount",
                        internalType: "uint208",
                        type: "uint208",
                    },
                ],
            },
        ],
        name: "updateCapConfig",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "previousTimestamp",
                internalType: "uint48",
                type: "uint48",
                indexed: false,
            },
            {
                name: "distributedAmount",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
        ],
        name: "DistributionCapReset",
    },
    { type: "error", inputs: [], name: "DistributionCapReached" },
    { type: "error", inputs: [], name: "InactiveCampaign" },
    { type: "error", inputs: [], name: "InvalidBetaValue" },
    { type: "error", inputs: [], name: "InvalidConfig" },
    { type: "error", inputs: [], name: "PointCalculationFailed" },
    { type: "error", inputs: [], name: "Reentrancy" },
    { type: "error", inputs: [], name: "Unauthorized" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CampaignBank
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const campaignBankAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_adminRegistry",
                internalType: "contract ProductAdministratorRegistry",
                type: "address",
            },
            { name: "_productId", internalType: "uint256", type: "uint256" },
            { name: "_token", internalType: "address", type: "address" },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_campaign", internalType: "address", type: "address" },
        ],
        name: "canDistributeToken",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getConfig",
        outputs: [
            { name: "productId", internalType: "uint256", type: "uint256" },
            { name: "token", internalType: "address", type: "address" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_user", internalType: "address", type: "address" }],
        name: "getPendingAmount",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getToken",
        outputs: [{ name: "", internalType: "address", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getTotalPending",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "_campaign", internalType: "address", type: "address" },
        ],
        name: "isCampaignAuthorised",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "isDistributionEnabled",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_user", internalType: "address", type: "address" }],
        name: "pullReward",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_rewards",
                internalType: "struct Reward[]",
                type: "tuple[]",
                components: [
                    { name: "user", internalType: "address", type: "address" },
                    {
                        name: "amount",
                        internalType: "uint256",
                        type: "uint256",
                    },
                ],
            },
        ],
        name: "pushRewards",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_campaign", internalType: "address", type: "address" },
            { name: "_isAllowed", internalType: "bool", type: "bool" },
        ],
        name: "updateCampaignAuthorisation",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "_state", internalType: "bool", type: "bool" }],
        name: "updateDistributionState",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "campaign",
                internalType: "address",
                type: "address",
                indexed: false,
            },
            {
                name: "isAllowed",
                internalType: "bool",
                type: "bool",
                indexed: false,
            },
        ],
        name: "CampaignAuthorisationUpdated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "isDistributing",
                internalType: "bool",
                type: "bool",
                indexed: false,
            },
        ],
        name: "DistributionStateUpdated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "user",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "emitter",
                internalType: "address",
                type: "address",
                indexed: false,
            },
            {
                name: "amount",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
        ],
        name: "RewardAdded",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "user",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "amount",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
        ],
        name: "RewardClaimed",
    },
    { type: "error", inputs: [], name: "BankIsStillOpen" },
    { type: "error", inputs: [], name: "BankIsntOpen" },
    { type: "error", inputs: [], name: "NotEnoughToken" },
    { type: "error", inputs: [], name: "Reentrancy" },
    { type: "error", inputs: [], name: "Unauthorized" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CampaignBankFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const campaignBankFactoryAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_adminRegistry",
                internalType: "contract ProductAdministratorRegistry",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_productId", internalType: "uint256", type: "uint256" },
            { name: "_token", internalType: "address", type: "address" },
        ],
        name: "deployCampaignBank",
        outputs: [
            {
                name: "campaignBank",
                internalType: "contract CampaignBank",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "campaignBank",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "CampaignBankCreated",
    },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CampaignFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const campaignFactoryAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_referralRegistry",
                internalType: "contract ReferralRegistry",
                type: "address",
            },
            {
                name: "_productAdministratorRegistry",
                internalType: "contract ProductAdministratorRegistry",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_interaction",
                internalType: "contract ProductInteractionDiamond",
                type: "address",
            },
            { name: "_identifier", internalType: "bytes4", type: "bytes4" },
            { name: "_initData", internalType: "bytes", type: "bytes" },
        ],
        name: "createCampaign",
        outputs: [{ name: "", internalType: "address", type: "address" }],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "campaign",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "CampaignCreated",
    },
    {
        type: "error",
        inputs: [
            { name: "identifier", internalType: "bytes4", type: "bytes4" },
        ],
        name: "UnknownCampaignType",
    },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// InteractionCampaign
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const interactionCampaignAbi = [
    {
        type: "function",
        inputs: [],
        name: "getLink",
        outputs: [
            { name: "productId", internalType: "uint256", type: "uint256" },
            {
                name: "interactionContract",
                internalType: "address",
                type: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getMetadata",
        outputs: [
            { name: "_type", internalType: "string", type: "string" },
            { name: "version", internalType: "string", type: "string" },
            { name: "name", internalType: "bytes32", type: "bytes32" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_data", internalType: "bytes", type: "bytes" }],
        name: "handleInteraction",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "isActive",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "isRunning",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_isRunning", internalType: "bool", type: "bool" }],
        name: "setRunningStatus",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_productType",
                internalType: "ProductTypes",
                type: "uint256",
            },
        ],
        name: "supportProductType",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    { type: "error", inputs: [], name: "InactiveCampaign" },
    { type: "error", inputs: [], name: "Reentrancy" },
    { type: "error", inputs: [], name: "Unauthorized" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ReferralCampaign
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const referralCampaignAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_config",
                internalType: "struct ReferralCampaignConfig",
                type: "tuple",
                components: [
                    { name: "name", internalType: "bytes32", type: "bytes32" },
                    {
                        name: "campaignBank",
                        internalType: "contract CampaignBank",
                        type: "address",
                    },
                    {
                        name: "triggers",
                        internalType: "struct ReferralCampaignTriggerConfig[]",
                        type: "tuple[]",
                        components: [
                            {
                                name: "interactionType",
                                internalType: "InteractionType",
                                type: "bytes4",
                            },
                            {
                                name: "baseReward",
                                internalType: "uint256",
                                type: "uint256",
                            },
                            {
                                name: "userPercent",
                                internalType: "uint256",
                                type: "uint256",
                            },
                            {
                                name: "deperditionPerLevel",
                                internalType: "uint256",
                                type: "uint256",
                            },
                            {
                                name: "maxCountPerUser",
                                internalType: "uint256",
                                type: "uint256",
                            },
                        ],
                    },
                    {
                        name: "capConfig",
                        internalType: "struct ReferralCampaign.CapConfig",
                        type: "tuple",
                        components: [
                            {
                                name: "period",
                                internalType: "uint48",
                                type: "uint48",
                            },
                            {
                                name: "amount",
                                internalType: "uint208",
                                type: "uint208",
                            },
                        ],
                    },
                    {
                        name: "activationPeriod",
                        internalType:
                            "struct ReferralCampaign.ActivationPeriod",
                        type: "tuple",
                        components: [
                            {
                                name: "start",
                                internalType: "uint48",
                                type: "uint48",
                            },
                            {
                                name: "end",
                                internalType: "uint48",
                                type: "uint48",
                            },
                        ],
                    },
                ],
            },
            {
                name: "_referralRegistry",
                internalType: "contract ReferralRegistry",
                type: "address",
            },
            {
                name: "_productAdministratorRegistry",
                internalType: "contract ProductAdministratorRegistry",
                type: "address",
            },
            {
                name: "_interaction",
                internalType: "contract ProductInteractionDiamond",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "getConfig",
        outputs: [
            {
                name: "capConfig",
                internalType: "struct ReferralCampaign.CapConfig",
                type: "tuple",
                components: [
                    { name: "period", internalType: "uint48", type: "uint48" },
                    {
                        name: "amount",
                        internalType: "uint208",
                        type: "uint208",
                    },
                ],
            },
            {
                name: "activationPeriod",
                internalType: "struct ReferralCampaign.ActivationPeriod",
                type: "tuple",
                components: [
                    { name: "start", internalType: "uint48", type: "uint48" },
                    { name: "end", internalType: "uint48", type: "uint48" },
                ],
            },
            {
                name: "bank",
                internalType: "contract CampaignBank",
                type: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getLink",
        outputs: [
            { name: "productId", internalType: "uint256", type: "uint256" },
            {
                name: "interactionContract",
                internalType: "address",
                type: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getMetadata",
        outputs: [
            { name: "_type", internalType: "string", type: "string" },
            { name: "version", internalType: "string", type: "string" },
            { name: "name", internalType: "bytes32", type: "bytes32" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_data", internalType: "bytes", type: "bytes" }],
        name: "handleInteraction",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "isActive",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "isRunning",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_isRunning", internalType: "bool", type: "bool" }],
        name: "setRunningStatus",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_productType",
                internalType: "ProductTypes",
                type: "uint256",
            },
        ],
        name: "supportProductType",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "pure",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_activationPeriod",
                internalType: "struct ReferralCampaign.ActivationPeriod",
                type: "tuple",
                components: [
                    { name: "start", internalType: "uint48", type: "uint48" },
                    { name: "end", internalType: "uint48", type: "uint48" },
                ],
            },
        ],
        name: "updateActivationPeriod",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_capConfig",
                internalType: "struct ReferralCampaign.CapConfig",
                type: "tuple",
                components: [
                    { name: "period", internalType: "uint48", type: "uint48" },
                    {
                        name: "amount",
                        internalType: "uint208",
                        type: "uint208",
                    },
                ],
            },
        ],
        name: "updateCapConfig",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "previousTimestamp",
                internalType: "uint48",
                type: "uint48",
                indexed: false,
            },
            {
                name: "distributedAmount",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
        ],
        name: "DistributionCapReset",
    },
    { type: "error", inputs: [], name: "DistributionCapReached" },
    { type: "error", inputs: [], name: "InactiveCampaign" },
    { type: "error", inputs: [], name: "InvalidConfig" },
    { type: "error", inputs: [], name: "Reentrancy" },
    { type: "error", inputs: [], name: "Unauthorized" },
] as const;
