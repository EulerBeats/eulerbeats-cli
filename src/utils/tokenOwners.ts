import { BigNumberish, BigNumber } from 'ethers'
import padStart from 'lodash/padStart'
import { Release } from '../types'
import { GENESIS_TRACK_TO_TOKEN_ID, GENESIS_TOKEN_CONTRACT_ADDRESS } from './constants'

export interface TokenOwnership {
    contractAddress: string
    tokenId: string
    address: string
    balance: number
}

interface contractAndTokenId {
    contractAddress: string
    printTokenId: string
}

// original -> print id
export const tokenIdToPrintId = (release: Release, tokenId: BigNumberish): BigNumber => {
    if (release === Release.genesis) {
        // all genesis token ids are 40 bits, with the first bit being the print flag,
        // and the remaining 39 being the "seed" for the generation logic.
        // according to docs, javascript doesn't work great with bitwise operations over 32
        // bits, so use BigNumber to do this safely
        const binaryRepr = padStart(BigNumber.from(tokenId).toNumber().toString(2), 40, '0')

        if (binaryRepr.length > 40) {
            throw Error('Invalid token id, not valid for the genesis release')
        }

        const printBinary = `1${binaryRepr.substring(1)}`
        return BigNumber.from(parseInt(printBinary, 2))
    } else {
        throw Error('Release not yet supported')
    }
}

export function contractAndTokenId(release: Release, trackNumber: string) {
    if (release !== Release.genesis) {
        throw Error(`Unsupported release: ${release}`)
    }
    const originalTokenId = GENESIS_TRACK_TO_TOKEN_ID[trackNumber]

    if (!originalTokenId) {
        throw Error(`Unknown track number: ${trackNumber}`)
    }
    const printTokenId = tokenIdToPrintId(release, originalTokenId).toString()

    return {
        contractAddress: GENESIS_TOKEN_CONTRACT_ADDRESS,
        printTokenId,
        originalTokenId,
    }
}
