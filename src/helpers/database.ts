/**
 * @file Database API helpers.
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

import {Client} from './../client'
import {ExtendedAccount} from './../steem/account'
import {Asset, Price} from './../steem/asset'
import {BlockHeader, SignedBlock} from './../steem/block'
import {Discussion} from './../steem/comment'
import {DynamicGlobalProperties} from './../steem/misc'
import {ChainProperties, VestingDelegation} from './../steem/misc'
import {AppliedOperation} from './../steem/operation'
import {SignedTransaction, Transaction, TransactionConfirmation} from './../steem/transaction'

/**
 * Possible categories for `get_discussions_by_*`.
 */
export type DiscussionQueryCategory = 'active' | 'blog' | 'cashout' | 'children' | 'comments' |
                                      'feed' | 'hot' | 'promoted' | 'trending' | 'votes' | 'created'

export interface DisqussionQuery {
    /**
     * Name of author or tag to fetch.
     */
    tag: string
    /**
     * Number of results, max 100.
     */
    limit: number
    filter_tags?: string[]
    select_authors?: string[]
    select_tags?: string[]
    /**
     * Number of bytes of post body to fetch, default 0 (all)
     */
    truncate_body?: number
    /**
     * Name of author to start from, used for paging.
     * Should be used in conjunction with `start_permlink`.
     */
    start_author?: string
    /**
     * Permalink of post to start from, used for paging.
     * Should be used in conjunction with `start_author`.
     */
    start_permlink?: string
    parent_author?: string
    parent_permlink?: string
}

/**
 * Database API
 * ------------
 * API to get data from the blockchain
 *
 * Example:
 * ```js
 * const {Client} = require('dsteem')
 *
 * const client = new Client('https://api.steemit.com')
 *
 * async function main() {
 *   const dgp = await client.database.getDynamicGlobalProperties()
 *   console.log(`The current supply is: ${ dgp.current_supply }`)
 * }
 *
 * main().catch(console.error)
 * ```
 */
export class DatabaseAPI {

    constructor(readonly client: Client) {}

    /**
     * Convenience for calling `database_api`.
     * @param method An updated list of methods can be found at https://github.com/steemit/steem/blob/master/libraries/plugins/apis/condenser_api/condenser_api.cpp
     */
    public call(method: string, params?: any[]) {
        return this.client.call('condenser_api', method, params)
    }

    /**
     * Return state of server.
     */
    public getDynamicGlobalProperties(): Promise<DynamicGlobalProperties> {
        return this.call('get_dynamic_global_properties')
    }

    /**
     * Return median chain properties decided by witness.
     */
    public async getChainProperties(): Promise<ChainProperties> {
        return this.call('get_chain_properties')
    }

    /**
     * Return all of the state required for a particular url path.
     * @param path Path component of url conforming to condenser's scheme
     *             e.g. `@almost-digital` or `trending/travel`
     */
    public async getState(path: string): Promise<any> {
        return this.call('get_state', [path])
    }

    /**
     * Return median price in SBD for 1 STEEM as reported by the witnesses.
     */
    public async getCurrentMedianHistoryPrice(): Promise<Price> {
        return Price.from(await this.call('get_current_median_history_price'))
    }

    /**
     * Get list of delegations made by account.
     * @param account Account delegating
     * @param from Delegatee start offset, used for paging.
     * @param limit Number of results, max 1000.
     */
    public async getVestingDelegations(account: string,
                                       from: string = '',
                                       limit: number = 1000): Promise<VestingDelegation[]> {
        return this.call('get_vesting_delegations', [account, from, limit])
    }

    /**
     * Return server config. See:
     * https://github.com/steemit/steem/blob/master/libraries/protocol/include/steem/protocol/config.hpp
     */
    public getConfig(): Promise<{[name: string]: string|number|boolean}> {
        return this.call('get_config')
    }

    /**
     * Return header for *blockNum*.
     */
    public getBlockHeader(blockNum: number): Promise<BlockHeader> {
        return this.call('get_block_header', [blockNum])
    }

    /**
     * Return block *blockNum*.
     */
    public getBlock(blockNum: number): Promise<SignedBlock> {
        return this.call('get_block', [blockNum])
    }

    /**
     * Return all applied operations in *blockNum*.
     */
    public getOperations(blockNum: number, onlyVirtual: boolean = false): Promise<AppliedOperation[]> {
        return this.call('get_ops_in_block', [blockNum, onlyVirtual])
    }

    /**
     * Return array of discussions (a.k.a. posts).
     * @param by The type of sorting for the discussions, valid options are:
     *           `active` `blog` `cashout` `children` `comments` `created`
     *           `feed` `hot` `promoted` `trending` `votes`. Note that
     *           for `blog` and `feed` the tag is set to a username.
     */
    public getDiscussions(by: DiscussionQueryCategory, query: DisqussionQuery): Promise<Discussion[]> {
        return this.call(`get_discussions_by_${ by }`, [query])
    }

    /**
     * Return array of account info objects for the usernames passed.
     * @param usernames The accounts to fetch.
     */
    public getAccounts(usernames: string[]): Promise<ExtendedAccount[]> {
        return this.call('get_accounts', [usernames])
    }

    /**
     * Convenience to fetch a block and return a specific transaction.
     */
    public async getTransaction(txc: TransactionConfirmation | {block_num: number, id: string}) {
        const block = await this.client.database.getBlock(txc.block_num)
        const idx = block.transaction_ids.indexOf(txc.id)
        if (idx === -1) {
            throw new Error(`Unable to find transaction ${ txc.id } in block ${ txc.block_num }`)
        }
        return block.transactions[idx] as SignedTransaction
    }

    /**
     * Verify signed transaction.
     */
    public async verifyAuthority(stx: SignedTransaction): Promise<boolean> {
        return this.call('verify_authority', [stx])
    }

}
