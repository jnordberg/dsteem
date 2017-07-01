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
import {AssetString} from './../steem/asset'
import {BlockHeader, SignedBlock} from './../steem/block'
import {Bignum} from './../steem/misc'
import {AppliedOperation} from './../steem/operation'

export interface DynamicGlobalPropertyObject {
    id: number
    /**
     * Current block height.
     */
    head_block_number: number
    head_block_id: string
    /**
     * UTC Server time, e.g. 2020-01-15T00:42:00
     */
    time: string
    /**
     * Currently elected witness.
     */
    current_witness: string
    /**
     * The total POW accumulated, aka the sum of num_pow_witness at the time
     * new POW is added.
     */
    total_pow: number
    /**
     * The current count of how many pending POW witnesses there are, determines
     * the difficulty of doing pow.
     */
    num_pow_witnesses: number
    virtual_supply: AssetString
    current_supply: AssetString
    /**
     * Total asset held in confidential balances.
     */
    confidential_supply: AssetString
    current_sbd_supply: AssetString
    /**
     * Total asset held in confidential balances.
     */
    confidential_sbd_supply: AssetString
    total_vesting_fund_steem: AssetString
    total_vesting_shares: AssetString
    total_reward_fund_steem: AssetString
    /**
     * The running total of REWARD^2.
     */
    total_reward_shares2: string
    pending_rewarded_vesting_shares: AssetString
    pending_rewarded_vesting_steem: AssetString
    /**
     * This property defines the interest rate that SBD deposits receive.
     */
    sbd_interest_rate: number
    sbd_print_rate: number
    /**
     *  Average block size is updated every block to be:
     *
     *     average_block_size = (99 * average_block_size + new_block_size) / 100
     *
     *  This property is used to update the current_reserve_ratio to maintain
     *  approximately 50% or less utilization of network capacity.
     */
    average_block_size: number
    /**
     * Maximum block size is decided by the set of active witnesses which change every round.
     * Each witness posts what they think the maximum size should be as part of their witness
     * properties, the median size is chosen to be the maximum block size for the round.
     *
     * @note the minimum value for maximum_block_size is defined by the protocol to prevent the
     * network from getting stuck by witnesses attempting to set this too low.
     */
    maximum_block_size: number
    /**
     * The current absolute slot number. Equal to the total
     * number of slots since genesis. Also equal to the total
     * number of missed slots plus head_block_number.
     */
    current_aslot: number
    /**
     * Used to compute witness participation.
     */
    recent_slots_filled: Bignum
    participation_count: number
    last_irreversible_block_num: number
    /**
     * The maximum bandwidth the blockchain can support is:
     *
     *    max_bandwidth = maximum_block_size * STEEMIT_BANDWIDTH_AVERAGE_WINDOW_SECONDS / STEEMIT_BLOCK_INTERVAL
     *
     * The maximum virtual bandwidth is:
     *
     *    max_bandwidth * current_reserve_ratio
     */
    max_virtual_bandwidth: Bignum
    /**
     * Any time average_block_size <= 50% maximum_block_size this value grows by 1 until it
     * reaches STEEMIT_MAX_RESERVE_RATIO.  Any time average_block_size is greater than
     * 50% it falls by 1%.  Upward adjustments happen once per round, downward adjustments
     * happen every block.
     */
    current_reserve_ratio: number
    /**
     * The number of votes regenerated per day.  Any user voting slower than this rate will be
     * "wasting" voting power through spillover; any user voting faster than this rate will have
     * their votes reduced.
     */
    vote_power_reserve_rate: number
}

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

export interface Comment {
    id: number // comment_id_type
    category: string
    parent_author: string // account_name_type
    parent_permlink: string
    author: string // account_name_type
    permlink: string
    title: string
    body: string
    json_metadata: string
    last_update: string // time_point_sec
    created: string // time_point_sec
    active: string // time_point_sec
    last_payout: string // time_point_sec
    depth: number // uint8_t
    children: number // uint32_t
    net_rshares: string // share_type
    abs_rshares: string // share_type
    vote_rshares: string // share_type
    children_abs_rshares: string // share_type
    cashout_time: string // time_point_sec
    max_cashout_time: string // time_point_sec
    total_vote_weight: number // uint64_t
    reward_weight: number // uint16_t
    total_payout_value: AssetString
    curator_payout_value: AssetString
    author_rewards: string // share_type
    net_votes: number // int32_t
    root_comment: number // comment_id_type
    max_accepted_payout: string // asset
    percent_steem_dollars: number // uint16_t
    allow_replies: boolean
    allow_votes: boolean
    allow_curation_rewards: boolean
    beneficiaries: any[] // beneficiary_route_type[]
}

/**
 * Discussion a.k.a. Post.
 */
export interface Discussion extends Comment {
    url: string // /category/@rootauthor/root_permlink#author/permlink
    root_title: string
    pending_payout_value: AssetString
    total_pending_payout_value: AssetString
    active_votes: any[] // vote_state[]
    replies: string[] /// author/slug mapping
    author_reputation: number // share_type
    promoted: AssetString
    body_length: Bignum
    reblogged_by: any[] // account_name_type[]
    first_reblogged_by?: any // account_name_type
    first_reblogged_on?: any // time_point_sec
}

export class DatabaseAPI {

    constructor(readonly client: Client) {}

    /**
     * Convenience for calling `database_api`.
     */
    public call(method: string, params?: any[]) {
        return this.client.call('database_api', method, params)
    }

    /**
     * Return state of server.
     */
    public getDynamicGlobalProperties(): Promise<DynamicGlobalPropertyObject> {
        return this.call('get_dynamic_global_properties')
    }

    /**
     * Return server config. See:
     * https://github.com/steemit/steem/blob/master/libraries/protocol/include/steemit/protocol/config.hpp
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
     * Return array of discussions.
     * @param by The type of sorting for the discussions, valid options are:
     *           `active` `blog` `cashout` `children` `comments` `created`
     *           `feed` `hot` `promoted` `trending` `votes`. Note that
     *           for `blog` and `feed` the tag is set to a username.
     */
    public getDiscussions(by: string, query: DisqussionQuery): Promise<Discussion[]> {
        return this.call(`get_discussions_by_${ by }`, [query])
    }

}
