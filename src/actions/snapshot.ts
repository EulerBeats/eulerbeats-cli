import { Command, CommanderError, OptionValues } from 'commander'
import { BigNumberish } from 'ethers'
import { padStart, sum } from 'lodash'
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
    contractAndTokenId,
} from '../utils'
import { EthCallOptions, Release } from '../types'
import { stakedBalances } from '../lib/staking'
import { getAllRecipients, getTokenBalances } from '../lib/erc1155'


function csvOutput(owners: any) {
    let data = 'Address,Balance\n'
    console.log('Address,Balance')

    for (const addy of Object.keys(owners)) {
        const balance = owners[addy]
        if (balance > 0) {
            data = data.concat(`${addy},${balance}\n`)
            console.log(`${addy},${balance}`)
        }
    }
}


async function handler(options: OptionValues, command: Command) {
    const provider = await initializeProvider(options.rpc)

    
    let targetBlock
    try {
        targetBlock = parseInt(options.block)
    } catch (e) {
        // swallow
    }
    
    if (!targetBlock) {
        targetBlock = await provider.getBlockNumber();
    }

    const possibleAddresses = new Set<string>();
    console.log(`Loading candidate genesis holders at block ${targetBlock}`)
    const genesisAddresses = await getAllRecipients(Release.genesis, undefined, targetBlock);
    console.log(`Found ${genesisAddresses.length}`)

    console.log(`Loading candidate enigma holders at block ${targetBlock}`)
    const enigmaAddresses = await getAllRecipients(Release.enigma, undefined, targetBlock);
    console.log(`Found ${enigmaAddresses.length}`)
    
    genesisAddresses.forEach(addy => possibleAddresses.add(addy))
    enigmaAddresses.forEach(addy => possibleAddresses.add(addy))

    console.log(`Found ${possibleAddresses.size} unique addresses who have ever received a EB original/print at block ${targetBlock}.  Now checking balances at block ${targetBlock} for all these addresses, this will take a while...`)

    // we have all addresses that have received a token, get their current balances
    const balances = {}

    const web3Options: EthCallOptions = {
        blockTag: targetBlock
    }
    
    for (let i = 1; i <= 27; i++) {        
        const trackNumber = padStart(i.toString(), 2, "0")
        
        const genesisTrack = contractAndTokenId(Release.genesis, trackNumber)
        const enigmaTrack = contractAndTokenId(Release.enigma, trackNumber)

        console.log(`Loading genesis holder info for track ${trackNumber} at block ${targetBlock}`)
        const genesisOriginalHolders = await getTokenBalances(genesisTrack.contractAddress, genesisTrack.originalTokenId, genesisAddresses, web3Options)
        const genesisPrintHolders = await getTokenBalances(genesisTrack.contractAddress, genesisTrack.printTokenId, genesisAddresses, web3Options)
        
        console.log(`Loading enigma holder info for track ${trackNumber} at block ${targetBlock}`)
        const enigmaOriginalHolders = await getTokenBalances(enigmaTrack.contractAddress, enigmaTrack.originalTokenId, enigmaAddresses, web3Options)
        const enigmaPrintHolders = await getTokenBalances(enigmaTrack.contractAddress, enigmaTrack.printTokenId, enigmaAddresses, web3Options)

        for (let i = 0; i < genesisAddresses.length; i++) {
            const addy = genesisAddresses[i]
            const balance = genesisOriginalHolders[i].add(genesisPrintHolders[i]).toNumber()
            if (!(addy in balances)) {
                balances[addy] = 0
            }
            balances[addy] += balance
        }

        for (let i = 0; i < enigmaAddresses.length; i++) {
            const addy = enigmaAddresses[i]
            const balance = enigmaOriginalHolders[i].add(enigmaPrintHolders[i]).toNumber()
            if (!(addy in balances)) {
                balances[addy] = 0
            }
            balances[addy] += balance
        }

        console.log(`Loading staked holder info for pairs of track ${trackNumber} at block ${targetBlock}`)
        const pairStakers = await stakedBalances(Release.genesis, trackNumber, web3Options)
        for (let addy of Object.keys(pairStakers)) {
            if (!(addy in balances)) {
                balances[addy] = 0
            }

            balances[addy] += (pairStakers[addy] * 2)
        }
    }

    csvOutput(balances)
    
}

export { handler as snapshotHolders }