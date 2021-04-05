import { Command, OptionValues } from 'commander'
import { initializeProvider } from '../config'
import { originalOwnership } from '../lib'
import { deployBlockForRelease } from '../utils'

export async function originalOwnershipHistory(options: OptionValues, command: Command) {
    const release = options.release
    const provider = await initializeProvider(options.rpc)
    const blockNumber = await provider.getBlockNumber()
    const deployBlock = deployBlockForRelease(release)


    console.log(
        `Fetching ${release} historical original ownership records for all tracks between blocks: ${deployBlock} - ${blockNumber}`
    )
    await originalOwnership(release)
}
