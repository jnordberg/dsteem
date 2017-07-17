/**
 * @file Steem type definitions related to comments and posting.
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

import {Asset} from './asset'

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
    total_payout_value: Asset | string
    curator_payout_value: Asset | string
    author_rewards: string // share_type
    net_votes: number // int32_t
    root_comment: number // comment_id_type
    max_accepted_payout: string // asset
    percent_steem_dollars: number // uint16_t
    allow_replies: boolean
    allow_votes: boolean
    allow_curation_rewards: boolean
    beneficiaries: BeneficiaryRoute[]
}

/**
 * Discussion a.k.a. Post.
 */
export interface Discussion extends Comment {
    url: string // /category/@rootauthor/root_permlink#author/permlink
    root_title: string
    pending_payout_value: Asset | string
    total_pending_payout_value: Asset | string
    active_votes: any[] // vote_state[]
    replies: string[] /// author/slug mapping
    author_reputation: number // share_type
    promoted: Asset | string
    body_length: string // Bignum
    reblogged_by: any[] // account_name_type[]
    first_reblogged_by?: any // account_name_type
    first_reblogged_on?: any // time_point_sec
}

export interface BeneficiaryRoute {
    account: string // account_name_type
    weight: number // uint16_t
}
