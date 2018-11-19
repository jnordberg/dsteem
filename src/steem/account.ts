/**
 * @file Steem account type definitions.
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

import {PublicKey} from './../crypto'
import {Asset} from './asset'

export interface AuthorityType {
    weight_threshold: number // uint32_t
    account_auths: Array<[string, number]> // flat_map< account_name_type, uint16_t >
    key_auths: Array<[string | PublicKey, number]>// flat_map< public_key_type, uint16_t >
}

export class Authority implements AuthorityType {

    /**
     * Convenience to create a new instance from PublicKey or authority object.
     */
    public static from(value: string | PublicKey | AuthorityType) {
        if (value instanceof Authority) {
            return value
        } else if (typeof value === 'string' || value instanceof PublicKey) {
            return new Authority({
                account_auths: [],
                key_auths: [[value, 1]],
                weight_threshold: 1,
            })
        } else {
            return new Authority(value)
        }
    }

    public weight_threshold: number
    public account_auths: Array<[string, number]>
    public key_auths: Array<[string | PublicKey, number]>

    constructor({weight_threshold, account_auths, key_auths}: AuthorityType) {
        this.weight_threshold = weight_threshold
        this.account_auths = account_auths
        this.key_auths = key_auths
    }
}

export interface Account {
    id: number // account_id_type
    name: string // account_name_type
    owner: Authority
    active: Authority
    posting: Authority
    memo_key: string // public_key_type
    json_metadata: string
    proxy: string // account_name_type
    last_owner_update: string // time_point_sec
    last_account_update: string // time_point_sec
    created: string // time_point_sec
    mined: boolean
    owner_challenged: boolean
    active_challenged: boolean
    last_owner_proved: string // time_point_sec
    last_active_proved: string // time_point_sec
    recovery_account: string // account_name_type
    reset_account: string // account_name_type
    last_account_recovery: string // time_point_sec
    comment_count: number // uint32_t
    lifetime_vote_count: number // uint32_t
    post_count: number // uint32_t
    can_vote: boolean
    voting_power: number // uint16_t
    last_vote_time: string // time_point_sec
    voting_manabar: {
        current_mana: string | number,
        last_update_time: number
    },
    balance: string | Asset
    savings_balance: string | Asset
    sbd_balance: string | Asset
    sbd_seconds: string // uint128_t
    sbd_seconds_last_update: string // time_point_sec
    sbd_last_interest_payment: string // time_point_sec
    savings_sbd_balance: string | Asset // asset
    savings_sbd_seconds: string // uint128_t
    savings_sbd_seconds_last_update: string // time_point_sec
    savings_sbd_last_interest_payment: string // time_point_sec
    savings_withdraw_requests: number // uint8_t
    reward_sbd_balance: string | Asset
    reward_steem_balance: string | Asset
    reward_vesting_balance: string | Asset
    reward_vesting_steem: string | Asset
    curation_rewards: number | string // share_type
    posting_rewards: number | string // share_type
    vesting_shares: string | Asset
    delegated_vesting_shares: string | Asset
    received_vesting_shares: string | Asset
    vesting_withdraw_rate: string | Asset
    next_vesting_withdrawal: string // time_point_sec
    withdrawn: number | string // share_type
    to_withdraw: number | string // share_type
    withdraw_routes: number // uint16_t
    proxied_vsf_votes: number[] // vector< share_type >
    witnesses_voted_for: number // uint16_t
    average_bandwidth: number | string // share_type
    lifetime_bandwidth: number | string // share_type
    last_bandwidth_update: string // time_point_sec
    average_market_bandwidth: number | string // share_type
    lifetime_market_bandwidth: number | string // share_type
    last_market_bandwidth_update: string // time_point_sec
    last_post: string // time_point_sec
    last_root_post: string // time_point_sec
}

export interface ExtendedAccount extends Account {
    /**
     * Convert vesting_shares to vesting steem.
     */
    vesting_balance: string | Asset
    reputation: string | number // share_type
    /**
     * Transfer to/from vesting.
     */
    transfer_history: any[] // map<uint64_t,applied_operation>
    /**
     * Limit order / cancel / fill.
     */
    market_history: any[] // map<uint64_t,applied_operation>
    post_history: any[] // map<uint64_t,applied_operation>
    vote_history: any[] // map<uint64_t,applied_operation>
    other_history: any[] // map<uint64_t,applied_operation>
    witness_votes: string[] // set<string>
    tags_usage: string[] // vector<pair<string,uint32_t>>
    guest_bloggers: string[] // vector<pair<account_name_type,uint32_t>>
    open_orders?: any[] // optional<map<uint32_t,extended_limit_order>>
    comments?: any[] /// permlinks for this user // optional<vector<string>>
    blog?: any[] /// blog posts for this user // optional<vector<string>>
    feed?: any[] /// feed posts for this user // optional<vector<string>>
    recent_replies?: any[] /// blog posts for this user // optional<vector<string>>
    recommended?: any[] /// posts recommened for this user // optional<vector<string>>
}
