export * from './genesis'

export enum Release {
    genesis = 'genesis',
    enigma = 'enigma',
}

export interface EthCallOptions {
    blockTag?: number | string
}
