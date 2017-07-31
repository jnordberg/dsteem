/**
 * @file Broadcast API helpers.
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

import {Client} from './../client'
import {PrivateKey, signTransaction} from './../crypto'
import {Asset} from './../steem/asset'
import {HexBuffer} from './../steem/misc'
import {
    AccountCreateOperation,
    CommentOperation,
    CommentOptionsOperation,
    CustomJsonOperation,
    DelegateVestingSharesOperation,
    AccountUpdateOperation,
    Operation,
    TransferOperation,
    VoteOperation,
} from './../steem/operation'
import {SignedTransaction, Transaction, TransactionConfirmation} from './../steem/transaction'

export interface CreateLoginOptions {
    /**
     * Username for the new account.
     */
    username: string,
    /**
     * Password for the new account, all keys will be derived from this.
     */
    password: string,
    /**
     * Creator account, fee will be deducted from this and the key to sign
     * the transaction must be the creators active key.
     */
    creator: string,
    /**
     * Account creation fee. If omitted fee will be set to lowest possible.
     */
    fee?: string | Asset
    /**
     * Optional account metadata.
     */
    metadata?: {[key: string]: any}
}

interface PendingCallback {
    resolve: (confirmation: TransactionConfirmation) => void
    reject: (error: Error) => void
}

export class BroadcastAPI {

    /**
     * How many milliseconds to set transaction expiry from now when sending a transaction.
     */
    public expireTime = 60 * 1000

    private pendingCallbacks = new Map<number, PendingCallback>()

    constructor(readonly client: Client) {
        this.client.addListener('notice', this.noticeHandler)
        this.client.addListener('close', this.closeHandler)
    }

    /**
     * Brodcast a comment, also used to create a new top level post.
     * @param comment The comment/post.
     * @param key Private posting key of comment author.
     */
    public async comment(comment: CommentOperation[1], key: PrivateKey) {
        const op: Operation = ['comment', comment]
        return this.sendOperations([op], key)
    }

    /**
     * Brodcast a comment and set the options.
     * @param comment The comment/post.
     * @param options The comment/post options.
     * @param key Private posting key of comment author.
     */
    public async commentWithOptions(comment: CommentOperation[1],
                                    options: CommentOptionsOperation[1],
                                    key: PrivateKey) {
        const ops: Operation[] = [
            ['comment', comment],
            ['comment_options', options],
        ]
        return this.sendOperations(ops, key)
    }

    /**
     * Brodcast a vote.
     * @param vote The vote to send.
     * @param key Private posting key of the voter.
     */
    public async vote(vote: VoteOperation[1], key: PrivateKey) {
        const op: Operation = ['vote', vote]
        return this.sendOperations([op], key)
    }

    /**
     * Brodcast a transfer.
     * @param data The transfer operation payload.
     * @param key Private active key of sender.
     */
    public async transfer(data: TransferOperation[1], key: PrivateKey) {
        const op: Operation = ['transfer', data]
        return this.sendOperations([op], key)
    }

    /**
     * Brodcast custom JSON.
     * @param data The custom_json operation payload.
     * @param key Private posting or active key.
     */
    public async json(data: CustomJsonOperation[1], key: PrivateKey) {
        const op: Operation = ['custom_json', data]
        return this.sendOperations([op], key)
    }

    /**
     * Create a new account.
     * @param data The account_create operation payload.
     * @param key Private active key of account creator.
     */
    public async createAccount(data: AccountCreateOperation[1], key: PrivateKey) {
        const op: Operation = ['account_create', data]
        return this.sendOperations([op], key)
    }

    /**
     * Convenience to create a new account with username and password.
     * @param options New account options.
     * @param key Private active key of account creator.
     */
    public async createLogin(options: CreateLoginOptions, key: PrivateKey) {
        const {username, password, metadata, creator} = options
        const prefix = this.client.addressPrefix
        const ownerKey = PrivateKey.fromLogin(username, password, 'owner').createPublic(prefix)
        const activeKey = PrivateKey.fromLogin(username, password, 'active').createPublic(prefix)
        const postingKey = PrivateKey.fromLogin(username, password, 'posting').createPublic(prefix)
        const memoKey = PrivateKey.fromLogin(username, password, 'memo').createPublic(prefix)
        let fee = options.fee
        if (!fee) {
            const chainProps = await this.client.database.getChainProperties()
            const modifier = 30 // STEEMIT_CREATE_ACCOUNT_WITH_STEEM_MODIFIER
            fee = Asset.from(chainProps.account_creation_fee).multiply(modifier)
        }
        return this.createAccount({
            active: {weight_threshold: 1, account_auths: [], key_auths: [[activeKey, 1]]},
            creator, fee,
            json_metadata: metadata ? JSON.stringify(metadata) : '',
            memo_key: memoKey,
            new_account_name: username,
            owner: {weight_threshold: 1, account_auths: [], key_auths: [[ownerKey, 1]]},
            posting: {weight_threshold: 1, account_auths: [], key_auths: [[postingKey, 1]]},
        }, key)
    }


    /**
     * Update account.
     * @param data The account_update payload.
     * @param key The private key of the account affected, should be the correspinding
     *            key level or higher for updating account authorities.
     */
    public async updateAccount(data: AccountUpdateOperation[1], key: PrivateKey) {
        const op: Operation = ['account_update', data]
        return this.sendOperations([op], key)
    }

    /**
     * Delegate vesting shares from one account to the other. The vesting shares are still owned
     * by the original account, but content voting rights and bandwidth allocation are transferred
     * to the receiving account. This sets the delegation to `vesting_shares`, increasing it or
     * decreasing it as needed. (i.e. a delegation of 0 removes the delegation)
     *
     * When a delegation is removed the shares are placed in limbo for a week to prevent a satoshi
     * of VESTS from voting on the same content twice.
     *
     * @param options Delegation options.
     * @param key Private active key of the delegator.
     */
    public async delegateVestingShares(options: DelegateVestingSharesOperation[1], key: PrivateKey) {
        const op: Operation = ['delegate_vesting_shares', options]
        return this.sendOperations([op], key)
    }

    /**
     * Sign and broadcast transaction with operations to the network. Throws if the transaction expires.
     * @param operations List of operations to send.
     * @param key Private key used to sign transaction.
     */
     public async sendOperations(operations: Operation[], key: PrivateKey): Promise<TransactionConfirmation> {
        const props = await this.client.database.getDynamicGlobalProperties()

        const ref_block_num = props.head_block_number & 0xFFFF
        const ref_block_prefix = Buffer.from(props.head_block_id, 'hex').readUInt32LE(4)
        const expiration = new Date(Date.now() + this.expireTime).toISOString().slice(0, -5)
        const extensions = []

        // bit of a hack to ensure any buffers passed serializes as HexBuffer instances
        // ideally users should pass HexBuffer instances but that would be inconvenient
        for (const op of operations) {
            for (const k of Object.keys(op[1])) {
                if (op[1][k] instanceof Buffer) {
                    op[1][k] = new HexBuffer(op[1][k])
                }
            }
        }

        const tx: Transaction = {expiration, extensions, operations, ref_block_num, ref_block_prefix}

        const result = await this.send(signTransaction(tx, key, this.client))
        assert(result.expired === false, 'transaction expired')

        return result
     }

    /**
     * Broadcast a signed transaction to the network.
     */
    public async send(transaction: SignedTransaction): Promise<TransactionConfirmation> {
        const callbackId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        await this.call('broadcast_transaction_with_callback', [callbackId, transaction])
        return this.waitForCallback(callbackId)
    }

    /**
     * Convenience for calling `network_broadcast_api`.
     */
    public call(method: string, params?: any[]) {
        return this.client.call('network_broadcast_api', method, params)
    }

    private waitForCallback(id: number) {
        return new Promise<TransactionConfirmation>((resolve, reject) => {
            this.pendingCallbacks.set(id, {resolve, reject})
        })
    }

    private noticeHandler = (notice: any) => {
        const id = Number.parseInt(notice[0])
        if (Number.isFinite(id) && this.pendingCallbacks.has(id)) {
            const pending = this.pendingCallbacks.get(id) as PendingCallback
            pending.resolve(notice[1][0])
            this.pendingCallbacks.delete(id)
        }
    }

    private closeHandler = () => {
        this.pendingCallbacks.forEach((pending) => {
            pending.reject(new Error('Connection unexpectedly closed'))
        })
        this.pendingCallbacks.clear()
    }

}
