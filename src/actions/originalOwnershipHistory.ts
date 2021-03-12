import { Command, OptionValues } from 'commander'
import { initializeProvider } from '../config'
import { originalOwnership } from '../lib'
import { GENESIS_DEPLOY_BLOCK } from '../utils'

export async function originalOwnershipHistory(options: OptionValues, command: Command) {
    const release = options.release
    const provider = await initializeProvider(options.rpc)
    const blockNumber = await provider.getBlockNumber()

    console.log(
        `Fetching historical original ownership records for all tracks between blocks: ${GENESIS_DEPLOY_BLOCK} - ${blockNumber}`
    )
    await originalOwnership(release)

    // TODO: cache
    // try {
    //     const json = readFileSync(`${CACHE_DIR}/historicalOwnership.json`, 'utf-8')
    //     const cachedHistoricalOwnership = JSON.parse(json)
    //     if (cachedHistoricalOwnership.blockNumber < blockNumber - 1000) {
    //         throw Error('old cache')
    //     }

    //     console.log('Using cached data up to block:', cachedHistoricalOwnership.blockNumber)
    //     displayOwnership(cachedHistoricalOwnership)
    // } catch (error) {
    //     if (error.message === 'old cache') {
    //         console.log('Cache is too old.')
    //     }
    //     console.log(
    //         `Fetching historical original ownership records for all tracks between blocks: ${GENESIS_DEPLOY_BLOCK} - ${blockNumber}`
    //     )
    //     await originalOwnership(release)
    // }
}
