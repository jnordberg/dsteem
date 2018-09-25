/**
 * @file Misc utility functions.
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

import {EventEmitter} from 'events'
import {PassThrough} from 'stream'
import {VError} from 'verror'

const fetch = global['fetch'] // tslint:disable-line:no-string-literal

/**
 * Return a promise that will resove when a specific event is emitted.
 */
export function waitForEvent<T>(emitter: EventEmitter, eventName: string|symbol): Promise<T> {
    return new Promise((resolve, reject) => {
        emitter.once(eventName, resolve)
    })
}

/**
 * Sleep for N milliseconds.
 */
export function sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms)
    })
}

/**
 * Return a stream that emits iterator values.
 */
export function iteratorStream<T>(iterator: AsyncIterableIterator<T>): NodeJS.ReadableStream {
    const stream = new PassThrough({objectMode: true})
    const iterate = async () => {
        for await (const item of iterator) {
            if (!stream.write(item)) {
                await waitForEvent(stream, 'drain')
            }
        }
    }
    iterate().then(() => {
        stream.end()
    }).catch((error) => {
        stream.emit('error', error)
        stream.end()
    })
    return stream
}

/**
 * Return a deep copy of a JSON-serializable object.
 */
export function copy<T>(object: T): T {
    return JSON.parse(JSON.stringify(object))
}

/**
 * Fetch API wrapper that retries until timeout is reached.
 */
export async function retryingFetch(url: string, opts: any, timeout: number,
                                    backoff: (tries: number) => number,
                                    fetchTimeout?: (tries: number) => number) {
    const start = Date.now()
    let tries = 0
    do {
        try {
            if (fetchTimeout) {
                opts.timeout = fetchTimeout(tries)
            }
            const response = await fetch(url, opts)
            if (!response.ok) {
                throw new Error(`HTTP ${ response.status }: ${ response.statusText }`)
            }
            return await response.json()
        } catch (error) {
            if (timeout !== 0 && Date.now() - start > timeout) {
                throw error
            }
            await sleep(backoff(tries++))
        }
    } while (true)
}

// Hack to be able to generate a valid witness_set_properties op
// Can hopefully be removed when steemd's JSON representation is fixed
import * as ByteBuffer from 'bytebuffer'
import {PublicKey} from './crypto'
import {Asset, PriceType} from './steem/asset'
import {WitnessSetPropertiesOperation} from './steem/operation'
import {Serializer, Types} from './steem/serializer'
export interface WitnessProps {
    account_creation_fee?: string | Asset
    account_subsidy_budget?: number // uint32_t
    account_subsidy_decay?: number // uint32_t
    key: PublicKey | string
    maximum_block_size?: number // uint32_t
    new_signing_key?: PublicKey | string | null
    sbd_exchange_rate?: PriceType
    sbd_interest_rate?: number // uint16_t
    url?: string
}
function serialize(serializer: Serializer, data: any) {
    const buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    serializer(buffer, data)
    buffer.flip()
    return Buffer.from(buffer.toBuffer())
}
export function buildWitnessUpdateOp(owner: string, props: WitnessProps): WitnessSetPropertiesOperation {
    const data: WitnessSetPropertiesOperation[1] = {
        extensions: [], owner, props: []
    }
    for (const key of Object.keys(props)) {
        let type: Serializer
        switch (key) {
            case 'key':
            case 'new_signing_key':
                type = Types.PublicKey
                break
            case 'account_subsidy_budget':
            case 'account_subsidy_decay':
            case 'maximum_block_size':
                type = Types.UInt32
                break
            case 'sbd_interest_rate':
                type = Types.UInt16
                break
            case 'url':
                type = Types.String
                break
            case 'sbd_exchange_rate':
                type = Types.Price
                break
            case 'account_creation_fee':
                type = Types.Asset
                break
            default:
                throw new Error(`Unknown witness prop: ${ key }`)
        }
        data.props.push([key, serialize(type, props[key])])
    }
    data.props.sort((a, b) => a[0].localeCompare(b[0]))
    return ['witness_set_properties', data]
}
