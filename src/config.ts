import { CommanderError } from 'commander'
import { ethers } from 'ethers'
import { sample } from 'lodash'
import memoizee from 'memoizee'

let currentProviderUrl = ''

export async function initializeProvider(providerUrl: string | undefined) {
    if (!providerUrl) {
        // if no provider url specified, look for an env var
        providerUrl = process.env.PROVIDER_URL ? process.env.PROVIDER_URL : getPublicProviderUrl()
    }

    currentProviderUrl = providerUrl || ''
    try {
        return await jsonRpcProvider()
    } catch (e) {
        throw new CommanderError(
            1,
            'BAD_PROVIDER',
            'Could not initialize the provider.  Check your url and that is a mainnet provider'
        )
    }
}

const getPublicProviderUrl = () => {
    console.log(
        'Warning: Using a public Ethereum provider, results may be unreliable.  Please see documentation for more information.'
    )
    return sample(['https://nodes.mewapi.io/rpc/eth'])
}

const _jsonRpcProvider = async () => {
    const providerUrl = currentProviderUrl
    console.log('Using provider url:', providerUrl)
    const provider = new ethers.providers.JsonRpcProvider(providerUrl)
    const network = await provider.getNetwork()
    if (network.chainId !== 1) {
        throw Error('Network is not connected to mainnet')
    }

    return provider
}

export const jsonRpcProvider = memoizee(_jsonRpcProvider)
