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

import {PublicKey} from './../crypto'
import {Authority} from './account'
import {Asset, Price} from './asset'
import {BeneficiaryRoute} from './comment'
import {HexBuffer} from './misc'

/**
 * Transaction operation name.
 */
export type OperationName = // <id>
        | 'account_create' // 9
        | 'account_create_with_delegation' // 41
        | 'account_update' // 10
        | 'account_witness_proxy' // 13
        | 'account_witness_vote' // 12
        | 'author_reward' // 43
        | 'cancel_transfer_from_savings' // 34
        | 'challenge_authority' // 22
        | 'change_recovery_account' // 26
        | 'claim_reward_balance' // 39
        | 'comment' // 1
        | 'comment_benefactor_reward' // 55
        | 'comment_options' // 19
        | 'comment_payout_update' // 53
        | 'comment_reward' // 45
        | 'convert' // 8
        | 'curation_reward' // 44
        | 'custom' // 15
        | 'custom_binary' // 35
        | 'custom_json' // 18
        | 'decline_voting_rights' // 36
        | 'delegate_vesting_shares' // 40
        | 'delete_comment' // 17
        | 'escrow_approve' // 31
        | 'escrow_dispute' // 28
        | 'escrow_release' // 29
        | 'escrow_transfer' // 27
        | 'feed_publish' // 7
        | 'fill_convert_request' // 42
        | 'fill_order' // 49
        | 'fill_transfer_from_savings' // 51
        | 'fill_vesting_withdraw' // 48
        | 'hardfork' // 52
        | 'interest' // 47
        | 'limit_order_cancel' // 6
        | 'limit_order_create' // 5
        | 'limit_order_create2' // 21
        | 'liquidity_reward' // 46
        | 'pow' // 14
        | 'pow2' // 30
        | 'prove_authority' // 23
        | 'recover_account' // 25
        | 'report_over_production' // 16
        | 'request_account_recovery' // 24
        | 'reset_account' // 37
        | 'return_vesting_delegation' // 54
        | 'set_reset_account' // 38
        | 'set_withdraw_vesting_route' // 20
        | 'shutdown_witness' // 50
        | 'transfer' // 2
        | 'transfer_from_savings' // 33
        | 'transfer_to_savings' // 32
        | 'transfer_to_vesting' // 3
        | 'vote' // 0
        | 'withdraw_vesting' // 4
        | 'witness_update' // 11

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
    0: 'delegate_vesting_shares'
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
        data: Buffer | HexBuffer,
    }
}

export interface CustomJsonOperation extends Operation {
    0: 'custom_json'
    1: {
        required_auths: string[] // flat_set< account_name_type >
        required_posting_auths: string[] // flat_set< account_name_type >
        /** ID string, must be less than 32 characters long. */
        id: string
        /** JSON encoded string, must be valid JSON. */
        json: string,
    }
}

export interface TransferOperation extends Operation {
    0: 'transfer'
    1: {
        /** Sending account name. */
        from: string // account_name_type
        /** Receiving account name. */
        to: string // account_name_type
        /** Amount of STEEM or SBD to send. */
        amount: string | Asset
        /** Plain-text note attached to transaction.  */
        memo: string,
    }
}

export interface AccountCreateOperation extends Operation {
    0: 'account_create'
    1: {
        fee: string | Asset
        creator: string // account_name_type
        new_account_name: string // account_name_type
        owner: Authority
        active: Authority
        posting: Authority
        memo_key: string | PublicKey // public_key_type
        json_metadata: string,
    }
}

export interface AccountCreateWithDelegationOperation extends Operation {
    0: 'account_create_with_delegation'
    1: {
        fee: string | Asset
        delegation: string | Asset
        creator: string // account_name_type
        new_account_name: string // account_name_type
        owner: Authority
        active: Authority
        posting: Authority
        memo_key: string | PublicKey // public_key_type
        json_metadata: string,
        extensions: any[],
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

export interface AccountUpdateOperation extends Operation {
    0: 'account_update' // 10
    1: {
        account: string // account_name_type
        owner?: Authority // optional< authority >
        active?: Authority // optional< authority >
        posting?: Authority // optional< authority >
        memo_key: string | PublicKey // public_key_type
        json_metadata: string,
    }
}

export interface CommentOptionsOperation extends Operation {
    0: 'comment_options' // 19
    1: {
      author: string // account_name_type
      permlink: string
      /** SBD value of the maximum payout this post will receive. */
      max_accepted_payout: Asset | string
      /** The percent of Steem Dollars to key, unkept amounts will be received as Steem Power. */
      percent_steem_dollars: number // uint16_t
      /** Whether to allow post to receive votes. */
      allow_votes: boolean
      /** Whether to allow post to recieve curation rewards. */
      allow_curation_rewards: boolean
      extensions: Array<[0, {beneficiaries: BeneficiaryRoute[]}]>, // flat_set< comment_options_extension >
    }
}

export interface FeedPublishOperation extends Operation {
    0: 'feed_publish' // 7
    1: {
      publisher: string // account_name_type
      exchange_rate: Price | {base: Asset | string, quote: Asset | string},
    }
}

export interface ConvertOperation extends Operation {
    0: 'convert' // 8
    1: {
        owner: string // account_name_type
        requestid: number // uint32_t
        amount: Asset | string,
    }
}
