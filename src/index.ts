#!/usr/bin/env node
import { Command, Option } from 'commander'
import * as dotenv from 'dotenv'
import {
    blockOption,
    parseEthAddressOption,
    parsePositiveIntOption,
    releaseOption,
    rpcProviderOption,
} from './utils'
import {
    originalOwnershipHistory,
    listPrintHolders,
    royaltiesAction,
} from './actions'

dotenv.config()

const program = new Command()
    program.description('Welcome to the EulerBeats CLI!')

function addOriginalsCommand() {
    const originalsCommand = program
        .command('originals')
        .description('Commands related to EulerBeats originals')

    originalsCommand
        .command('history')
        .description('Returns historical ownership data (provenance) for all originals')
        .addOption(rpcProviderOption())
        .addOption(blockOption())
        .addOption(releaseOption())
        .action(originalOwnershipHistory)

    originalsCommand
        .command('royalties')
        .description(
            'Queries the royalties received for a particular release.  This command has many options to filter the royalties.'
        )
        .addOption(rpcProviderOption())
        .addOption(blockOption())
        .addOption(releaseOption())
        .addOption(
            new Option('--address <address>', 'Address to filter by.').argParser(
                parseEthAddressOption
            )
        )
        .addOption(
            new Option(
                '-o, --output <format>',
                'The format of the output, either table (default) or csv.'
            )
                .choices(['table', 'csv'])
                .default('table')
        )
        .action(royaltiesAction)
}

function addPrintsCommand() {
    const printsCommand = program
        .command('prints')
        .description('Commands related to EulerBeats prints')

    printsCommand
        .command('holders <track-number>')
        .description(
            'Returns all print holders for the given track number.  Track number must be valid for the given release.'
        )
        .addOption(rpcProviderOption())
        .addOption(blockOption())
        .addOption(releaseOption())
        .addOption(new Option('--no-stakers', 'Exclude stakers'))
        .addOption(
            new Option(
                '-o, --output <format>',
                'The format of the output, either table (default) or csv.'
            )
                .choices(['table', 'csv'])
                .default('table')
        )
        .action(listPrintHolders)
}


async function main() {
    addOriginalsCommand()
    addPrintsCommand()

    await program.parseAsync()
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
