import { constants, BigNumber, BigNumberish } from 'ethers'
import { fill } from 'lodash'
import { GENESIS_DEPLOY_BLOCK, getTokenContractByAddress } from '../utils'
import { EthCallOptions } from '../types'
import { formatEther } from 'ethers/lib/utils'

/**
 * Returns all addresses who have ever received the given token.  This does not mean
 * they are still in possession of the token, so callers should use a balanaceOf
 * query to validate this!
 *
 * @param contractAddress
 * @param tokenId
 */
export async function getAllRecipients(
    contractAddress: string,
    tokenId: string
): Promise<string[]> {
    const contract = await getTokenContractByAddress(contractAddress)
    const blockNumber = await contract.provider.getBlockNumber()

    const tokenIdBn = BigNumber.from(tokenId)
    const addresses = new Set<string>()
    const deployBlock = GENESIS_DEPLOY_BLOCK

    const filter = contract.filters.TransferSingle(null, null, null, null, null)
    const events = await contract.queryFilter(filter, deployBlock, blockNumber)

    for (const event of events) {
        const { to, id, value } = event.args
        if (to !== constants.AddressZero && tokenIdBn.eq(id) && value.gt(0)) {
            addresses.add(to)
        }
    }

    // for completeness, also do transfer batch
    const tbFilter = contract.filters.TransferBatch(null, null, null, null, null)
    const tbEvents = await contract.queryFilter(tbFilter, deployBlock, blockNumber)

    for (const event of tbEvents) {
        const { to, ids, values } = event.args
        // event.args!.values does not work due to clashing with values in the ReadonlyArray class
        // so just skip checking the balance
        const idsAsStrings = ids.map(id => id.toString())
        if (to !== constants.AddressZero && idsAsStrings.includes(tokenIdBn.toString())) {
            addresses.add(to)
        }
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
    blockNumber: number,
    royaltyOptions?: RoyaltyOptions,
) {
    const contract = await getTokenContractByAddress(contractAddress)

    const deployBlock = GENESIS_DEPLOY_BLOCK

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
