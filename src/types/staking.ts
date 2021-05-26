export const ABI = [
    {
        inputs: [
            { internalType: 'address', name: 'tokenAddressA', type: 'address' },
            { internalType: 'address', name: 'tokenAddressB', type: 'address' },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'uint256', name: 'pairId', type: 'uint256' },
            { indexed: true, internalType: 'address', name: 'account', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'EmergencyUnstake',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
            { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'uint256', name: 'pairId', type: 'uint256' },
            { indexed: true, internalType: 'address', name: 'account', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'PairStaked',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'uint256', name: 'pairId', type: 'uint256' },
            { indexed: true, internalType: 'address', name: 'account', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'PairUnstaked',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }],
        name: 'RewardAdded',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'account', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'RewardClaimed',
        type: 'event',
    },
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'accountPendingReward',
        outputs: [{ internalType: 'uint256', name: 'pendingReward', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'accountRewardShares',
        outputs: [{ internalType: 'uint256', name: 'rewardShares', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256[]', name: 'tokenIdA', type: 'uint256[]' },
            { internalType: 'uint256[]', name: 'tokenIdB', type: 'uint256[]' },
            { internalType: 'bool[]', name: 'enabled', type: 'bool[]' },
        ],
        name: 'addPairs',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { inputs: [], name: 'addReward', outputs: [], stateMutability: 'payable', type: 'function' },
    {
        inputs: [
            { internalType: 'address', name: 'account', type: 'address' },
            { internalType: 'address', name: 'contractAddress', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: 'balance', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'account', type: 'address' },
            { internalType: 'address[]', name: 'contractAddresses', type: 'address[]' },
            { internalType: 'uint256[]', name: 'tokenIds', type: 'uint256[]' },
        ],
        name: 'balanceOfBatch',
        outputs: [{ internalType: 'uint256[]', name: 'batchBalances', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'claimReward',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'emergency',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'pairId', type: 'uint256' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'emergencyUnstake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256[]', name: 'pairIds', type: 'uint256[]' },
            { internalType: 'bool[]', name: 'enabled', type: 'bool[]' },
        ],
        name: 'enablePairs',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getAllPairs',
        outputs: [
            {
                components: [
                    { internalType: 'uint256', name: 'tokenIdA', type: 'uint256' },
                    { internalType: 'uint256', name: 'tokenIdB', type: 'uint256' },
                    { internalType: 'bool', name: 'enabled', type: 'bool' },
                ],
                internalType: 'struct RestrictedPairsMixin.PairInfo[]',
                name: 'results',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'pairId', type: 'uint256' }],
        name: 'isPairEnabled',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'maxPairs',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'nextPairId',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'numStakedPairs',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'uint256[]', name: '', type: 'uint256[]' },
            { internalType: 'uint256[]', name: '', type: 'uint256[]' },
            { internalType: 'bytes', name: '', type: 'bytes' },
        ],
        name: 'onERC1155BatchReceived',
        outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'bytes', name: '', type: 'bytes' },
        ],
        name: 'onERC1155Received',
        outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'pairs',
        outputs: [
            { internalType: 'uint256', name: 'tokenIdA', type: 'uint256' },
            { internalType: 'uint256', name: 'tokenIdB', type: 'uint256' },
            { internalType: 'bool', name: 'enabled', type: 'bool' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'bool', name: 'value', type: 'bool' }],
        name: 'setEmergency',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
        name: 'setMaxPairs',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'pairId', type: 'uint256' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'stake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'tokenA',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'tokenB',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalShares',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'pairId', type: 'uint256' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'unstake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'withdrawUnclaimed',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
]