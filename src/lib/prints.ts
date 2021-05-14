import { BigNumber } from '@ethersproject/bignumber'
import { zip } from 'lodash'
import { getAllRecipients, getTokenBalances } from './erc1155'
import { EthCallOptions, Release } from '../types'
import { TokenOwnership, contractAndTokenId, STAKING_CONTRACT_ADDRESS } from '../utils'
import { stakedBalances } from './staking'

export async function printOwnership(
    release: Release,
    trackNumber: string,
    includeStakers: boolean,
    options?: EthCallOptions
): Promise<TokenOwnership[]> {
    const { contractAddress, printTokenId } = contractAndTokenId(release, trackNumber)

    const possibleAddresses = await getAllRecipients(release, printTokenId)
    const tokenBalances = await getTokenBalances(
        contractAddress,
        printTokenId,
        possibleAddresses,
        options
    )

    // get the stakers if desired too
    let stakers
    if (includeStakers) {
        stakers = await stakedBalances(release, trackNumber, options)
    } else {
        stakers = {}
    }
    
    const addressBalances = zip(possibleAddresses, tokenBalances)
        .filter(grouped => {
            const address = grouped[0] as string
            const balance = (grouped[1] as BigNumber).toNumber()
            const includeAddress = includeStakers ? address !== STAKING_CONTRACT_ADDRESS : true
            return includeAddress && (balance > 0 || stakers[address])
        })
        .map(grouped => {
            const address = grouped[0] as string
            const balance = (grouped[1] as BigNumber).toNumber()
            const stakedBalance = stakers[address] || 0
            return {
                contractAddress,
                tokenId: printTokenId,
                address,
                balance: balance + stakedBalance,
            }
        })

    return addressBalances
}
