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
    randomPrintHolders,
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
        .addOption(
            new Option(
                '-o, --output <format>',
                'The format of the output, either table (default) or csv.'
            )
                .choices(['table', 'csv'])
                .default('table')
        )
        .action(listPrintHolders)

    printsCommand
        .command('random <track-number>')
        .description(
            'Outputs one (or more) random address(es) holding the print.  Track number must be valid for the given release.  Use the --count option to specify the number of addresses to choose.'
        )
        .addOption(rpcProviderOption())
        .addOption(blockOption())
        .addOption(releaseOption())
        .addOption(
            new Option('-c, --count <count>', 'Count of addresses to choose')
                .default(1)
                .argParser(parsePositiveIntOption)
        )
        .addOption(
            new Option(
                '--single',
                'Single entry per address, regardless how many prints the address owns.  Default is one entry per print held.'
            )
        )
        .action(randomPrintHolders)
}

function addRoyaltiesCommand() {
    const royaltiesCommand = program
        .command('royalties')
        .description('Commands related to EulerBeats royalties')

    royaltiesCommand
        .description(
            'Queries the royalties received for a particular release.  This command has many options to filter the royalties.'
        )
        .addOption(rpcProviderOption())
        .addOption(blockOption())
        .addOption(releaseOption())
        .addOption(new Option('--track <track-number>', 'Track number to filter by.'))
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

async function main() {
    addOriginalsCommand()
    addPrintsCommand()
    addRoyaltiesCommand()

    await program.parseAsync()
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
