
import * as fetch from 'node-fetch'
import * as fs from 'fs'
import {randomBytes} from 'crypto'

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

const NUM_TEST_ACCOUNTS = 2

export function randomString(length: number) {
    return randomBytes(length*2)
        .toString('base64')
        .replace(/[^0-9a-z]+/gi, '')
        .slice(0, length)
        .toLowerCase()
}

export async function getTestnetAccounts(): Promise<{username: string, password: string}[]> {
    try {
        const data = await readFile('.testnetrc')
        return JSON.parse(data.toString())
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
    await writeFile('.testnetrc', Buffer.from(JSON.stringify(rv)))
    return rv
}
