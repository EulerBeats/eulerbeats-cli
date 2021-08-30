import { EventFilter, providers } from 'ethers'
import { flatMap } from 'lodash'
import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'
import { table } from 'table'
import { Release } from '../types'
import {
    eventTopics,
    getTokenContractByAddress,
    getMintNumberFromEvent,
    parseLogs,
    getLatestEvent,
    GENESIS_DEPLOY_BLOCK,
    tableConfig,
    contractAddressForRelease,
    deployBlockForRelease,
} from '../utils'

interface BlockTags {
    fromBlock: number
    toBlock: number | string
}


const MAX_BLOCKS_PER_QUERY = 100_000

export async function originalOwnership(release: Release, options?: BlockTags): Promise<any> {
    
    const contractAddress = contractAddressForRelease(release)
    const eb = await getTokenContractByAddress(contractAddress)
    const deployBlock = deployBlockForRelease(release)


    let blockNumber;
    if (options && options.toBlock && options.toBlock !== 'latest') {
        blockNumber = options.toBlock
    } else {
        blockNumber = await eb.provider.getBlockNumber()
    }

    const logs: providers.Log[] = []

    let startBlock = deployBlock;

    while (startBlock < blockNumber) {
        const endBlock = Math.min(startBlock + MAX_BLOCKS_PER_QUERY, blockNumber)
        const filter: EventFilter & BlockTags = {
            fromBlock: startBlock,
            toBlock: endBlock,
            address: contractAddress,
            topics: [[eventTopics.MintOriginal, eventTopics.TransferSingle, eventTopics.TransferBatch]],
        }

        const blockRangeLogs: providers.Log[] = await eb.provider.getLogs(filter)
        if (blockRangeLogs.length > 0) {
            logs.push(...blockRangeLogs)
        }
        startBlock += MAX_BLOCKS_PER_QUERY
    }
    
    const grouped = groupBy(logs, 'topics.0')

    const mintOriginalLogs: providers.Log[] = grouped[eventTopics.MintOriginal] || []
    const transferSingleLogs: providers.Log[] = grouped[eventTopics.TransferSingle] || []
    const transferBatchLogs: providers.Log[] = grouped[eventTopics.TransferBatch] || []

    const historicalOwners = {
        totalOriginalTransfers: 0,
        owners: {},
    }

    const mintOriginalEvents = parseLogs(mintOriginalLogs, eb)
    const transferSingleEvents = parseLogs(transferSingleLogs, eb)
    const transferBatchEvents = parseLogs(transferBatchLogs, eb)

    mintOriginalEvents.forEach(moEvent => {
        
        // const transferEvents = []
        const filteredSingleEvents = transferSingleEvents.filter(event =>
            event.parsed.args.value.eq(1)
        ).filter(event => 
            moEvent.parsed.args.seed.eq(event.parsed.args.id)
        ).map(event => {
            return {
                blockNumber: event.blockNumber,
                txHash: event.transactionHash,
                from: event.parsed.args.from,
                to: event.parsed.args.to,
            }
        })
        
        
        const filteredBatchEvents = flatMap(transferBatchEvents, event => {
            const events: any = []

            // transfer batch can transfer many at once, we extract these here
            for(let i = 0; i < event.parsed.args.ids.length; i++) {
                const tokenId = event.parsed.args[3][i]
                const amount = event.parsed.args[4][i]
                if (moEvent.parsed.args.seed.eq(tokenId) && amount.gt(0)) {
                    events.push({
                        blockNumber: event.blockNumber,
                        txHash: event.transactionHash,
                        from: event.parsed.args.from,
                        to: event.parsed.args.to,
                    })
                }
            }
            return events
        })

        const transferEvents = [...filteredSingleEvents, ...filteredBatchEvents].sort((a, b) => a.blockNumber - b.blockNumber)

        historicalOwners.totalOriginalTransfers =
            historicalOwners.totalOriginalTransfers + transferEvents.length + 1

        const mintNumber = getMintNumberFromEvent(moEvent)

        // Historical ownership
        transferEvents.forEach(e => {
            const owner = e.to
            const historicalTsEvent = e
            if (!historicalOwners[owner]) {
                historicalOwners[owner] = [mintNumber]
            } else {
                historicalOwners[owner] = [...historicalOwners[owner], mintNumber]
            }

            if (!historicalOwners.owners[mintNumber]) {
                historicalOwners.owners[mintNumber] = [historicalTsEvent]
            } else {
                historicalOwners.owners[mintNumber] = [
                    ...historicalOwners.owners[mintNumber],
                    historicalTsEvent,
                ]
            }
            return owner
        })


    }, {})

    displayOwnership(historicalOwners)
}

export function displayOwnership(historicalOwners) {
    const tableData: any = [['Track Number', 'Owners', 'Block Number']]
    orderBy(Object.keys(historicalOwners.owners), og => parseInt(og)).map(mintNumber => {
        const ogTransfers = historicalOwners.owners[mintNumber]

        const owners = ogTransfers.map(og => og.to)
        const blockNumbers = ogTransfers.map(og => og.blockNumber)

        tableData.push([mintNumber, owners.join('\n'), blockNumbers.join('\n')])
    })

    tableData.push([
        '',
        'Total # of transfers for all originals',
        historicalOwners.totalOriginalTransfers,
    ])

    const config = tableConfig('originals')
    const output = table(tableData, config)
    console.log(output)
}
