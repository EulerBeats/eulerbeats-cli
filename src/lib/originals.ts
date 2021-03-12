import { writeFileSync } from 'fs'
import { EventFilter, providers } from 'ethers'
import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'
import { table } from 'table'
import { Release } from '../types'
import {
    GENESIS_TOKEN_CONTRACT_ADDRESS,
    eventTopics,
    getTokenContractByAddress,
    getMintNumberFromEvent,
    parseLogs,
    getLatestEvent,
    GENESIS_DEPLOY_BLOCK,
    CACHE_DIR,
    tableConfig,
} from '../utils'

interface BlockTags {
    fromBlock: number
    toBlock: number | string
}

// TODO: cache
function cacheOriginals(historicalOwners, latestOwners, blockNumber) {
    const numHistoricalOwners = Object.keys(historicalOwners).length - 1
    const historicalOwnership = {
        blockNumber,
        totalOriginalTransfers: historicalOwners.totalOriginalTransfers,
        numHistoricalOwners,
        ...historicalOwners,
    }
    writeFileSync(`${CACHE_DIR}/historicalOwnership.json`, JSON.stringify(historicalOwnership))

    const numLatestOwners = Object.keys(latestOwners).length - 1
    const latestOwnership = {
        blockNumber,
        numLatestOwners,
        ...latestOwners,
    }
    writeFileSync(`${CACHE_DIR}/latestOwnership.json`, JSON.stringify(latestOwnership))
}

export async function originalOwnership(release: Release, options?: BlockTags): Promise<any> {
    // FIXME: needs better cache pattern
    // const noCache = !options?.fromBlock && !options?.toBlock

    // const { contractAddress, originalTokenId } = contractAndTokenId(release, trackNumber)
    const contractAddress = release === Release.genesis ? GENESIS_TOKEN_CONTRACT_ADDRESS : ''
    const eb = await getTokenContractByAddress(contractAddress)
    const blockNumber = await eb.provider.getBlockNumber()

    const filter: EventFilter & BlockTags = {
        fromBlock: options?.fromBlock || GENESIS_DEPLOY_BLOCK,
        toBlock: options?.toBlock || 'latest',
        address: GENESIS_TOKEN_CONTRACT_ADDRESS,
        // TODO: Add eventTopics.TransferBatch
        topics: [[eventTopics.MintOriginal, eventTopics.TransferSingle]],
    }

    const logs: providers.Log[] = await eb.provider.getLogs(filter)

    const grouped = groupBy(logs, 'topics.0')

    const mintOriginalLogs: providers.Log[] = grouped[eventTopics.MintOriginal] || []
    const transferSingleLogs: providers.Log[] = grouped[eventTopics.TransferSingle] || []

    const historicalOwners = {
        totalOriginalTransfers: 0,
        owners: {},
    }
    const latestOwners = {
        owners: {},
    }

    const mintOriginalEvents = parseLogs(mintOriginalLogs, eb)
    const transferSingleEvents = parseLogs(transferSingleLogs, eb)

    mintOriginalEvents.forEach(moEvent => {
        const matchingTsEvents = transferSingleEvents.filter(event =>
            moEvent.parsed.args.seed.eq(event.parsed.args.id)
        )
        historicalOwners.totalOriginalTransfers =
            historicalOwners.totalOriginalTransfers + matchingTsEvents.length + 1

        const mintNumber = getMintNumberFromEvent(moEvent)

        // Historical ownership
        matchingTsEvents.forEach(e => {
            const eArgs = e.parsed.args
            const owner = eArgs.to
            const historicalTsEvent = {
                mintNumber,
                blockNumber: e.blockNumber,
                txHash: e.transactionHash,
                from: eArgs.from,
                to: eArgs.to,
            }
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

        // Latest ownership
        const latestTransfer = getLatestEvent(matchingTsEvents)
        const ltArgs = latestTransfer.parsed.args
        const latestOwner = ltArgs.to
        const latestTsEvent = {
            mintNumber,
            blockNumber: latestTransfer.blockNumber,
            txHash: latestTransfer.transactionHash,
            from: ltArgs.from,
            to: ltArgs.to,
        }
        if (latestOwners[latestOwner]) {
            latestOwners[latestOwner] = [...latestOwners[latestOwner], latestTsEvent]
        } else {
            latestOwners[latestOwner] = [latestTsEvent]
        }

        latestOwners.owners[mintNumber] = latestOwner
    }, {})

    displayOwnership(historicalOwners)

    // TODO: cache
    // cacheOriginals(historicalOwners, latestOwners, blockNumber)
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
