import { providers } from 'ethers'
import { EulerBeatsV1 } from '../types'
import maxBy from 'lodash/maxBy'
import padStart from 'lodash/padStart'

export function getLatestEvent(logs: any[]) {
    return maxBy(logs, 'blockNumber')
}

export function parseLogs(logs: providers.Log[], contract: EulerBeatsV1) {
    return logs.map(log => {
        const parsed = contract.interface.parseLog(log)
        return {
            ...log,
            parsed,
        }
    })
}

export function getMintNumberFromEvent(event) {
    const originalsMinted = event.parsed.args.originalsMinted
    return padStart(originalsMinted, 2, '0')
}

// Get the official name of an Original
export function getOriginalNameFromEvent(event) {
    const mintNumber = getMintNumberFromEvent(event)
    return `Genesis LP ${mintNumber}`
}
