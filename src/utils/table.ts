import { getBorderCharacters } from 'table'

const centeredColumns = {
    0: {
        alignment: 'center',
    },
    1: {
        alignment: 'center',
    },
}

export function tableConfig(type?: string): any {
    switch (type) {
        case 'originals': {
            return {
                border: getBorderCharacters(`norc`),
                columns: {
                    ...centeredColumns,
                    2: {
                        alignment: 'center',
                    },
                },
            }
        }
        case 'royalties': {
            return {
                border: getBorderCharacters(`norc`),
                columns: {
                    ...centeredColumns,
                    2: {
                        alignment: 'right',
                    },
                },
            }
        }
        case 'prints': {
            return {
                border: getBorderCharacters(`norc`),
                columns: {
                    ...centeredColumns,
                },
                drawHorizontalLine: (index, size) => {
                    return index === 0 || index === 1 || index === size - 2 || index === size
                },
            }
        }
        default: {
            return {
                border: getBorderCharacters(`norc`),
                columns: {
                    ...centeredColumns,
                },
                drawHorizontalLine: (index, size) => {
                    return index === 0 || index === 1 || index === size - 2 || index === size
                },
            }
        }
    }
}
