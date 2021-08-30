import { constants, BigNumber } from 'ethers'
import { fill, last } from 'lodash'
import { contractAddressForRelease, deployBlockForRelease, getTokenContractByAddress } from '../utils'
import { EthCallOptions, Release } from '../types'


const MAX_BLOCKS_PER_QUERY = 100_000

/**
 * Returns all addresses who have ever received the given token.  This does not mean
 * they are still in possession of the token, so callers should use a balanaceOf
 * query to validate this!
 * 
 * If no token is passed in, this will assume all tokens for the release.
 *
 * @param contractAddress
 * @param tokenId
 */
export async function getAllRecipients(
    release: Release,
    tokenId?: string,
    blockNumber?: number,
): Promise<string[]> {
    const contractAddress = contractAddressForRelease(release)
    const contract = await getTokenContractByAddress(contractAddress)
    const deployBlock = deployBlockForRelease(release)
    if (!blockNumber) {
        blockNumber = await contract.provider.getBlockNumber()
    }

    const tokenIdBn = BigNumber.from(tokenId ? tokenId : 0)
    
    const addresses = new Set<string>()

    const singleFilter = contract.filters.TransferSingle(null, null, null, null, null)
    const batchFilter = contract.filters.TransferBatch(null, null, null, null, null)

    let startBlock = deployBlock

    while (startBlock < blockNumber) {

        const endBlock = Math.min(startBlock + MAX_BLOCKS_PER_QUERY, blockNumber)
        const singleEvents = await contract.queryFilter(singleFilter, startBlock, endBlock)

        for (const event of singleEvents) {
            const { to, id, value } = event.args

            if (to !== constants.AddressZero && value.gt(0)) {
                if (tokenIdBn.eq(0) || tokenIdBn.eq(id)) {
                    addresses.add(to)
                }
            }
        }

        const batchEvents = await contract.queryFilter(batchFilter, startBlock, endBlock)

        for (const event of batchEvents) {
            const { to, ids } = event.args
            const idsAsStrings = ids.map(id => id.toString())
            
            if (to !== constants.AddressZero) {
                if (tokenIdBn.eq(0) || idsAsStrings.includes(tokenIdBn.toString())) {
                    addresses.add(to)
                }
            }
        }
        startBlock += MAX_BLOCKS_PER_QUERY
    }

    return Array.from(addresses)
}

/**
 * Returns the current token balance for the given addresses.
 *
 * @param contractAddress
 * @param tokenId
 * @param address
 * @param blockTag
 */
export async function getTokenBalances(
    contractAddress: string,
    tokenId: string,
    addresses: string[],
    options?: EthCallOptions
) {
    const contract = await getTokenContractByAddress(contractAddress)

    const tokenIdArray = fill(Array(addresses.length), tokenId)

    const response = await contract.balanceOfBatch(addresses, tokenIdArray, options || {})
    return response
}


export interface RoyaltyOptions {
    address: string | undefined
    originalId: string | undefined
}

export interface RoyaltiesPaid {
    address: string
    originalId: string
    amountInWei: BigNumber
}

export async function getRoyalties(
    contractAddress: string,
    deployBlock: number,
    blockNumber: number,
    royaltyOptions?: RoyaltyOptions,
) {
    const contract = await getTokenContractByAddress(contractAddress)

    let royaltyRecipient: string | null = null;
    if (royaltyOptions?.address) {
        royaltyRecipient = royaltyOptions!.address
    }

    const filter = contract.filters.PrintMinted(null, null, null, null, null, null, null, null, null, royaltyRecipient)
    const events = await contract.queryFilter(filter, deployBlock, blockNumber)

    // address -> (tokenId -> amount)
    const royalties = {}
    

    for (const event of events) {
        const { seed, royaltyPaid, royaltyRecipient } = event.args

        if (royaltyOptions?.originalId && !seed.eq(royaltyOptions?.originalId)) {
            continue
        }

        const seedToAmount = royalties[royaltyRecipient] || {}
        royalties[royaltyRecipient] = seedToAmount

        const originalId = seed.toString()
        const amount = (seedToAmount[originalId] || BigNumber.from(0)) as BigNumber
        seedToAmount[originalId] = amount.add(royaltyPaid)
    }

    const royaltiesPaid: RoyaltiesPaid[] = []
    for (let address of Object.keys(royalties)) {
        for (let originalId of Object.keys(royalties[address])) {
            const amountInWei = BigNumber.from(royalties[address][originalId])
            royaltiesPaid.push({
                address,
                originalId,
                amountInWei,
            })
        }
    }
    return royaltiesPaid
}
