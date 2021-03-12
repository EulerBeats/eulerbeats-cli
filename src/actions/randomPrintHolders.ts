import { Command, CommanderError, OptionValues } from 'commander'
import { BigNumber, BigNumberish } from 'ethers'
import { random, shuffle, sum } from 'lodash'
import { initializeProvider } from '../config'
import { deployBlockForRelease, trackNumberToOriginalTokenId } from '../utils'
import { printOwnership } from '../lib'

async function handler(trackNumber: BigNumberish, options: OptionValues, command: Command) {
    const release = options.release
    const numAddresses = parseInt(options.count)

    const original = trackNumberToOriginalTokenId(release, BigNumber.from(trackNumber).toString())

    const provider = await initializeProvider(options.rpc)

    let targetBlock = options.block
    if (options.block) {
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
        `Fetching print ownership records for track ${original.trackNumber} at block ${targetBlock}`
    )

    const owners = await printOwnership(release, original.trackNumber, {
        blockTag: targetBlock,
    })

    const uniqueOwners = owners.length
    const totalSupply = sum(owners.map(o => o.balance))

    console.log(
        `Found ${uniqueOwners} unique owners of ${totalSupply} total prints for track ${original.trackNumber} at block ${targetBlock}\n`
    )

    if (numAddresses > totalSupply) {
        throw new CommanderError(
            1,
            'NOT_ENOUGH_ADDRESSES',
            `Cannot select ${numAddresses} random addresses when supply is ${totalSupply}`
        )
    }

    if (options.single) {
        console.log(
            `Choosing ${numAddresses} random address${
                numAddresses > 1 ? 'es' : ''
            } with one entry per address`
        )
    } else {
        console.log(
            `Choosing ${numAddresses} random address${
                numAddresses > 1 ? 'es' : ''
            } with one entry per print held`
        )
    }

    let addressPool: string[] = []
    for (const owner of owners) {
        const numEntries = options.single ? 1 : owner.balance
        for (let i = 0; i < numEntries; i++) {
            addressPool.push(owner.address)
        }
    }

    const selected: string[] = []
    for (let i = 0; i < numAddresses; i++) {
        addressPool = shuffle(addressPool)
        const index = random(0, addressPool.length - 1)
        selected.push(addressPool[index])
        addressPool.splice(index, 1)
    }

    if (numAddresses > 1) {
        console.log(`Randomly selected the following ${numAddresses} addresses`)
    } else {
        console.log('Randomly selected the following address')
    }
    console.log(selected.join('\n'))
}

export { handler as randomPrintHolders }
