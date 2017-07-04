/**
 * @file Steem account helpers.
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
import * as bs58 from 'bs58'
import {createHash} from 'crypto'
import * as secp256k1 from 'secp256k1'
import {inspect} from 'util'

const NETWORK_ID = new Buffer([0x80])

/**
 * Return ripemd160 hash of input.
 */
function ripemd160(input: Buffer | string): Buffer {
    return createHash('ripemd160').update(input).digest()
}

/**
 * Return 2-round sha256 hash of input.
 */
function doubleSha256(input: Buffer | string): Buffer {
    const round1 = createHash('sha256').update(input).digest()
    return createHash('sha256').update(round1).digest()
}

/**
 * Encode public key with bs58+ripemd160-checksum.
 */
function encodePublic(key: Buffer): string {
    const checksum = ripemd160(key)
    return bs58.encode(Buffer.concat([key, checksum.slice(0, 4)]))
}

/**
 * Decode bs58+ripemd160-checksum encoded public key.
 */
function decodePublic(encodedKey: string): Buffer {
    const buffer: Buffer = bs58.decode(encodedKey)
    const checksum = buffer.slice(-4)
    const key = buffer.slice(0, -4)
    const checksumVerify = ripemd160(key).slice(0, 4)
    assert.deepEqual(checksumVerify, checksum, 'public key checksum mismatch')
    return key
}

/**
 * Encode bs58+doubleSha256-checksum private key.
 */
function encodePrivate(key: Buffer): string {
    assert.equal(key.readUInt8(0), 0x80, 'private key network id mismatch')
    const checksum = doubleSha256(key)
    return bs58.encode(Buffer.concat([key, checksum.slice(0, 4)]))
}

/**
 * Decode bs58+doubleSha256-checksum encoded private key.
 */
function decodePrivate(encodedKey: string): Buffer {
    const buffer: Buffer = bs58.decode(encodedKey)
    assert.deepEqual(buffer.slice(0, 1), NETWORK_ID, 'private key network id mismatch')
    const checksum = buffer.slice(-4)
    const key = buffer.slice(0, -4)
    const checksumVerify = doubleSha256(key).slice(0, 4)
    assert.deepEqual(checksumVerify, checksum, 'private key checksum mismatch')
    return key
}

export class PublicKey {

    public static fromEncoded(key: string) {
        return new PublicKey(decodePublic(key))
    }

    constructor(private key: Buffer) {}

    public toEncoded() {
        return encodePublic(this.key)
    }

    public toString() {
        return this.toEncoded()
    }

    public inspect() {
        return `PublicKey: ${ this.toString() }`
    }

}

export class PrivateKey {

    public static fromEncoded(key: string) {
        return new PrivateKey(decodePrivate(key).slice(1))
    }

    constructor(private key: Buffer) {}

    public createPublic(): PublicKey {
        return new PublicKey(secp256k1.publicKeyCreate(this.key))
    }

    public toEncoded() {
        return encodePrivate(Buffer.concat([NETWORK_ID, this.key]))
    }

    public toString() {
        const encoded = this.toEncoded()
        return `${ encoded.slice(0, 6) }...${ encoded.slice(-6) }`
    }

    public inspect() {
        return `PrivateKey: ${ this.toString() }`
    }

}
