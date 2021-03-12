import { InvalidOptionArgumentError, Option } from 'commander'
import { getAddress } from 'ethers/lib/utils'
import { Release } from '../types'

export function parsePositiveIntOption(value, dummyPrevious) {
    const parsedValue = parseInt(value, 10)
    if (isNaN(parsedValue) || parsedValue < 1) {
        throw new InvalidOptionArgumentError('Not a valid positive integer')
    }
    return parsedValue
}

export function parseBlockOption(value, dummyPrevious) {
    const parsedValue = parseInt(value, 10)
    if (isNaN(parsedValue)) {
        throw new InvalidOptionArgumentError('Not a valid block number')
    }
    return parsedValue
}

export function parseReleaseOption(value, dummyPrevious) {
    const release = Release[value]
    if (release !== Release.genesis) {
        throw new InvalidOptionArgumentError(`Release ${value} not currently supported`)
    }
    return release
}

export function parseEthAddressOption(value, dummyPrevious) {
    try {
        return getAddress(value)
    } catch (e) {
        throw new InvalidOptionArgumentError(`Address ${value} is not a valid ethereum address`)
    }
}

export function rpcProviderOption() {
    return new Option('--rpc <url>', 'JSON RPC URL to use.  Must be a mainnet provider')
}

export function blockOption() {
    return new Option(
        '-b, --block <block>',
        'The block number to query the blockchain at, defaults to the latest block'
    ).argParser(parseBlockOption)
}

export function releaseOption() {
    return new Option('-r, --release <release>', 'EulerBeats release')
        .choices(['genesis', 'enigma'])
        .default('genesis')
        .argParser(parseReleaseOption)
}
