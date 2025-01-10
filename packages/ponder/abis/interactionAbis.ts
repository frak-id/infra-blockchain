//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DappInteractionFacet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const dappInteractionFacetAbi = [
    { type: "constructor", inputs: [], stateMutability: "nonpayable" },
    { type: "fallback", stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [],
        name: "cancelOwnershipHandover",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "pendingOwner", internalType: "address", type: "address" },
        ],
        name: "completeOwnershipHandover",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [{ name: "id", internalType: "bytes4", type: "bytes4" }],
        name: "deleteProductContract",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "grantRoles",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "hasAllRoles",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "hasAnyRole",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "owner",
        outputs: [{ name: "result", internalType: "address", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "pendingOwner", internalType: "address", type: "address" },
        ],
        name: "ownershipHandoverExpiresAt",
        outputs: [{ name: "result", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "productTypeDenominator",
        outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
        stateMutability: "pure",
    },
    {
        type: "function",
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [{ name: "roles", internalType: "uint256", type: "uint256" }],
        name: "renounceRoles",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [],
        name: "requestOwnershipHandover",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "revokeRoles",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [{ name: "user", internalType: "address", type: "address" }],
        name: "rolesOf",
        outputs: [{ name: "roles", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_contractAddress",
                internalType: "address",
                type: "address",
            },
            {
                name: "_storageCheckSelector",
                internalType: "bytes4",
                type: "bytes4",
            },
        ],
        name: "setProductContract",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "newOwner", internalType: "address", type: "address" },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "smartContract",
                internalType: "address",
                type: "address",
                indexed: false,
            },
            {
                name: "value",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
        ],
        name: "CallableStorageUpdated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "id",
                internalType: "bytes4",
                type: "bytes4",
                indexed: true,
            },
            {
                name: "contractAddress",
                internalType: "address",
                type: "address",
                indexed: false,
            },
            {
                name: "fnSelector",
                internalType: "bytes4",
                type: "bytes4",
                indexed: false,
            },
        ],
        name: "ContractRegistered",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "id",
                internalType: "bytes4",
                type: "bytes4",
                indexed: true,
            },
        ],
        name: "ContractUnRegistered",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "pendingOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "OwnershipHandoverCanceled",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "pendingOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "OwnershipHandoverRequested",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "oldOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "newOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "OwnershipTransferred",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "smartContract",
                internalType: "address",
                type: "address",
                indexed: false,
            },
            {
                name: "slot",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
            {
                name: "value",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
        ],
        name: "ProofStorageUpdated",
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
                name: "roles",
                internalType: "uint256",
                type: "uint256",
                indexed: true,
            },
        ],
        name: "RolesUpdated",
    },
    { type: "error", inputs: [], name: "AlreadyInitialized" },
    { type: "error", inputs: [], name: "CallFailed" },
    { type: "error", inputs: [], name: "CallVerificationFailed" },
    {
        type: "error",
        inputs: [{ name: "index", internalType: "uint256", type: "uint256" }],
        name: "InvalidProof",
    },
    { type: "error", inputs: [], name: "NewOwnerIsZeroAddress" },
    { type: "error", inputs: [], name: "NoHandoverRequest" },
    { type: "error", inputs: [], name: "Unauthorized" },
    { type: "error", inputs: [], name: "UnknownContract" },
    { type: "error", inputs: [], name: "UnknownInteraction" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PressInteractionFacet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pressInteractionFacetAbi = [
    { type: "fallback", stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [],
        name: "productTypeDenominator",
        outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
        stateMutability: "pure",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "articleId",
                internalType: "bytes32",
                type: "bytes32",
                indexed: false,
            },
            {
                name: "user",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "ArticleOpened",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "articleId",
                internalType: "bytes32",
                type: "bytes32",
                indexed: false,
            },
            {
                name: "user",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "ArticleRead",
    },
    { type: "error", inputs: [], name: "UnknownInteraction" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ProductInteractionDiamond
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const productInteractionDiamondAbi = [
    {
        type: "constructor",
        inputs: [
            { name: "_productId", internalType: "uint256", type: "uint256" },
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
                name: "_interactionManager",
                internalType: "address",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_campaign",
                internalType: "contract InteractionCampaign",
                type: "address",
            },
        ],
        name: "attachCampaign",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "cancelOwnershipHandover",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "pendingOwner", internalType: "address", type: "address" },
        ],
        name: "completeOwnershipHandover",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_productTypeDenominator",
                internalType: "uint8",
                type: "uint8",
            },
            { name: "_call", internalType: "bytes", type: "bytes" },
        ],
        name: "delegateToFacet",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_productTypes",
                internalType: "ProductTypes",
                type: "uint256",
            },
        ],
        name: "deleteFacets",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_campaigns",
                internalType: "contract InteractionCampaign[]",
                type: "address[]",
            },
        ],
        name: "detachCampaigns",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "eip712Domain",
        outputs: [
            { name: "fields", internalType: "bytes1", type: "bytes1" },
            { name: "name", internalType: "string", type: "string" },
            { name: "version", internalType: "string", type: "string" },
            { name: "chainId", internalType: "uint256", type: "uint256" },
            {
                name: "verifyingContract",
                internalType: "address",
                type: "address",
            },
            { name: "salt", internalType: "bytes32", type: "bytes32" },
            {
                name: "extensions",
                internalType: "uint256[]",
                type: "uint256[]",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getCampaigns",
        outputs: [
            {
                name: "",
                internalType: "contract InteractionCampaign[]",
                type: "address[]",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getDomainSeparator",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "_denominator", internalType: "uint8", type: "uint8" },
        ],
        name: "getFacet",
        outputs: [
            {
                name: "",
                internalType: "contract IInteractionFacet",
                type: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getProductId",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getReferralTree",
        outputs: [{ name: "tree", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "grantRoles",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "_interaction", internalType: "bytes", type: "bytes" },
            { name: "_signature", internalType: "bytes", type: "bytes" },
        ],
        name: "handleInteraction",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "hasAllRoles",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "hasAnyRole",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "owner",
        outputs: [{ name: "result", internalType: "address", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "pendingOwner", internalType: "address", type: "address" },
        ],
        name: "ownershipHandoverExpiresAt",
        outputs: [{ name: "result", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [{ name: "roles", internalType: "uint256", type: "uint256" }],
        name: "renounceRoles",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [],
        name: "requestOwnershipHandover",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "revokeRoles",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [{ name: "user", internalType: "address", type: "address" }],
        name: "rolesOf",
        outputs: [{ name: "roles", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            {
                name: "facets",
                internalType: "contract IInteractionFacet[]",
                type: "address[]",
            },
        ],
        name: "setFacets",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "newOwner", internalType: "address", type: "address" },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "campaign",
                internalType: "contract InteractionCampaign",
                type: "address",
                indexed: false,
            },
        ],
        name: "CampaignAttached",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "campaign",
                internalType: "contract InteractionCampaign",
                type: "address",
                indexed: false,
            },
        ],
        name: "CampaignDetached",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "version",
                internalType: "uint64",
                type: "uint64",
                indexed: false,
            },
        ],
        name: "Initialized",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "pendingOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "OwnershipHandoverCanceled",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "pendingOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "OwnershipHandoverRequested",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "oldOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "newOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "OwnershipTransferred",
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
                name: "roles",
                internalType: "uint256",
                type: "uint256",
                indexed: true,
            },
        ],
        name: "RolesUpdated",
    },
    { type: "error", inputs: [], name: "AlreadyInitialized" },
    { type: "error", inputs: [], name: "CampaignAlreadyPresent" },
    { type: "error", inputs: [], name: "InteractionHandlingFailed" },
    { type: "error", inputs: [], name: "InvalidInitialization" },
    { type: "error", inputs: [], name: "NewOwnerIsZeroAddress" },
    { type: "error", inputs: [], name: "NoHandoverRequest" },
    { type: "error", inputs: [], name: "NotInitializing" },
    { type: "error", inputs: [], name: "UnandledProductType" },
    { type: "error", inputs: [], name: "Unauthorized" },
    { type: "error", inputs: [], name: "WrongInteractionSigner" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ProductInteractionManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const productInteractionManagerAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_productRegistry",
                internalType: "contract ProductRegistry",
                type: "address",
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
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "cancelOwnershipHandover",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "pendingOwner", internalType: "address", type: "address" },
        ],
        name: "completeOwnershipHandover",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "_productId", internalType: "uint256", type: "uint256" },
        ],
        name: "deleteInteractionContract",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_productId", internalType: "uint256", type: "uint256" },
            {
                name: "_campaignIdentifier",
                internalType: "bytes4",
                type: "bytes4",
            },
            { name: "_initData", internalType: "bytes", type: "bytes" },
        ],
        name: "deployCampaign",
        outputs: [
            { name: "campaign", internalType: "address", type: "address" },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_productId", internalType: "uint256", type: "uint256" },
        ],
        name: "deployInteractionContract",
        outputs: [
            {
                name: "diamond",
                internalType: "contract ProductInteractionDiamond",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_productId", internalType: "uint256", type: "uint256" },
            { name: "_salt", internalType: "bytes32", type: "bytes32" },
        ],
        name: "deployInteractionContract",
        outputs: [
            {
                name: "diamond",
                internalType: "contract ProductInteractionDiamond",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_productId", internalType: "uint256", type: "uint256" },
            {
                name: "_campaigns",
                internalType: "contract InteractionCampaign[]",
                type: "address[]",
            },
        ],
        name: "detachCampaigns",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_productId", internalType: "uint256", type: "uint256" },
        ],
        name: "getInteractionContract",
        outputs: [
            {
                name: "interactionContract",
                internalType: "contract ProductInteractionDiamond",
                type: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "grantRoles",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "hasAllRoles",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "hasAnyRole",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "_owner", internalType: "address", type: "address" },
            {
                name: "_facetsFactory",
                internalType: "contract IFacetsFactory",
                type: "address",
            },
            {
                name: "_campaignFactory",
                internalType: "contract ICampaignFactory",
                type: "address",
            },
        ],
        name: "init",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "owner",
        outputs: [{ name: "result", internalType: "address", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "pendingOwner", internalType: "address", type: "address" },
        ],
        name: "ownershipHandoverExpiresAt",
        outputs: [{ name: "result", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "proxiableUUID",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [{ name: "roles", internalType: "uint256", type: "uint256" }],
        name: "renounceRoles",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [],
        name: "requestOwnershipHandover",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            { name: "user", internalType: "address", type: "address" },
            { name: "roles", internalType: "uint256", type: "uint256" },
        ],
        name: "revokeRoles",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [{ name: "user", internalType: "address", type: "address" }],
        name: "rolesOf",
        outputs: [{ name: "roles", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "newOwner", internalType: "address", type: "address" },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_campaignFactory",
                internalType: "contract ICampaignFactory",
                type: "address",
            },
        ],
        name: "updateCampaignFactory",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "_facetsFactory",
                internalType: "contract IFacetsFactory",
                type: "address",
            },
        ],
        name: "updateFacetsFactory",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_productId", internalType: "uint256", type: "uint256" },
        ],
        name: "updateInteractionContract",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "newImplementation",
                internalType: "address",
                type: "address",
            },
            { name: "data", internalType: "bytes", type: "bytes" },
        ],
        name: "upgradeToAndCall",
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "version",
                internalType: "uint64",
                type: "uint64",
                indexed: false,
            },
        ],
        name: "Initialized",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "productId",
                internalType: "uint256",
                type: "uint256",
                indexed: true,
            },
            {
                name: "interactionContract",
                internalType: "contract ProductInteractionDiamond",
                type: "address",
                indexed: false,
            },
        ],
        name: "InteractionContractDeleted",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "productId",
                internalType: "uint256",
                type: "uint256",
                indexed: true,
            },
            {
                name: "interactionContract",
                internalType: "contract ProductInteractionDiamond",
                type: "address",
                indexed: false,
            },
        ],
        name: "InteractionContractDeployed",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "productId",
                internalType: "uint256",
                type: "uint256",
                indexed: true,
            },
            {
                name: "interactionContract",
                internalType: "contract ProductInteractionDiamond",
                type: "address",
                indexed: false,
            },
        ],
        name: "InteractionContractUpdated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "pendingOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "OwnershipHandoverCanceled",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "pendingOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "OwnershipHandoverRequested",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "oldOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
            {
                name: "newOwner",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "OwnershipTransferred",
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
                name: "roles",
                internalType: "uint256",
                type: "uint256",
                indexed: true,
            },
        ],
        name: "RolesUpdated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "implementation",
                internalType: "address",
                type: "address",
                indexed: true,
            },
        ],
        name: "Upgraded",
    },
    { type: "error", inputs: [], name: "AlreadyInitialized" },
    { type: "error", inputs: [], name: "CantHandleProductTypes" },
    { type: "error", inputs: [], name: "InteractionContractAlreadyDeployed" },
    { type: "error", inputs: [], name: "InvalidInitialization" },
    { type: "error", inputs: [], name: "NewOwnerIsZeroAddress" },
    { type: "error", inputs: [], name: "NoHandoverRequest" },
    { type: "error", inputs: [], name: "NoInteractionContractFound" },
    { type: "error", inputs: [], name: "NotInitializing" },
    { type: "error", inputs: [], name: "Unauthorized" },
    { type: "error", inputs: [], name: "UnauthorizedCallContext" },
    { type: "error", inputs: [], name: "UpgradeFailed" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PurchaseFeatureFacet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const purchaseFeatureFacetAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_purchaseOracle",
                internalType: "contract IPurchaseOracle",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    { type: "fallback", stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [],
        name: "productTypeDenominator",
        outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
        stateMutability: "pure",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "purchaseId",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
            {
                name: "user",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "PurchaseCompleted",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "purchaseId",
                internalType: "uint256",
                type: "uint256",
                indexed: false,
            },
            {
                name: "user",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "PurchaseStarted",
    },
    { type: "error", inputs: [], name: "PurchaseAlreadyProcessed" },
    { type: "error", inputs: [], name: "PurchaseNotCompleted" },
    { type: "error", inputs: [], name: "UnknownInteraction" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ReferralFeatureFacet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const referralFeatureFacetAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_referralRegistry",
                internalType: "contract ReferralRegistry",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    { type: "fallback", stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [],
        name: "productTypeDenominator",
        outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
        stateMutability: "pure",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "user",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "ReferralLinkCreation",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "user",
                internalType: "address",
                type: "address",
                indexed: false,
            },
            {
                name: "referrer",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "UserReferred",
    },
    { type: "error", inputs: [], name: "InvalidReferrer" },
    { type: "error", inputs: [], name: "UnknownInteraction" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RetailInteractionFacet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const retailInteractionFacetAbi = [
    { type: "fallback", stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [],
        name: "productTypeDenominator",
        outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
        stateMutability: "pure",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "agencyId",
                internalType: "bytes32",
                type: "bytes32",
                indexed: false,
            },
            {
                name: "user",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "CustomerMeeting",
    },
    { type: "error", inputs: [], name: "UnknownInteraction" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WebShopInteractionFacet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const webShopInteractionFacetAbi = [
    { type: "fallback", stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [],
        name: "productTypeDenominator",
        outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
        stateMutability: "pure",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            {
                name: "user",
                internalType: "address",
                type: "address",
                indexed: false,
            },
        ],
        name: "WebShopOpenned",
    },
    { type: "error", inputs: [], name: "UnknownInteraction" },
] as const;
