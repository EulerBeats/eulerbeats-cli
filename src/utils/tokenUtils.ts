import { BigNumberish } from "ethers";
import { Release } from "../types";
import { GENESIS_TOKEN_ID_TO_TRACK } from "./constants";



export function originalIdToTrackName(release: Release, originalId: BigNumberish) {
    if (release === Release.genesis) {
        return GENESIS_TOKEN_ID_TO_TRACK[originalId.toString()]
    }
    throw Error('Release not supported')
}

export function releaseToPrettyName(release: Release) {
    if (release === Release.genesis) {
        return 'Genesis LP'
    } else if (release === Release.enigma) {
        return 'Enigma LP'
    }
    throw Error('Release not supported')
}
