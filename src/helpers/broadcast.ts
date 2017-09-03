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
import {PrivateKey, PublicKey, signTransaction} from './../crypto'
import {Authority, AuthorityType} from './../steem/account'
import {Asset} from './../steem/asset'
import {getVestingSharePrice, HexBuffer} from './../steem/misc'
import {
    AccountCreateOperation,
    AccountCreateWithDelegationOperation,
    AccountUpdateOperation,
    CommentOperation,
    CommentOptionsOperation,
    CustomJsonOperation,
    DelegateVestingSharesOperation,
    Operation,
    TransferOperation,
    VoteOperation,
} from './../steem/operation'
import {SignedTransaction, Transaction, TransactionConfirmation} from './../steem/transaction'

export interface CreateAccountOptions {
    /**
     * Username for the new account.
     */
    username: string
    /**
     * Password for the new account, if set, all keys will be derived from this.
     */
    password?: string
    /**
     * Account authorities, used to manually set account keys.
     * Can not be used together with the password option.
     */
    auths?: {
        owner: AuthorityType | string | PublicKey
        active: AuthorityType | string | PublicKey
        posting: AuthorityType | string | PublicKey
        memoKey: PublicKey | string
    }
    /**
     * Creator account, fee will be deducted from this and the key to sign
     * the transaction must be the creators active key.
     */
    creator: string,
    /**
     * Account creation fee. If omitted fee will be set to lowest possible.
     */
    fee?: string | Asset | number
    /**
     * Account delegation, amount of VESTS to delegate to the new account.
     * If omitted the delegation amount will be the lowest possible based
     * on the fee. Can be set to zero to disable delegation.
     */
    delegation?: string | Asset | number
    /**
     * Optional account meta-data.
     */
    metadata?: {[key: string]: any}
}

interface PendingCallback {
    resolve: (confirmation: TransactionConfirmation) => void
    reject: (error: Error) => void
}

export class BroadcastAPI {

    /**
     * How many milliseconds in the future to set the expiry time to when
     * broadcasting a transaction, defaults to 1 minute.
     */
    public expireTime = 60 * 1000

    private pendingCallbacks = new Map<number, PendingCallback>()

    constructor(readonly client: Client) {
        this.client.addListener('notice', this.noticeHandler)
        this.client.addListener('close', this.closeHandler)
    }

    /**
     * Broadcast a comment, also used to create a new top level post.
     * @param comment The comment/post.
     * @param key Private posting key of comment author.
     */
    public async comment(comment: CommentOperation[1], key: PrivateKey) {
        const op: Operation = ['comment', comment]
        return this.sendOperations([op], key)
    }

    /**
     * Broadcast a comment and set the options.
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
     * Broadcast a vote.
     * @param vote The vote to send.
     * @param key Private posting key of the voter.
     */
    public async vote(vote: VoteOperation[1], key: PrivateKey) {
        const op: Operation = ['vote', vote]
        return this.sendOperations([op], key)
    }

    /**
     * Broadcast a transfer.
     * @param data The transfer operation payload.
     * @param key Private active key of sender.
     */
    public async transfer(data: TransferOperation[1], key: PrivateKey) {
        const op: Operation = ['transfer', data]
        return this.sendOperations([op], key)
    }

    /**
     * Broadcast custom JSON.
     * @param data The custom_json operation payload.
     * @param key Private posting or active key.
     */
    public async json(data: CustomJsonOperation[1], key: PrivateKey) {
        const op: Operation = ['custom_json', data]
        return this.sendOperations([op], key)
    }

    /**
     * Create a new account.
     * @param options New account options.
     * @param key Private active key of account creator.
     */
    public async createAccount(options: CreateAccountOptions, key: PrivateKey) {
        const {username, metadata, creator} = options
        const prefix = this.client.addressPrefix
        let owner: Authority, active: Authority, posting: Authority, memo_key: PublicKey
        if (options.password) {
            const ownerKey = PrivateKey.fromLogin(username, options.password, 'owner').createPublic(prefix)
            owner = Authority.from(ownerKey)
            const activeKey = PrivateKey.fromLogin(username, options.password, 'active').createPublic(prefix)
            active = Authority.from(activeKey)
            const postingKey = PrivateKey.fromLogin(username, options.password, 'posting').createPublic(prefix)
            posting = Authority.from(postingKey)
            memo_key = PrivateKey.fromLogin(username, options.password, 'memo').createPublic(prefix)
        } else if (options.auths) {
            owner = Authority.from(options.auths.owner)
            active = Authority.from(options.auths.active)
            posting = Authority.from(options.auths.posting)
            memo_key = PublicKey.from(options.auths.memoKey, prefix)
        } else {
            throw new Error('Must specify either password or auths')
        }

        let {fee, delegation} = options
        if (fee === undefined || delegation === undefined) {
            const [dynamicProps, chainProps] = await Promise.all([
                this.client.database.getDynamicGlobalProperties(),
                this.client.database.getChainProperties(),
            ])

            const sharePrice = getVestingSharePrice(dynamicProps)
            const creationFee = Asset.from(chainProps.account_creation_fee)
            const modifier = 30 // STEEMIT_CREATE_ACCOUNT_WITH_STEEM_MODIFIER
            const ratio = 5 // STEEMIT_CREATE_ACCOUNT_DELEGATION_RATIO

            const targetDelegation = sharePrice.convert(creationFee.multiply(modifier * ratio))

            if (delegation !== undefined && fee === undefined) {
                delegation = Asset.from(delegation, 'VESTS')
                fee = Asset.max(
                    sharePrice.convert(targetDelegation.subtract(delegation)).divide(ratio),
                    creationFee,
                )
            } else {
                fee = Asset.from(fee || creationFee, 'STEEM')
                delegation = Asset.max(
                    targetDelegation.subtract(sharePrice.convert(fee.multiply(ratio))),
                    Asset.from(0, 'VESTS'),
                )
            }
        }
        const op: AccountCreateWithDelegationOperation = ['account_create_with_delegation', {
            active, creator,
            delegation: Asset.from(delegation, 'VESTS'),
            extensions: [],
            fee: Asset.from(fee, 'STEEM'),
            json_metadata: metadata ? JSON.stringify(metadata) : '',
            memo_key,
            new_account_name: username,
            owner, posting,
        }]
        return this.sendOperations([op], key)
    }

    /**
     * Update account.
     * @param data The account_update payload.
     * @param key The private key of the account affected, should be the corresponding
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

        const tx: Transaction = {
            expiration,
            extensions,
            operations,
            ref_block_num,
            ref_block_prefix,
        }

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
