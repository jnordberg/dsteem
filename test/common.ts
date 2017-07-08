
import * as fetch from 'node-fetch'
import * as fs from 'fs'
import {promisify} from 'util'
import {randomBytes} from 'crypto'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const NUM_TEST_ACCOUNTS = 2

export const testnet = {
    addr: 'wss://testnet.steem.vc',
    chainId: '79276aea5d4877d9a25892eaa01b0adf019d3e5cb12a97478df3298ccdd01673',
    addressPrefix: 'STX',
}

export function randomString(length: number) {
    return randomBytes(length*2)
        .toString('base64')
        .replace(/[^0-9a-z]+/gi, '')
        .slice(0, length)
        .toLowerCase()
}

export async function getTestnetAccounts(): Promise<{username: string, password: string}[]> {
    try {
        return JSON.parse(await readFile('.testnetrc'))
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error
        }
    }
    console.warn('-- CREATING TESTNET ACCOUNTS --')
    let rv: {username: string, password: string}[] = []
    while (rv.length < NUM_TEST_ACCOUNTS) {
        const password = randomString(32)
        const username = `dsteem-${ randomString(9) }`
        const response = await fetch('https://testnet.steem.vc/create', {
            method: 'POST',
            body: `username=${ username }&password=${ password }`,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        })
        const text = await response.text()
        if (response.status !== 200) {
            throw new Error(`Unable to create user: ${ text }`)
        }
        rv.push({username, password})
    }
    await writeFile('.testnetrc', JSON.stringify(rv))
    return rv
}
