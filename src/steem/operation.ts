/**
 * @file Steem operation type definitions.
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

import * as ByteBuffer from 'bytebuffer'

import {Asset} from './asset'
import {HexBuffer} from './misc'

/**
 * Transaction operation name.
 */
export type OperationName =
        | 'account_create'
        | 'account_create_with_delegation'
        | 'account_update'
        | 'account_witness_proxy'
        | 'account_witness_vote'
        | 'cancel_transfer_from_savings'
        | 'challenge_authority'
        | 'change_recovery_account'
        | 'claim_reward_balance'
        | 'comment'
        | 'comment_options'
        | 'convert'
        | 'custom'
        | 'custom_binary'
        | 'custom_json'
        | 'decline_voting_rights'
        | 'delegate_vesting_shares'
        | 'delete_comment'
        | 'escrow_approve'
        | 'escrow_dispute'
        | 'escrow_release'
        | 'escrow_transfer'
        | 'feed_publish'
        | 'limit_order_cancel'
        | 'limit_order_create'
        | 'limit_order_create2'
        | 'pow'
        | 'pow2'
        | 'prove_authority'
        | 'recover_account'
        | 'report_over_production'
        | 'request_account_recovery'
        | 'reset_account'
        | 'set_reset_account'
        | 'set_withdraw_vesting_route'
        | 'transfer'
        | 'transfer_from_savings'
        | 'transfer_to_savings'
        | 'transfer_to_vesting'
        | 'vote'
        | 'withdraw_vesting'
        | 'witness_update'

/**
 * Generic operation.
 */
export interface Operation {
    0: OperationName
    1: {[key: string]: any}
}

export interface AppliedOperation {
   trx_id: string
   block: number
   trx_in_block: number
   op_in_trx: number
   virtual_op: number
   timestamp: string
   op: Operation
}

export interface VoteOperation extends Operation {
    0: 'vote'
    1: {
        voter: string
        author: string
        permlink: string
        weight: number, // int16
    }
}

export interface CommentOperation extends Operation {
    0: 'comment'
    1: {
        parent_author: string
        parent_permlink: string
        author: string
        permlink: string
        title: string
        body: string
        json_metadata: string,
    }
}

export interface DelegateVestingSharesOperation extends Operation {
    0: 'comment'
    1: {
        /**
         * The account delegating vesting shares.
         */
        delegator: string,
        /**
         * The account receiving vesting shares.
         */
        delegatee: string,
        /**
         * The amount of vesting shares delegated.
         */
        vesting_shares: string | Asset,
    }
}

export interface CustomOperation extends Operation {
    0: 'custom'
    1: {
        required_auths: string[]
        id: number // uint16
        data: Buffer | HexBuffer
    }
}

export interface TransferToSavingsOperation extends Operation {
    0: 'transfer_to_savings'
    1: {
        amount: string
        from: string
        memo: string
        request_id: number
        to: string,
    }
}

const Serializers: {[name: string]: (buffer: ByteBuffer, data: Operation[1]) => void} = {}

Serializers.vote = (buffer: ByteBuffer, data: VoteOperation[1]) => {
    buffer.writeVarint32(0) // id
    buffer.writeVString(data.voter)
    buffer.writeVString(data.author)
    buffer.writeVString(data.permlink)
    buffer.writeInt16(data.weight)
}

Serializers.comment = (buffer: ByteBuffer, data: CommentOperation[1]) => {
    buffer.writeVarint32(1) // id
    buffer.writeVString(data.parent_author)
    buffer.writeVString(data.parent_permlink)
    buffer.writeVString(data.author)
    buffer.writeVString(data.permlink)
    buffer.writeVString(data.title)
    buffer.writeVString(data.body)
    buffer.writeVString(data.json_metadata)
}

Serializers.delegate_vesting_shares = (buffer: ByteBuffer, data: DelegateVestingSharesOperation[1]) => {
    buffer.writeVarint32(40)
    buffer.writeVString(data.delegator)
    buffer.writeVString(data.delegatee)
    let asset = data.vesting_shares
    if (!(asset instanceof Asset)) {
        asset = Asset.fromString(asset)
    }
    asset.writeTo(buffer)
}

Serializers.custom = (buffer: ByteBuffer, data: CustomOperation[1]) => {
    buffer.writeVarint32(15)
    buffer.writeVarint32(data.required_auths.length)
    for (const auth of data.required_auths) {
        buffer.writeVString(auth)
    }
    buffer.writeUint16(data.id)
    if (data.data instanceof HexBuffer) {
        buffer.writeVarint32(data.data.buffer.length)
        buffer.append(data.data.buffer)
    } else {
        buffer.writeVarint32(data.data.length)
        buffer.append(data.data)
    }
}

export function serializeOperation(buffer: ByteBuffer, operation: Operation) {
    const serializer = Serializers[operation[0]]
    if (!serializer) {
        throw new Error(`No serializer for operation: ${ operation[0] }`)
    }
    serializer(buffer, operation[1])
}
