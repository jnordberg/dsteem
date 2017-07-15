/**
 * @file Steem protocol serialization.
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

import {PublicKey} from './../crypto'
import {Authority} from './account'
import {Asset} from './asset'
import {HexBuffer} from './misc'
import {Operation} from './operation'

export interface SerializerOptions {
    addressPrefix: string
}

export type Serializer = (buffer: ByteBuffer, data: any, options: SerializerOptions) => void

const StringSerializer = (buffer: ByteBuffer, data: string) => {
    buffer.writeVString(data)
}

const Int16Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeInt16(data)
}

const UInt16Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeUint16(data)
}

const UInt32Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeUint32(data)
}

/**
 * Serialize asset.
 * @note This looses precision for amounts larger than 2^53-1/10^precision.
 *       Should not be a problem in real-word usage.
 */
const AssetSerializer = (buffer: ByteBuffer, data: Asset | string) => {
    const asset = Asset.from(data)
    const precision = asset.getPrecision()
    buffer.writeInt64(Math.round(asset.amount * Math.pow(10, precision)))
    buffer.writeUint8(precision)
    for (let i = 0; i < 7; i++) {
        buffer.writeUint8(asset.symbol.charCodeAt(i) || 0)
    }
}

const DateSerializer = (buffer: ByteBuffer, data: string) => {
    buffer.writeUint32(Math.floor(new Date(data + 'Z').getTime() / 1000))
}

const PublicKeySerializer = (buffer: ByteBuffer, data: PublicKey | string | Buffer, options: SerializerOptions) => {
    buffer.append(PublicKey.from(data, options.addressPrefix).key)
}

const BufferSerializer = (buffer: ByteBuffer, data: Buffer | HexBuffer) => {
    if (data instanceof HexBuffer) {
        data = data.buffer
    }
    buffer.writeVarint32(data.length)
    buffer.append(data)
}

const FlatMapSerializer = (keySerializer: Serializer, valueSerializer: Serializer) => {
    return (buffer: ByteBuffer, data: Array<[any, any]>, options: SerializerOptions) => {
        buffer.writeVarint32(data.length)
        for (const [key, value] of data) {
            keySerializer(buffer, key, options)
            valueSerializer(buffer, value, options)
        }
    }
}

const ArraySerializer = (itemSerializer: Serializer) => {
    return (buffer: ByteBuffer, data: any[], options: SerializerOptions) => {
        buffer.writeVarint32(data.length)
        for (const item of data) {
            itemSerializer(buffer, item, options)
        }
    }
}

const ObjectSerializer = (keySerializers: Array<[string, Serializer]>) => {
    return (buffer: ByteBuffer, data: {[key: string]: any}, options: SerializerOptions) => {
        for (const [key, serializer] of keySerializers) {
            serializer(buffer, data[key], options)
        }
    }
}

const AuthoritySerializer = ObjectSerializer([
    ['weight_threshold', UInt32Serializer],
    ['account_auths', FlatMapSerializer(StringSerializer, UInt16Serializer)],
    ['key_auths', FlatMapSerializer(PublicKeySerializer, UInt16Serializer)],
])

const OperationDataSerializer = (operationId: number, definitions: Array<[string, Serializer]>) => {
   const objectSerializer = ObjectSerializer(definitions)
   return (buffer: ByteBuffer, data: {[key: string]: any}, options: SerializerOptions) => {
        buffer.writeVarint32(operationId)
        objectSerializer(buffer, data, options)
    }
}

const OperationSerializers: {[name: string]: Serializer} = {}

OperationSerializers.vote = OperationDataSerializer(0, [
    ['voter', StringSerializer],
    ['author', StringSerializer],
    ['permlink', StringSerializer],
    ['weight', Int16Serializer],
])

OperationSerializers.custom_json = OperationDataSerializer(18, [
    ['required_auths', ArraySerializer(StringSerializer)],
    ['required_posting_auths', ArraySerializer(StringSerializer)],
    ['id', StringSerializer],
    ['json', StringSerializer],
])

OperationSerializers.comment = OperationDataSerializer(1, [
    ['parent_author', StringSerializer],
    ['parent_permlink', StringSerializer],
    ['author', StringSerializer],
    ['permlink', StringSerializer],
    ['title', StringSerializer],
    ['body', StringSerializer],
    ['json_metadata', StringSerializer],
])

OperationSerializers.delegate_vesting_shares = OperationDataSerializer(40, [
    ['delegator', StringSerializer],
    ['delegatee', StringSerializer],
    ['vesting_shares', AssetSerializer],
])

OperationSerializers.custom = OperationDataSerializer(15, [
    ['required_auths', ArraySerializer(StringSerializer)],
    ['id', UInt16Serializer],
    ['data', BufferSerializer],
])

OperationSerializers.transfer = OperationDataSerializer(2, [
    ['from', StringSerializer],
    ['to', StringSerializer],
    ['amount', AssetSerializer],
    ['memo', StringSerializer],
])

OperationSerializers.account_create = OperationDataSerializer(9, [
    ['fee', AssetSerializer],
    ['creator', StringSerializer],
    ['new_account_name', StringSerializer],
    ['owner', AuthoritySerializer],
    ['active', AuthoritySerializer],
    ['posting', AuthoritySerializer],
    ['memo_key', PublicKeySerializer],
    ['json_metadata', StringSerializer],
])

const OperationSerializer = (buffer: ByteBuffer, operation: Operation, options: SerializerOptions) => {
    const serializer = OperationSerializers[operation[0]]
    if (!serializer) {
        throw new Error(`No serializer for operation: ${ operation[0] }`)
    }
    serializer(buffer, operation[1], options)
}

const TransactionSerializer = ObjectSerializer([
    ['ref_block_num', UInt16Serializer],
    ['ref_block_prefix', UInt32Serializer],
    ['expiration', DateSerializer],
    ['operations', ArraySerializer(OperationSerializer)],
    ['extensions', ArraySerializer(StringSerializer)],
])

export const Types = {
    Array: ArraySerializer,
    Asset: AssetSerializer,
    Authority: AuthoritySerializer,
    Buffer: BufferSerializer,
    Date: DateSerializer,
    FlatMap: FlatMapSerializer,
    Int16: Int16Serializer,
    Object: ObjectSerializer,
    Operation: OperationSerializer,
    PublicKey: PublicKeySerializer,
    String: StringSerializer,
    Transaction: TransactionSerializer,
    UInt16: UInt16Serializer,
    UInt32: UInt32Serializer,
}
