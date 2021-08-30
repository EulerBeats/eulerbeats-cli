import { EthCallOptions, Release } from '../types'
import { contractAndTokenId, getStakingContract } from '../utils'
import { BigNumber } from '@ethersproject/bignumber'


const STAKING_DEPLOY_BLOCK = 12375826
const MAX_BLOCKS_PER_QUERY = 100_000


export async function stakedBalances(
    release: Release,
    trackNumber: string,
    options?: EthCallOptions
): Promise<any> {
    const { contractAddress, printTokenId } = contractAndTokenId(release, trackNumber)

    const contract = await getStakingContract()
    let blockNumber;
    if (options && options.blockTag && options.blockTag !== 'latest') {
        blockNumber = options.blockTag
    } else {
        blockNumber = await contract.provider.getBlockNumber()
    }

    // get staking event for this track
    const pairNumber = BigNumber.from(trackNumber).sub(1).toNumber()
    const filter = contract.filters.PairStaked(pairNumber, null, null)

    const addresses = new Set<string>()

    let startBlock = STAKING_DEPLOY_BLOCK;

    while (startBlock < blockNumber) {
        const endBlock = Math.min(startBlock + MAX_BLOCKS_PER_QUERY, blockNumber)
        const events = await contract.queryFilter(filter, startBlock, endBlock)

        for (let event of events) {
            addresses.add(event.args!.account)
        }
        startBlock += MAX_BLOCKS_PER_QUERY
    }

    const balances = {}
    for (let address of addresses) {
        const addressBalance = await contract.balanceOf(address, contractAddress, printTokenId, options || {})
        const balance = addressBalance.toNumber()
        if (balance > 0) {
            balances[address] = balance;
        }
        
    }

    return balances
}
