import { Command, CommanderError, OptionValues } from 'commander'
import { BigNumber, utils } from 'ethers'
import groupBy from 'lodash/groupBy'
import { table } from 'table'
import { initializeProvider } from '../config'
import { getRoyalties } from '../lib/erc1155'
import {
    contractAddressForRelease,
    deployBlockForRelease,
    GENESIS_TOKEN_CONTRACT_ADDRESS,
    originalIdToTrackName,
    releaseToPrettyName,
    tableConfig,
    trackNumberToOriginalTokenId,
} from '../utils'

function csvOutput(rows: string[][]) {
    console.log(['Address', 'Track Name', 'Amount'].join(','))
    for (let row of rows) {
        console.log(row.join(','))
    }
}

function tableOutput(totalInEth: string, grouped: any, rows: string[][]) {
    const tableData: any = [['Track Name', 'Address', 'Royalty']]

    Object.keys(grouped).forEach(name => {
        const ogOwners = grouped[name]
        const addresses = ogOwners.map(royaltyRecipient => royaltyRecipient[0])
        const amounts = ogOwners.map(royaltyRecipient => {
            let val = utils.formatEther(royaltyRecipient[2])
            return `${val} ETH`
        })
        tableData.push([name, addresses.join('\n'), amounts.join('\n')])
    })

    tableData.push(['', 'Total Royalties Paid', `${totalInEth} ETH`])

    const config = tableConfig('royalties')
    const output = table(tableData, config)
    console.log(output)
}

export async function royaltiesAction(options: OptionValues, command: Command) {
    const release = options.release
    const provider = await initializeProvider(options.rpc)
    const contractAddress = contractAddressForRelease(release)
    const deployBlock = deployBlockForRelease(release)

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

    console.log(`Fetching royalties for ${release} at block ${targetBlock}`)

    let originalId: string | undefined = undefined
    if (options.track) {
        originalId = trackNumberToOriginalTokenId(release, options.track).tokenId
    }

    const royaltyOptions = {
        address: options.address,
        originalId,
    }

    const royalties = await getRoyalties(
        contractAddress,
        deployBlock,
        targetBlock,
        royaltyOptions
    )

    const rows = royalties.map(royalty => {
        const releaseName = releaseToPrettyName(release)
        const trackName = originalIdToTrackName(release, royalty.originalId)
        return [royalty.address, `${releaseName} ${trackName}`, royalty.amountInWei]
    })

    rows.sort((left, right) => {
        if (left[1] < right[1]) {
            return -1
        } else if (left[1] > right[1]) {
            return 1
        } else if ((left[2] as BigNumber).gt(right[2] as BigNumber)) {
            return -1
        } else if ((left[2] as BigNumber).lt(right[2] as BigNumber)) {
            return 1
        }
        return 0
    })

    let totalWei = BigNumber.from(0)
    rows.forEach(r => (totalWei = totalWei.add(r[2])))

    const grouped = groupBy(rows, row => row[1])

    const rowsWithEther = rows.map(row => [row[0], row[1], utils.formatEther(row[2])])

    if (options.output === 'csv') {
        csvOutput(rowsWithEther as string[][])
    } else {
        tableOutput(utils.formatEther(totalWei), grouped, rowsWithEther as string[][])
    }
}
