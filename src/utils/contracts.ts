import { utils } from 'ethers'
import { jsonRpcProvider } from '../config'
import { EulerBeatsV1, EulerBeatsV1Factory, Release } from '../types'
import { ENIGMA_DEPLOY_BLOCK, ENIGMA_TOKEN_CONTRACT_ADDRESS, GENESIS_DEPLOY_BLOCK, GENESIS_TOKEN_CONTRACT_ADDRESS } from './constants'

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


export const contractAddressForRelease = (release: Release) => {
    if (release === Release.genesis) {
        return GENESIS_TOKEN_CONTRACT_ADDRESS
    } else if (release === Release.enigma) {
        return ENIGMA_TOKEN_CONTRACT_ADDRESS
    }
    throw Error('Unsupported release')
}


export const deployBlockForRelease = (release: Release) => {
    if (release === Release.genesis) {
        return GENESIS_DEPLOY_BLOCK
    } else if (release === Release.enigma) {
        return ENIGMA_DEPLOY_BLOCK
    }
    throw Error('Unsupported release')   
}