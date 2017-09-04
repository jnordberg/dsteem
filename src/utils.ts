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
import * as http from 'http'
import * as https from 'https'
import {PassThrough} from 'stream'
import {VError} from 'verror'

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
 * Reads stream to memory and tries to parse the result as JSON.
 */
export async function readJson(stream: NodeJS.ReadableStream): Promise<any> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        stream.on('error', reject)
        stream.on('data', (chunk: Buffer) => { chunks.push(chunk) })
        stream.on('end', () => {
            if (chunks.length === 0) {
                resolve(undefined)
                return
            }
            try {
                const data = JSON.parse(Buffer.concat(chunks).toString())
                resolve(data)
            } catch (error) {
                reject(error)
            }
        })
    })
}

/**
 * Sends JSON data to server and read JSON response.
 */
export async function jsonRequest(options: https.RequestOptions, data: any) {
    return new Promise((resolve, reject) => {
        let body: Buffer
        try {
            body = Buffer.from(JSON.stringify(data, (key, value) => {
                // encode Buffers as hex strings instead of an array of bytes
                if (typeof value === 'object' && value.type === 'Buffer') {
                    return Buffer.from(value.data).toString('hex')
                }
                return value
            }))
        } catch (cause) {
            throw new VError({cause, name: 'RequestError'}, 'Unable to stringify request data')
        }
        let request: http.ClientRequest
        if (!options.protocol || options.protocol === 'https:') {
            request = https.request(options)
        } else {
            request = http.request(options)
        }
        request.on('error', (cause) => {
            reject(new VError({cause, name: 'RequestError'}, 'Unable to send request'))
        })
        request.on('response', async (response: https.IncomingMessage) => {
            try {
                resolve(await readJson(response))
            } catch (cause) {
                const info = {code: response.statusCode}
                reject(new VError({cause, info, name: 'ResponseError'}, 'Unable to read response data'))
            }
        })
        request.setHeader('Accept', 'application/json')
        request.setHeader('Content-Type', 'application/json')
        request.setHeader('Content-Length', body.length)
        request.write(body)
        request.end()
    })
}
