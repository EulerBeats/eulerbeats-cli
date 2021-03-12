import { utils } from 'ethers'
import { jsonRpcProvider } from '../config'
import { EulerBeatsV1, EulerBeatsV1Factory } from '../types'

// Gets token wrapper for an address
export const getTokenContractByAddress = async (address: string): Promise<EulerBeatsV1> => {
    try {
        const provider = await jsonRpcProvider()
        return EulerBeatsV1Factory.connect(utils.getAddress(address), provider)
    } catch (error) {
        console.log(`error:`, error)
        throw error
    }
}

