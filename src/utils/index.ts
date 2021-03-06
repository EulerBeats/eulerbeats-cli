import { BigNumber } from 'ethers'
import { padStart } from 'lodash'
import { ENIGMA_TRACK_TO_TOKEN_ID, GENESIS_TRACK_TO_TOKEN_ID } from './constants'
import { Release } from '../types'

export * from './constants'
export * from './contracts'
export * from './events'
export * from './files'
export * from './options'
export * from './table'
export * from './tokenOwners'
export * from './tokenUtils'

export interface OriginalEulerBeat {
    tokenId: string
    trackNumber: string
    release: Release
}

export function trackNumberToOriginalTokenId(
    release: Release,
    trackNumber: string
): OriginalEulerBeat {
    const trackNumberString = padStart(trackNumber, 2, '0')

    let tokenId = undefined
    if (release === Release.genesis) {
        tokenId = GENESIS_TRACK_TO_TOKEN_ID[trackNumberString]
    } else if (release === Release.enigma) {
        tokenId = ENIGMA_TRACK_TO_TOKEN_ID[trackNumberString]
    }

    if (!tokenId) {
        throw Error(`Track number ${trackNumberString} not found for release ${release}`)
    }
    return {
        tokenId,
        trackNumber: trackNumberString,
        release,
    }
}
