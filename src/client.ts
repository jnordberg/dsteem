/**
 * @file Steem RPC client implementation.
 * @author Johan Nordberg <code@johan-nordberg.com>
 * @license
 * Copyright (c) 2017 Johan Nordberg. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *  1. Redistribution of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *
 *  2. Redistribution in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *
 *  3. Neither the name of the copyright holder nor the names of its contributors
 *     may be used to endorse or promote products derived from this software without
 *     specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * You acknowledge that this software is not designed, licensed or intended for use
 * in the design, construction, operation or maintenance of any military facility.
 */

import * as assert from 'assert'
import {VError} from 'verror'
import packageVersion from './version'
import fetch = require('node-fetch')

import {Blockchain} from './helpers/blockchain'
import {BroadcastAPI} from './helpers/broadcast'
import {DatabaseAPI} from './helpers/database'
import {copy, waitForEvent} from './utils'

/**
 * Library version.
 */
export const VERSION = packageVersion

/**
 * Main steem network chain id.
 */
export const DEFAULT_CHAIN_ID = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

/**
 * Main steem network address prefix.
 */
export const DEFAULT_ADDRESS_PREFIX = 'STM'

interface RPCRequest {
    /**
     * Request sequence number.
     */
    id: number
    /**
     * RPC method.
     */
    method: 'call' | 'notice' | 'callback'
    /**
     * Array of parameters to pass to the method.
     */
    jsonrpc: '2.0'
    params: any[]
}

interface RPCCall extends RPCRequest {
    method: 'call'
    /**
     * 1. API to call, you can pass either the numerical id of the API you get
     *    from calling 'get_api_by_name' or the name directly as a string.
     * 2. Method to call on that API.
     * 3. Arguments to pass to the method.
     */
    params: [number|string, string, any[]]
}

interface RPCError {
    code: number
    message: string
    data?: any
}

interface RPCResponse {
    /**
     * Response sequence number, corresponding to request sequence number.
     */
    id: number
    error?: RPCError
    result?: any
}

interface PendingRequest {
    request: RPCRequest,
    timer: NodeJS.Timer | undefined
    resolve: (response: any) => void
    reject: (error: Error) => void
}

/**
 * RPC Client options
 * ------------------
 */
export interface ClientOptions {
    /**
     * Steem chain id. Defaults to main steem network:
     * `0000000000000000000000000000000000000000000000000000000000000000`
     */
    chainId?: string
    /**
     * Steem address prefix. Defaults to main steem network:
     * `STM`
     */
    addressPrefix?: string
    /**
     * Node.js http(s) agent, use if you want http keep-alive.
     * Defaults to using https.globalAgent.
     * @see https://nodejs.org/api/http.html#http_new_agent_options.
     */
    agent?: any // https.Agent
}

/**
 * RPC Client
 * ----------
 * Can be used in both node.js and the browser. Also see {@link ClientOptions}.
 */
export class Client {

    /**
     * Create a new client instance configured for the testnet.
     */
    public static testnet(options?: ClientOptions) {
        let opts: ClientOptions = {}
        if (options) {
            opts = copy(options)
            opts.agent = options.agent
        }
        opts.addressPrefix = 'STX'
        opts.chainId = '79276aea5d4877d9a25892eaa01b0adf019d3e5cb12a97478df3298ccdd01673'
        return new Client('https://testnet.steem.vc', opts)
    }

    /**
     * Client options, *read-only*.
     */
    public readonly options: ClientOptions

    /**
     * Address to Steem RPC server, *read-only*.
     */
    public readonly address: string

    /**
     * Database API helper.
     */
    public readonly database: DatabaseAPI

    /**
     * Broadcast API helper.
     */
    public readonly broadcast: BroadcastAPI

    /**
     * Blockchain helper.
     */
    public readonly blockchain: Blockchain

    /**
     * Chain ID for current network.
     */
    public readonly chainId: Buffer

    /**
     * Address prefix for current network.
     */
    public readonly addressPrefix: string

    private seqNo: number = 0

    /**
     * @param address The address to the Steem RPC server, e.g. `https://steemd.steemit.com`.
     * @param options Client options.
     */
    constructor(address: string, options: ClientOptions = {}) {
        this.address = address
        this.options = options

        this.chainId = options.chainId ? Buffer.from(options.chainId, 'hex') : DEFAULT_CHAIN_ID
        assert.equal(this.chainId.length, 32, 'invalid chain id')
        this.addressPrefix = options.addressPrefix || DEFAULT_ADDRESS_PREFIX

        this.database = new DatabaseAPI(this)
        this.broadcast = new BroadcastAPI(this)
        this.blockchain = new Blockchain(this)
    }

    /**
     * Make a RPC call to the server.
     *
     * @param api     The API to call, e.g. `database_api`.
     * @param method  The API method, e.g. `get_dynamic_global_properties`.
     * @param params  Array of parameters to pass to the method, optional.
     *
     */
    public async call(api: string, method: string, params: any[] = []): Promise<any> {
        const request: RPCCall = {
            id: ++this.seqNo,
            jsonrpc: '2.0',
            method: 'call',
            params: [api, method, params],
        }
        const body = JSON.stringify(request, (key, value) => {
            // encode Buffers as hex strings instead of an array of bytes
            if (typeof value === 'object' && value.type === 'Buffer') {
                return Buffer.from(value.data).toString('hex')
            }
            return value
        })
        const req = {
            body,
            cache: 'no-cache',
            headers: {'User-Agent': `dsteem/${ packageVersion }`},
            method: 'POST',
            mode: 'cors',
        }
        const response = await (await fetch(this.address, req)).json() as RPCResponse
        if (response.error) {
            const {data} = response.error
            let {message} = response.error
            if (data && data.stack && data.stack.length > 0) {
                const top = data.stack[0]
                const topData = copy(top.data)
                message = top.format.replace(/\$\{([a-z_]+)\}/gi, (match: string, key: string) => {
                    let rv = match
                    if (topData[key]) {
                        rv = topData[key]
                        delete topData[key]
                    }
                    return rv
                })
                const unformattedData = Object.keys(topData)
                    .map((key) => ({key, value: topData[key]}))
                    .filter((item) => typeof item.value === 'string')
                    .map((item) => `${ item.key }=${ item.value}`)
                if (unformattedData.length > 0) {
                    message += ' ' + unformattedData.join(' ')
                }
            }
            throw new VError({info: data, name: 'RPCError'}, message)
        }
        assert.equal(response.id, request.id, 'got invalid response id')
        return response.result
    }

}
