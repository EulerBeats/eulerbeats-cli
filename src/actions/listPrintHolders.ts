import { Command, CommanderError, OptionValues } from 'commander'
import { BigNumberish } from 'ethers'
import { sum } from 'lodash'
import { table } from 'table'
import { printOwnership } from '../lib'
import { initializeProvider } from '../config'
import {
    deployBlockForRelease,
    TokenOwnership,
    trackNumberToOriginalTokenId,
    OriginalEulerBeat,
    CACHE_DIR,
    tableConfig,
} from '../utils'
import { Release } from '../types'
import { stakedBalances } from '../lib/staking'

function tableOutput(release: Release, original: OriginalEulerBeat, owners: TokenOwnership[]) {
    const uniqueOwners = owners.length
    const totalSupply = sum(owners.map(o => o.balance))
    const releaseName = release === Release.genesis ? 'Genesis' : 'Enigma'

    const tableData: any = [[`${releaseName} LP ${original.trackNumber} Print Owner`, 'Balance']]
    for (const owner of owners) {
        tableData.push([owner.address, owner.balance])
    }
    tableData.push(['Unique Owners', uniqueOwners])
    tableData.push(['Total Prints', totalSupply])

    const config = tableConfig()
    const output = table(tableData, config)
    console.log(output)
}

function csvOutput(release: Release, original: OriginalEulerBeat, owners: TokenOwnership[]) {
    let data = 'Owner,Balance\n'
    console.log('Owner,Balance')

    for (const owner of owners) {
        data = data.concat(`${owner.address},${owner.balance}\n`)
        console.log(`${owner.address},${owner.balance}`)
    }
}

async function handler(trackNumber: BigNumberish, options: OptionValues, command: Command) {
    const release = options.release

    const original = trackNumberToOriginalTokenId(release, trackNumber.toString())

    const provider = await initializeProvider(options.rpc)

    let targetBlock = options.block
    if (targetBlock) {
        // validation already done by arg parser
        targetBlock = parseInt(options.block)

        if (targetBlock <= deployBlockForRelease(release)) {
            throw new CommanderError(
                1,
                'BAD_BLOCK',
                `Block number ${targetBlock} is before contract was deployed (block ${deployBlockForRelease(
                    release
                )})`
            )
        }
    } else {
        targetBlock = await provider.getBlockNumber()
    }

    console.log(
        `Fetching ${release} print ownership records for track ${original.trackNumber} at block ${targetBlock}`
    )

    if (!options.stakers) {
        console.log('Excluding accounts that are staking, the staking contract will instead be shown')
    }

    const owners = await printOwnership(release, original.trackNumber, options.stakers, {
        blockTag: targetBlock,
    })

    const sortByBalance = (left: TokenOwnership, right: TokenOwnership) => {
        if (left.balance < right.balance) {
            return 1
        } else if (left.balance > right.balance) {
            return -1
        }
        return left.address < right.address ? -1 : 1
    }
    owners.sort(sortByBalance)

    if (options.output === 'csv') {
        csvOutput(release, original, owners)
    } else {
        tableOutput(release, original, owners)
    }
}

export { handler as listPrintHolders }
