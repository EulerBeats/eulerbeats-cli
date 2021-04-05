import { BigNumber } from '@ethersproject/bignumber'
import { zip } from 'lodash'
import { getAllRecipients, getTokenBalances } from './erc1155'
import { EthCallOptions, Release } from '../types'
import { TokenOwnership, contractAndTokenId } from '../utils'

export async function printOwnership(
    release: Release,
    trackNumber: string,
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
    const addressBalances = zip(possibleAddresses, tokenBalances)
        .filter(grouped => (grouped[1] as BigNumber).toNumber() > 0)
        .map(grouped => {
            return {
                contractAddress,
                tokenId: printTokenId,
                address: grouped[0] as string,
                balance: (grouped[1] as BigNumber).toNumber(),
            }
        })

    return addressBalances
}
