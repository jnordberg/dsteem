/**
 * @file Steem crypto helpers.
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
import * as ByteBuffer from 'bytebuffer'
import {createHash} from 'crypto'
import * as secp256k1 from 'secp256k1'

import {serializeTransaction, SignedTransaction, Transaction} from './steem/transaction'
import {copy} from './utils'

/**
 * Network id used in WIF-encoding.
 */
const NETWORK_ID = Buffer.from([0x80])

/**
 * Return ripemd160 hash of input.
 */
function ripemd160(input: Buffer | string): Buffer {
    return createHash('ripemd160').update(input).digest()
}

/**
 * Return sha256 hash of input.
 */
function sha256(input: Buffer | string): Buffer {
    return createHash('sha256').update(input).digest()
}

/**
 * Return 2-round sha256 hash of input.
 */
function doubleSha256(input: Buffer | string): Buffer {
    return sha256(sha256(input))
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

/**
 * Return true if signature is canonical, otherwise false.
 */
function isCanonicalSignature(signature: Buffer): boolean {
    return (
        !(signature[0] & 0x80) &&
        !(signature[0] === 0 && !(signature[1] & 0x80)) &&
        !(signature[32] & 0x80) &&
        !(signature[32] === 0 && !(signature[33] & 0x80))
    )
}

/**
 * ECDSA (secp256k1) public key.
 */
export class PublicKey {

    /**
     * Create a new instance from a WIF-encoded key.
     */
    public static fromString(wif: string) {
        return new PublicKey(decodePublic(wif))
    }

    constructor(private key: Buffer) {
        assert(secp256k1.publicKeyVerify(key), 'invalid public key')
    }

    /**
     * Verify a 32-byte signature.
     * @param message 32-byte message to verify.
     * @param signature Signature to verify.
     */
    public verify(message: Buffer, signature: Signature): boolean {
        return secp256k1.verify(message, signature.data, this.key)
    }

    /**
     * Return a WIF-encoded representation of the key.
     */
    public toString() {
        return encodePublic(this.key)
    }

    /**
     * Used by `utils.inspect` and `console.log` in node.js.
     */
    public inspect() {
        return `PublicKey: ${ this.toString() }`
    }

}

/**
 * ECDSA (secp256k1) private key.
 */
export class PrivateKey {

    /**
     * Create a new instance from a WIF-encoded key.
     */
    public static fromString(wif: string) {
        return new PrivateKey(decodePrivate(wif).slice(1))
    }

    /**
     * Create a new instance from a seed.
     */
    public static fromSeed(seed: string) {
        const hash = sha256(seed.trim().split(/[\t\n\v\f\r ]+/).join(' '))
        return new PrivateKey(hash)
    }

    /**
     * Create key from username and password.
     */
    public static fromLogin(username: string, password: string, role: string = 'active') {
        const seed = username + role + password
        return PrivateKey.fromSeed(seed)
    }

    constructor(private key: Buffer) {
        assert(secp256k1.privateKeyVerify(key), 'invalid private key')
    }

    /**
     * Sign message.
     * @param message 32-byte message.
     */
    public sign(message: Buffer): Signature {
        let rv: {signature: Buffer, recovery: number}
        let attempts = 0
        do {
            const options = {data: sha256(Buffer.concat([message, new Buffer(++attempts)]))}
            rv = secp256k1.sign(message, this.key, options)
        } while (!isCanonicalSignature(rv.signature))
        return new Signature(rv.signature, rv.recovery)
    }

    /**
     * Derive the public key for this private key.
     */
    public createPublic(): PublicKey {
        return new PublicKey(secp256k1.publicKeyCreate(this.key))
    }

    /**
     * Return a WIF-encoded representation of the key.
     */
    public toString() {
        return encodePrivate(Buffer.concat([NETWORK_ID, this.key]))
    }

    /**
     * Used by `utils.inspect` and `console.log` in node.js. Does not show the full key
     * to get the full encoded key you need to explicitly call {@link toString}.
     */
    public inspect() {
        const key = this.toString()
        return `PrivateKey: ${ key.slice(0, 6) }...${ key.slice(-6) }`
    }

}

/**
 * ECDSA (secp256k1) signature.
 */
export class Signature {

    public static fromBuffer(buffer: Buffer) {
        assert.equal(buffer.length, 65, 'invalid signature')
        const recovery = buffer.readUInt8(0) - 31
        const data = buffer.slice(1)
        return new Signature(data, recovery)
    }

    public static fromString(string: string) {
        return Signature.fromBuffer(Buffer.from(string, 'hex'))
    }

    constructor(public data: Buffer, public recovery: number) {
        assert.equal(data.length, 64, 'invalid signature')
    }

    /**
     * Recover public key from signature by providing original signed message.
     * @param message 32-byte message that was used to create the signature.
     */
    public recover(message: Buffer) {
        return new PublicKey(secp256k1.recover(message, this.data, this.recovery))
    }

    public toBuffer() {
        const buffer = Buffer.alloc(65)
        buffer.writeUInt8(this.recovery + 31, 0)
        this.data.copy(buffer, 1)
        return buffer
    }

    public toString() {
        return this.toBuffer().toString('hex')
    }

}

export function signTransaction(transaction: Transaction, key: PrivateKey, chainId: Buffer) {
    const buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    serializeTransaction(buffer, transaction)
    buffer.flip()

    const transactionData = Buffer.from(buffer.toBuffer())
    const digest = sha256(Buffer.concat([chainId, transactionData]))
    const signature = key.sign(digest)

    const signedTransaction = copy(transaction) as SignedTransaction
    if (!signedTransaction.signatures) {
        signedTransaction.signatures = []
    }

    signedTransaction.signatures.push(signature.toString())

    return signedTransaction
}
