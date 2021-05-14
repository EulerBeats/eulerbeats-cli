import { getAllRecipients } from './erc1155'
import { EthCallOptions, Release } from '../types'
import { contractAndTokenId, getStakingContract } from '../utils'
import { BigNumber } from '@ethersproject/bignumber'


const STAKING_DEPLOY_BLOCK = 12375826


export async function stakedBalances(
    release: Release,
    trackNumber: string,
    options?: EthCallOptions
): Promise<any> {
    const { contractAddress, printTokenId } = contractAndTokenId(release, trackNumber)

    const contract = await getStakingContract()

    // get staking event for this track
    const pairNumber = BigNumber.from(trackNumber).sub(1).toNumber()
    const filter = contract.filters.PairStaked(pairNumber, null, null)
    const events = await contract.queryFilter(filter, STAKING_DEPLOY_BLOCK, options?.blockTag || 'latest')

    const balances = {}
    for (let event of events) {
        const address = event.args!.account
        const addressBalance = await contract.balanceOf(address, contractAddress, printTokenId, options || {})
        balances[address] = addressBalance.toNumber()
    }

    return balances
}
