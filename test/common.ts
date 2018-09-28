
import * as fs from 'fs'
import * as https from 'https'
import {randomBytes} from 'crypto'

export const IS_BROWSER = global['isBrowser'] === true
export const TEST_NODE = process.env['TEST_NODE'] || 'https://api.steemit.com'

export const agent = IS_BROWSER ? undefined : new https.Agent({keepAlive: true})

const fetch = global['fetch']

async function readFile(filename: string) {
    return new Promise<Buffer>((resolve, reject) => {
        fs.readFile(filename, (error, result) => {
            if (error) { reject(error) } else { resolve(result) }
        })
    })
}

async function writeFile(filename: string, data: Buffer) {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(filename, data, (error) => {
            if (error) { reject(error) } else { resolve() }
        })
    })
}

export function randomString(length: number) {
    return randomBytes(length*2)
        .toString('base64')
        .replace(/[^0-9a-z]+/gi, '')
        .slice(0, length)
        .toLowerCase()
}

export async function getTestnetAccounts(): Promise<{username: string, posting: string, active: string}[]> {
    if (IS_BROWSER) {
        throw new Error('tests not supported in browser');
    }
    if(process.env.TEST_ACCOUNT_1) {
        const name1: string = process.env.TEST_ACCOUNT_1!
        const name2: string = process.env.TEST_ACCOUNT_2!
        const posting: string = process.env.TNMAN_POSTING!
        const active: string = process.env.TNMAN_ACTIVE!
        return [{username: name1, posting, active},
            {username: name2, posting, active}]
    }

    try {
        const data = await readFile('.testnetrc')
        return JSON.parse(data.toString())
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error
          } else {
            throw new Error('you must define test accounts in .testnetrc, or set test accounts and keys on process.env')
        }
    }
}
