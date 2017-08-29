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
import {EventEmitter} from 'events'
import {VError} from 'verror'
import * as WebSocket from 'ws'

import {Blockchain} from './helpers/blockchain'
import {BroadcastAPI} from './helpers/broadcast'
import {DatabaseAPI} from './helpers/database'
import {copy, waitForEvent} from './utils'

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
 * *Note* - The options inherited from `WebSocket.IClientOptions` are only
 * valid when running in node.js, they have no effect in the browser.
 */
export interface ClientOptions extends WebSocket.IClientOptions {
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
     * Retry back-off function, returns milliseconds. Default = {@link defaultBackoff}.
     */
    backoff?: (tries: number) => number
    /**
     * Number of attempts to reconnect before giving up, set to `0` to disable retrying altogether.
     * Default = `Infinity`.
     */
    retry?: number
    /**
     * Whether to connect when {@link Client} instance is created. Default = `true`.
     */
    autoConnect?: boolean
    /**
     * How long in milliseconds before a message times out, set to `0` to disable.
     * Default = `14 * 1000`.
     */
    sendTimeout?: number
}

/**
 * RPC Client events
 * -----------------
 */
export interface ClientEvents {
    /**
     * Emitted when the connection closes/opens.
     */
    on(event: 'open' | 'close', listener: () => void): this
    /**
     * Emitted on error, throws if there is no listener.
     */
    on(event: 'error', listener: (error: Error) => void): this
    /**
     * Emitted when receiving a server notice message, typically only used for callbacks.
     */
    on(event: 'notice', listener: (notice: any) => void): this
    on(event: string, listener: Function): this
}

/**
 * RPC Client
 * ----------
 * Can be used in both node.js and the browser. Also see {@link ClientOptions}.
 */
export class Client extends EventEmitter implements ClientEvents {

    /**
     * Create a new client instance configured for the testnet.
     */
    public static testnet(options?: ClientOptions) {
        let opts: ClientOptions = {}
        if (options) { opts = copy(options) }
        opts.addressPrefix = 'STX'
        opts.chainId = '79276aea5d4877d9a25892eaa01b0adf019d3e5cb12a97478df3298ccdd01673'
        return new Client('wss://testnet.steem.vc', opts)
    }

    /**
     * Client options, *read-only*.
     */
    public readonly options: ClientOptions

    /**
     * Address to Steem WebSocket RPC server, *read-only*.
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

    private active: boolean = false
    private backoff: (tries: number) => number
    private maxRetries: number
    private numRetries: number = 0
    private pending = new Map<number, PendingRequest>()
    private sendTimeout: number
    private seqNo: number = 0
    private socket?: WebSocket

    /**
     * @param address The address to the Steem RPC server, e.g. `wss://steemd.steemit.com`.
     * @param options Client options.
     */
    constructor(address: string, options: ClientOptions = {}) {
        super()

        this.address = address
        this.options = options
        this.backoff = options.backoff || defaultBackoff
        this.maxRetries = options.retry || Infinity

        this.chainId = options.chainId ? Buffer.from(options.chainId, 'hex') : DEFAULT_CHAIN_ID
        assert.equal(this.chainId.length, 32, 'invalid chain id')
        this.addressPrefix = options.addressPrefix || DEFAULT_ADDRESS_PREFIX

        this.sendTimeout = options.sendTimeout || 14 * 1000

        this.database = new DatabaseAPI(this)
        this.broadcast = new BroadcastAPI(this)
        this.blockchain = new Blockchain(this)

        if (options.autoConnect === undefined || options.autoConnect === true) {
            this.connect()
        }
    }

    /**
     * Return `true` if the client is connected, otherwise `false`.
     */
    public isConnected(): boolean {
        return (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN)
    }

    /**
     * Connect to the server.
     */
    public async connect() {
        this.active = true
        if (!this.socket) {
            this.socket = new WebSocket(this.address)
            this.socket.addEventListener('message', this.messageHandler)
            this.socket.addEventListener('open', this.openHandler)
            this.socket.addEventListener('close', this.closeHandler)
            this.socket.addEventListener('error', this.errorHandler)
            await new Promise((resolve) => {
                const done = () => {
                    this.removeListener('open', done)
                    this.removeListener('close', done)
                    resolve()
                }
                this.on('open', done)
                this.on('close', done)
            })
        }
    }

    /**
     * Disconnect from the server.
     */
    public async disconnect() {
        this.active = false
        if (
            this.socket &&
            this.socket.readyState !== WebSocket.CLOSED &&
            this.socket.readyState !== WebSocket.CLOSING
        ) {
            this.socket.close()
            await waitForEvent(this, 'close')
        }
    }

    /**
     * Make a RPC call to the server.
     *
     * @param api     The API to call, e.g. `database_api`.
     * @param method  The API method, e.g. `get_dynamic_global_properties`.
     * @param params  Array of parameters to pass to the method, optional.
     *
     */
    public call(api: string, method: string, params: any[] = []): Promise<any> {
        const request: RPCCall = {
            id: ++this.seqNo,
            method: 'call',
            params: [api, method, params],
        }
        return this.send(request)
    }

    private send(request: RPCRequest): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let timer: NodeJS.Timer|undefined
            if (this.sendTimeout > 0) {
                timer = setTimeout(() => {
                    const error = new VError({name: 'TimeoutError'}, `Timed out after ${ this.sendTimeout }ms`)
                    this.rpcHandler(request.id, error)
                }, this.sendTimeout)
            }
            this.pending.set(request.id, {reject, request, resolve, timer})
            if (this.isConnected()) {
                this.write(request).catch((error: Error) => {
                    this.rpcHandler(request.id, error)
                })
            }
        })
    }

    private rpcHandler = (seq: number, error?: Error, response?: any) => {
        if (this.pending.has(seq)) {
            const {resolve, reject, timer} = this.pending.get(seq) as PendingRequest
            if (timer) { clearTimeout(timer) }
            this.pending.delete(seq)
            if (error) {
                reject(error)
            } else {
                resolve(response)
            }
        }
    }

    private messageHandler = (event: {data: string, type: string, target: WebSocket}) => {
        try {
            const rpcMessage = JSON.parse(event.data)
            if (rpcMessage.method && rpcMessage.method === 'notice') {
                this.emit('notice', rpcMessage.params)
                return
            }
            const response = rpcMessage as RPCResponse
            let error: Error | undefined
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
                error = new VError({info: data, name: 'RPCError'}, message)
            }
            this.rpcHandler(response.id, error, response.result)
        } catch (cause) {
            const error = new VError({cause, name: 'MessageError'}, 'got invalid message')
            this.errorHandler(error)
        }
    }

    private retryHandler = () => {
        if (this.active) {
            this.connect()
        }
    }

    private closeHandler = () => {
        this.socket = undefined
        if (this.active && this.numRetries < this.maxRetries) {
            setTimeout(this.retryHandler, this.backoff(this.numRetries++))
        }
        this.emit('close')
    }

    private errorHandler = (error: Error) => {
        this.emit('error', error)
    }

    private openHandler = () => {
        this.numRetries = 0
        this.flushPending()
        this.emit('open')
    }

    private write = async (request: RPCRequest) => {
        const data = JSON.stringify(request, (key, value) => {
            // encode Buffers as hex strings instead of an array of bytes
            if (typeof value === 'object' && value.type === 'Buffer') {
                return Buffer.from(value.data).toString('hex')
            }
            return value
        })
        const socket = this.socket as WebSocket
        socket.send(data)
    }

    private flushPending() {
        const toSend: PendingRequest[] = Array.from(this.pending.values())
        toSend.sort((a, b) => a.request.id - b.request.id)
        toSend.map(async (pending) => {
            try {
                await this.write(pending.request)
            } catch (error) {
                this.rpcHandler(pending.request.id, error)
            }
        })
    }
}

/**
 * Default back-off function.
 * ```min(tries*10^2, 10 seconds)```
 */
const defaultBackoff = (tries: number): number => {
    return Math.min(Math.pow(tries * 10, 2), 10 * 1000)
}
