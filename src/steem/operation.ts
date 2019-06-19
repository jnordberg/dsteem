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
import {AuthorityType} from './account'
import {Asset, Price, PriceType} from './asset'
import {SignedBlockHeader} from './block'
import {BeneficiaryRoute} from './comment'
import {ChainProperties, HexBuffer} from './misc'

/**
 * Operation name.
 */
export type OperationName = // <id>
    | 'account_create' // 9
    | 'account_create_with_delegation' // 41
    | 'account_update' // 10
    | 'account_witness_proxy' // 13
    | 'account_witness_vote' // 12
    | 'cancel_transfer_from_savings' // 34
    | 'change_recovery_account' // 26
    | 'claim_account' // 22
    | 'claim_reward_balance' // 39
    | 'comment' // 1
    | 'comment_options' // 19
    | 'convert' // 8
    | 'create_claimed_account' // 23
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
    | 'limit_order_cancel' // 6
    | 'limit_order_create' // 5
    | 'limit_order_create2' // 21
    | 'pow' // 14
    | 'pow2' // 30
    | 'recover_account' // 25
    | 'report_over_production' // 16
    | 'request_account_recovery' // 24
    | 'reset_account' // 37
    | 'set_reset_account' // 38
    | 'set_withdraw_vesting_route' // 20
    | 'transfer' // 2
    | 'transfer_from_savings' // 33
    | 'transfer_to_savings' // 32
    | 'transfer_to_vesting' // 3
    | 'vote' // 0
    | 'withdraw_vesting' // 4
    | 'witness_set_properties' // 42
    | 'witness_update' // 11

/**
 * Virtual operation name.
 */
export type VirtualOperationName = // <id>
    | 'author_reward' // 43
    | 'comment_benefactor_reward' // 55
    | 'comment_payout_update' // 53
    | 'comment_reward' // 45
    | 'curation_reward' // 44
    | 'fill_convert_request' // 42
    | 'fill_order' // 49
    | 'fill_transfer_from_savings' // 51
    | 'fill_vesting_withdraw' // 48
    | 'hardfork' // 52
    | 'interest' // 47
    | 'liquidity_reward' // 46
    | 'return_vesting_delegation' // 54
    | 'shutdown_witness' // 50

/**
 * Generic operation
 * -----------------
 * By definition an operation is an array of two elements. The
 * first one is a string with the operation name, and the second
 * one an object with the data.
 *
 * Example:
 * ```js
 * var operation = [
 *   'transfer',
 *   {
 *     from: 'alice',
 *     to: 'bob',
 *     amount: '5.000 STEEM',
 *     memo: 'thank you'
 *   }
 * ]
 * ```
 */
export interface Operation {
    0: OperationName | VirtualOperationName
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

/**
 * Account create operation
 * ------------------------
 *
 * Example:
 * ```js
 * const username = 'alice'
 * const password = 'snack already cactus'
 *
 * const ownerKey = PrivateKey.fromLogin(username, password, 'owner')
 * const activeKey = PrivateKey.fromLogin(username, password, 'active')
 * const postingKey = PrivateKey.fromLogin(username, password, 'posting')
 * const memoKey = PrivateKey.fromLogin(username, password, 'memo')
 *
 * var operation = [
 *   'account_create',
 *   {
 *     fee: '3.000 STEEM',
 *     creator: 'alice',
 *     new_account_name: 'bob',
 *     owner: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[ownerKey.createPublic().toString(), 1]]
 *     },
 *     active: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[activeKey.createPublic().toString(), 1]]
 *     },
 *     posting: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[postingKey.createPublic().toString(), 1]]
 *     },
 *     memo_key: memoKey.createPublic().toString(),
 *     json_metadata: '{}'
 *   }
 * ]
 * ```
 */
export interface AccountCreateOperation extends Operation {
    0: 'account_create'
    1: {
        fee: string | Asset
        creator: string // account_name_type
        new_account_name: string // account_name_type
        owner: AuthorityType
        active: AuthorityType
        posting: AuthorityType
        memo_key: string | PublicKey // public_key_type
        json_metadata: string
    }
}

/**
 * Account create with delegation operation
 * ----------------------------------------
 * This operation is deprecated as of Hardfork 20
 *
 * Example:
 * ```js
 * const username = 'alice'
 * const password = 'snack already cactus'
 *
 * const ownerKey = PrivateKey.fromLogin(username, password, 'owner')
 * const activeKey = PrivateKey.fromLogin(username, password, 'active')
 * const postingKey = PrivateKey.fromLogin(username, password, 'posting')
 * const memoKey = PrivateKey.fromLogin(username, password, 'memo')
 *
 * var operation = [
 *   'account_create_with_delegation',
 *   {
 *     fee: '3.000 STEEM',
 *     delegation: '50.000 STEEM',
 *     creator: 'alice',
 *     new_account_name: 'bob',
 *     owner: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[ownerKey.createPublic().toString(), 1]]
 *     },
 *     active: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[activeKey.createPublic().toString(), 1]]
 *     },
 *     posting: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[postingKey.createPublic().toString(), 1]]
 *     },
 *     memo_key: memoKey.createPublic().toString(),
 *     json_metadata: '{}',
 *     extensions: []
 *   }
 * ]
 * ```
 */
export interface AccountCreateWithDelegationOperation extends Operation {
    0: 'account_create_with_delegation'
    1: {
        fee: string | Asset
        delegation: string | Asset
        creator: string // account_name_type
        new_account_name: string // account_name_type
        owner: AuthorityType
        active: AuthorityType
        posting: AuthorityType
        memo_key: string | PublicKey // public_key_type
        json_metadata: string
        /**
         * Extensions. Not currently used.
         */
        extensions: any[]
    }
}

/**
 * Account update operation
 * ------------------------
 * Operation to update the authorities, memo key and json_metadata.
 * * The authorities owner, active, and posting are optional.
 *
 * Example:
 * ```js
 * const username = 'alice'
 * const password = 'snack already cactus'
 *
 * const ownerKey = PrivateKey.fromLogin(username, password, 'owner')
 * const activeKey = PrivateKey.fromLogin(username, password, 'active')
 * const postingKey = PrivateKey.fromLogin(username, password, 'posting')
 * const memoKey = PrivateKey.fromLogin(username, password, 'memo')
 *
 * var operation = [
 *   'account_update_operation',
 *   {
 *     account: 'alice',
 *     owner: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[ownerKey.createPublic().toString(), 1]]
 *     },
 *     active: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[activeKey.createPublic().toString(), 1]]
 *     },
 *     posting: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[postingKey.createPublic().toString(), 1]]
 *     },
 *     memo_key: memoKey.createPublic().toString(),
 *     json_metadata: '{}'
 *   }
 * ]
 * ```
 */
export interface AccountUpdateOperation extends Operation {
    0: 'account_update' // 10
    1: {
        account: string // account_name_type
        owner?: AuthorityType // optional< authority >
        active?: AuthorityType // optional< authority >
        posting?: AuthorityType // optional< authority >
        memo_key: string | PublicKey // public_key_type
        json_metadata: string
    }
}

/**
 * Account witness proxy operation
 * -------------------------------
 * Operation to set a proxy for voting witnesses.
 *
 * Example:
 * ```js
 * var operation = [
 *   'account_witness_proxy',
 *   {
 *     account: 'alice',
 *     proxy: 'bob'
 *   }
 * ]
 * ```
 */
export interface AccountWitnessProxyOperation extends Operation {
    0: 'account_witness_proxy' // 13
    1: {
        account: string // account_name_type
        proxy: string // account_name_type
    }
}

/**
 * Account witness vote operation
 * ------------------------------
 * Operation to vote for a witness.
 *
 * Example:
 * ```js
 * var operation = [
 *   'account_witness_vote',
 *   {
 *     account: 'alice',
 *     witness: 'bob',
 *     approve: true
 *   }
 * ]
 * ```
 */
export interface AccountWitnessVoteOperation extends Operation {
    0: 'account_witness_vote' // 12
    1: {
        account: string // account_name_type
        witness: string // account_name_type
        approve: boolean
    }
}

/**
 * Cancel transfer from savings operation
 * --------------------------------------
 * Operation to cancel a transfer from savings to balance.
 *
 * Example:
 * ```js
 * var operation = [
 *   'cancel_transfer_from_savings',
 *   {
 *     from: 'alice',
 *     request_id: 32
 *   }
 * ]
 * ```
 * See also [[TransferFromSavingsOperation]]
 */
export interface CancelTransferFromSavingsOperation extends Operation {
    0: 'cancel_transfer_from_savings' // 34
    1: {
        from: string // account_name_type
        request_id: number // uint32_t
    }
}

/**
 * Change recovery account operation
 * ---------------------------------
 * Each account lists another account as their recovery account.
 * The recovery account has the ability to create account_recovery_requests
 * for the account to recover. An account can change their recovery account
 * at any time with a 30 day delay. This delay is to prevent
 * an attacker from changing the recovery account to a malicious account
 * during an attack. These 30 days match the 30 days that an
 * owner authority is valid for recovery purposes.
 *
 * On account creation the recovery account is set either to the creator of
 * the account (The account that pays the creation fee and is a signer on the transaction)
 * or to the empty string if the account was mined. An account with no recovery
 * has the top voted witness as a recovery account, at the time the recover
 * request is created. Note: This does mean the effective recovery account
 * of an account with no listed recovery account can change at any time as
 * witness vote weights. The top voted witness is explicitly the most trusted
 * witness according to stake.
 *
 * Example
 * ```js
 * var operation = [
 *   'change_recovery_account',
 *   {
 *     account_to_recover: 'alice',
 *     new_recovery_account: 'steem',
 *     extensions: []
 *   }
 * ]
 * ```
 */
export interface ChangeRecoveryAccountOperation extends Operation {
    0: 'change_recovery_account' // 26
    1: {
        /**
         * The account that would be recovered in case of compromise.
         */
        account_to_recover: string // account_name_type
        /**
         * The account that creates the recover request.
         */
        new_recovery_account: string // account_name_type
        /**
         * Extensions. Not currently used.
         */
        extensions: any[] // extensions_type
    }
}

/**
 * Claim reward balance operation
 * ------------------------------
 * Operation to claim rewards of posts and comments
 *
 * Example:
 * ```js
 * var operation = [
 *   'claim_reward_balance',
 *   {
 *     account: 'alice',
 *     reward_steem: '4.000 STEEM',
 *     reward_sbd: '1.200 SBD',
 *     reward_vests: '1000.000000 VESTS'
 *   }
 * ]
 * ```
 */
export interface ClaimRewardBalanceOperation extends Operation {
    0: 'claim_reward_balance' // 39
    1: {
        account: string // account_name_type
        reward_steem: string | Asset
        reward_sbd: string | Asset
        reward_vests: string | Asset
    }
}

/**
 * Claim account operation
 * -----------------------
 * Operation to claim an account. Set fee to 0 to claim it from subsidized accounts.
 * Otherwise set the fee defined by witnesses (call `get_witness_schedule` -> `median_props.account_creation_fee`).
 *
 * To create an account use {@link CreateClaimedAccountOperation}
 *
 * Example:
 * ```js
 * var operation = [
 *   'claim_account',
 *   {
 *     creator: 'alice',
 *     fee: '3.000 STEEM',
 *     extensions: []
 *   }
 * ]
 * ```
 */
export interface ClaimAccountOperation extends Operation {
    0: 'claim_account' // 22
    1: {
        creator: string // account_name_type
        fee: string | Asset
        /**
         * Extensions. Not currently used.
         */
        extensions: any[] // extensions_type
    }
}

/**
 * Comment operation
 * -----------------------
 * Operation to create posts and comments.
 * For posts parent_author is empty and parent_permlink is the principal tag.
 * For comments use the actual parent_author and parent_permlink.
 *
 * Example:
 * ```js
 * var metadata = {
 *   tags: ['steem','example','tags'],
 * }
 * var operation = [
 *   'comment',
 *   {
 *     parent_author: '',
 *     parent_permlink: 'steem',
 *     author: 'alice',
 *     permlink: 'my-first-post',
 *     title: 'My first post',
 *     body: 'my post'
 *     json_metadata: JSON.stringify(metadata)
 *   }
 * ]
 * ```
 */
export interface CommentOperation extends Operation {
    0: 'comment' // 1
    1: {
        /**
         * For posts put and empty string. For comments put the parent author
         */
        parent_author: string // account_name_type
        /**
         * For posts put the principal tag here. For comments put the parent permlink
         */
        parent_permlink: string
        author: string // account_name_type
        permlink: string
        title: string
        body: string
        json_metadata: string
    }
}

/**
 * Comment operation
 * -----------------------
 * Operation add options to posts/comments.
 *
 * Example:
 * ```js
 * var extensionBeneficiaries = [
 *   0,
 *   {
 *     beneficiaries: [
 *       {account: 'utopian-io', weight: 1000}, // 10%
 *       {account: 'alice', weight: 1000}
 *     ]
 *   }
 * ]
 * var operation = [
 *   'comment_options',
 *   {
 *     author: 'alice',
 *     permlink: 'my-first-post',
 *     max_accepted_payout: '1000000.000 SBD',
 *     percent_steem_dollars: 10000,
 *     allow_votes: true,
 *     allow_curation_rewards: true,
 *     extensions: [ extensionBeneficiaries ]
 *   }
 * ]
 * ```
 *
 * This operation can be broadcasted in conjuction with the [[CommentOperation]] in the same transaction.
 */
export interface CommentOptionsOperation extends Operation {
    0: 'comment_options' // 19
    1: {
      author: string // account_name_type
      permlink: string
      /** SBD value of the maximum payout this post will receive. */
      max_accepted_payout: Asset | string
      /** The percent of Steem Dollars to key, unkept amounts will be received as Steem Power.
       * Set 10000 for the maximum SBD possible, which is 50% of the total payout
       */
      percent_steem_dollars: number // uint16_t
      /** Whether to allow post to receive votes. */
      allow_votes: boolean
      /** Whether to allow post to recieve curation rewards. */
      allow_curation_rewards: boolean
      extensions: Array<[0, {beneficiaries: BeneficiaryRoute[]}]> // flat_set< comment_options_extension >
    }
}

/**
 * Convert operation
 * -----------------------
 * Operation to convert from SBD to STEEM using the median feed price. The funds are deposited after 3.5 days
 *
 * Example:
 * ```js
 * var operation = [
 *   'convert',
 *   {
 *     owner: 'alice',
 *     requestid: 1
 *     amount: '40.000 SBD'
 *   }
 * ]
 * ```
 */
export interface ConvertOperation extends Operation {
    0: 'convert' // 8
    1: {
        owner: string // account_name_type
        requestid: number // uint32_t
        amount: Asset | string
    }
}

/**
 * Create claimed account operation
 * --------------------------------
 * Operation to create a new account. The user needs to have at least 1 pending_claimed_account
 * (to claim accounts use {@link ClaimAccountOperation})
 *
 * Example:
 * ```js
 * const newuser = 'alice2'
 * const password = 'snack already cactus'
 *
 * const ownerKey = PrivateKey.fromLogin(newuser, password, 'owner')
 * const activeKey = PrivateKey.fromLogin(newuser, password, 'active')
 * const postingKey = PrivateKey.fromLogin(newuser, password, 'posting')
 * const memoKey = PrivateKey.fromLogin(newuser, password, 'memo')
 *
 * var operation = [
 *   'create_claimed_account',
 *   {
 *     creator: 'alice',
 *     new_account_name: newuser,
 *     owner: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[ownerKey.createPublic().toString(), 1]]
 *     },
 *     active: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[activeKey.createPublic().toString(), 1]]
 *     },
 *     posting: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [[postingKey.createPublic().toString(), 1]]
 *     },
 *     memo_key: memoKey.createPublic().toString()
 *     json_metadata: '{}'
 *     extensions: []
 *   }
 * ]
 * ```
 */
export interface CreateClaimedAccountOperation extends Operation {
    0: 'create_claimed_account' // 23
    1: {
        creator: string // account_name_type
        new_account_name: string // account_name_type
        owner: AuthorityType
        active: AuthorityType
        posting: AuthorityType
        memo_key: string | PublicKey // public_key_type
        json_metadata: string
        /**
         * Extensions. Not currently used.
         */
        extensions: any[] // extensions_type
    }
}

/**
 * Custom operation
 * --------------------------------
 * Provides a generic way to add higher level protocols on top of witness consensus.
 * There is no validation for this operation other than that required auths are valid.
 *
 * Maximum data: 8192 bytes
 *
 * Example:
 * ```js
 * var operation = [
 *   'custom',
 *   {
 *     required_auths: ['alice'],
 *     id: 123,
 *     data: Buffer.from('0a627974656d617374657207737465656d697402a3d13897d821144')
 *   }
 * ]
 * ```
 */
export interface CustomOperation extends Operation {
    0: 'custom' // 15
    1: {
        required_auths: string[]
        id: number // uint16
        /**
         * Maximum data: 8192 bytes
         */
        data: Buffer | HexBuffer | number[]
    }
}

/**
 * Custom binary operation
 * --------------------------------
 * The semmantics for this operation are the same as the [[CustomJsonOperation]],
 * but with a binary payload. The json deserialization has a non-trivial cost
 * associated with it. This operation will allow for binary deserialization of
 * plugin operations and should improve overall performance of plugins that chose
 * to use it.
 *
 * Maximum data: 8192 bytes
 *
 * Example:
 * ```js
 * var operation = [
 *   'custom_binary',
 *   {
 *     required_owner_auths: [],
 *     required_active_auths: ['bob'],
 *     required_posting_auths: ['alice','carl'],
 *     required_auths:[],
 *     id: '123',
 *     data: Buffer.from('0a627974656d617374657207737465656d697402a3d13897d821144')
 *   }
 * ]
 * ```
 */
export interface CustomBinaryOperation extends Operation {
    0: 'custom_binary' // 35
    1: {
        required_owner_auths: string[] // flat_set< account_name_type >
        required_active_auths: string[] // flat_set< account_name_type >
        required_posting_auths: string[] // flat_set< account_name_type >
        required_auths: AuthorityType[]
        /**
         * ID string, must be less than 32 characters long.
         */
        id: string
        /**
         * Maximum data: 8192 bytes
         */
        data: Buffer | HexBuffer | number[]
    }
}

/**
 * Custom JSON operation
 * --------------------------------
 * Serves the same purpose as [[Custom]] but also supports required posting authorities.
 * Unlike custom, this operation is designed to be human readable/developer friendly.
 * This operation is also used for follow/unfollow/ignore/resteem events
 *
 * Example:
 * ```js
 * var event = [
 *   'follow',
 *   {
 *     follower:'alice',
 *     following:'bob',
 *     what:['blog']
 *   }
 * ]
 *
 * var operation = [
 *   'custom_json',
 *   {
 *     required_auths: [],
 *     required_posting_auths: ['alice'],
 *     id: 'follow',
 *     json: JSON.stringify(event)
 *   }
 * ]
 * ```
 */
export interface CustomJsonOperation extends Operation {
    0: 'custom_json' // 18
    1: {
        required_auths: string[] // flat_set< account_name_type >
        required_posting_auths: string[] // flat_set< account_name_type >
        /**
         * ID string, must be less than 32 characters long.
         */
        id: string
        /**
         * JSON encoded string, must be valid JSON and less than 8192 characters long
         */
        json: string
    }
}

/**
 * Decline voting rights operation
 * -------------------------------
 * An account can chose to decline their voting rights after a 30 day delay.
 * This includes voting on content and witnesses. The voting rights cannot be
 * acquired again once they have been declined. This is only to formalize a smart
 * contract between certain accounts and the community that currently only exists
 * as a social contract(for instance, 'steem').
 *
 * Example:
 * ```js
 * var operation = [
 *   'decline_voting_rights',
 *   {
 *     account: 'steem',
 *     decline: true
 *   }
 * ]
 * ```
 */
export interface DeclineVotingRightsOperation extends Operation {
    0: 'decline_voting_rights' // 36
    1: {
        account: string // account_name_type
        decline: boolean
    }
}

/**
 * Delegate vesting shares operation
 * ---------------------------------
 * Delegate vesting shares from one account to the other. The vesting
 * shares are still owned by the original account, but content voting
 * rights and resource credit are transferred to the receiving account.
 * This sets the delegation to vesting_shares, increasing it or decreasing
 * it as needed (i.e. a delegation of 0 removes the delegation).
 *
 * When a delegation is removed the shares are placed in limbo for a
 * week to prevent a satoshi of VESTS from voting on the same content twice.
 *
 * Example:
 * ```js
 * var operation = [
 *   'delegate_vesting_shares',
 *   {
 *     delegator: 'alice',
 *     delegatee: 'bob',
 *     vesting_shares: '10000.000 STEEM'
 *   }
 * ]
 * ```
 */
export interface DelegateVestingSharesOperation extends Operation {
    0: 'delegate_vesting_shares' // 40
    1: {
        /**
         * The account delegating vesting shares.
         */
        delegator: string // account_name_type
        /**
         * The account receiving vesting shares.
         */
        delegatee: string // account_name_type
        /**
         * The amount of vesting shares delegated.
         */
        vesting_shares: string | Asset
    }
}

/**
 * Delete comment operation
 * ------------------------
 * Operation to delete a comment or post.
 *
 * Example:
 * ```js
 * var operation = [
 *   'delete_comment',
 *   {
 *     author: 'alice',
 *     permlink: 'my-first-post'
 *   }
 * ]
 * ```
 */
export interface DeleteCommentOperation extends Operation {
    0: 'delete_comment' // 17
    1: {
        author: string // account_name_type
        permlink: string
    }
}

/**
 * Escrow approve operation
 * ------------------------
 * The agent and to accounts must approve an escrow transaction for it to be valid on
 * the blockchain. Once a part approves the escrow, the cannot revoke their approval.
 * Subsequent escrow approve operations, regardless of the approval, will be rejected.
 *
 * Example:
 * ```js
 * var operation = [
 *   'escrow_approve',
 *   {
 *     from: 'alice',
 *     to: 'bob',
 *     agent: 'swapsteem',
 *     who: 'bob',
 *     escrow_id: 123,
 *     approve: true
 *   }
 * ]
 * ```
 *
 * See also [[EscrowTransferOperation]], [[EscrowReleaseOperation]], [[EscrowDisputeOperation]].
 */
export interface EscrowApproveOperation extends Operation {
    0: 'escrow_approve' // 31
    1: {
        from: string // account_name_type
        to: string // account_name_type
        agent: string // account_name_type
        /**
         * Either to or agent.
         */
        who: string // account_name_type
        escrow_id: number // uint32_t
        approve: boolean
    }
}

/**
 * Escrow dispute operation
 * ------------------------
 * If either the sender or receiver of an escrow payment has an issue, they can
 * raise it for dispute. Once a payment is in dispute, the agent has authority over
 * who gets what.
 *
 * Example:
 * ```js
 * var operation = [
 *   'escrow_dispute',
 *   {
 *     from: 'alice',
 *     to: 'bob',
 *     agent: 'swapsteem',
 *     who: 'bob',
 *     escrow_id: 123,
 *   }
 * ]
 * ```
 *
 * See also [[EscrowTransferOperation]], [[EscrowApproveOperation]], [[EscrowReleaseOperation]].
 */
export interface EscrowDisputeOperation extends Operation {
    0: 'escrow_dispute' // 28
    1: {
        from: string // account_name_type
        to: string // account_name_type
        agent: string // account_name_type
        who: string // account_name_type
        escrow_id: number // uint32_t
    }
}

/**
 * Escrow release operation
 * ------------------------
 * This operation can be used by anyone associated with the escrow transfer to
 * release funds if they have permission.
 *
 * The permission scheme is as follows:
 * If there is no dispute and escrow has not expired, either party can release funds to the other.
 * If escrow expires and there is no dispute, either party can release funds to either party.
 * If there is a dispute regardless of expiration, the agent can release funds to either party
 * following whichever agreement was in place between the parties.
 *
 * Example:
 * ```js
 * var operation = [
 *   'escrow_release',
 *   {
 *     from: 'alice',
 *     to: 'bob',
 *     agent: 'swapsteem',
 *     who: 'alice',
 *     receiver: 'bob'
 *     escrow_id: 123,
 *     sbd_amount: '0.000 SBD',
 *     steem_amount: '40.000 STEEM'
 *   }
 * ]
 * ```
 *
 * See also [[EscrowTransferOperation]], [[EscrowApproveOperation]], [[EscrowDisputeOperation]].
 */
export interface EscrowReleaseOperation extends Operation {
    0: 'escrow_release' // 29
    1: {
        from: string // account_name_type
        /**
         * The original 'to'.
         */
        to: string // account_name_type
        agent: string // account_name_type
        /**
         * The account that is attempting to release the funds, determines valid 'receiver'.
         */
        who: string // account_name_type
        /**
         * The account that should receive funds (might be from, might be to).
         */
        receiver: string // account_name_type
        escrow_id: number // uint32_t
        /**
         * The amount of sbd to release.
         */
        sbd_amount: Asset | string
        /**
         * The amount of steem to release.
         */
        steem_amount: Asset | string
    }
}

/**
 * Escrow transfer operation
 * ------------------------
 * The purpose of this operation is to enable someone to send money contingently to
 * another individual. The funds leave the *from* account and go into a temporary balance
 * where they are held until *from* releases it to *to* or *to* refunds it to *from*.
 *
 * In the event of a dispute the *agent* can divide the funds between the to/from account.
 * Disputes can be raised any time before or on the dispute deadline time, after the escrow
 * has been approved by all parties.
 *
 * This operation only creates a proposed escrow transfer. Both the *agent* and *to* must
 * agree to the terms of the arrangement by approving the escrow.
 *
 * The escrow agent is paid the fee on approval of all parties. It is up to the escrow agent
 * to determine the fee.
 *
 * Escrow transactions are uniquely identified by 'from' and 'escrow_id', the 'escrow_id' is defined
 * by the sender.
 *
 * Example:
 * ```js
 * var ratification = new Date(Date.now() + 60*60*1000).toISOString().slice(0, -5)
 * var expiration = new Date(Date.now() + 2*60*60*1000).toISOString().slice(0, -5)
 * var operation = [
 *   'escrow_transfer',
 *   {
 *     from: 'alice',
 *     to: 'bob',
 *     agent: 'swapsteem',
 *     escrow_id: 123,
 *     sbd_amount: '0.000 SBD',
 *     steem_amount: '40.000 STEEM'
 *     fee: '0.01 STEEM',
 *     ratification_deadline: ratification,
 *     escrow_expiration: expiration,
 *     json_meta: '{}'
 *   }
 * ]
 * ```
 *
 * See also [[EscrowApproveOperation]], [[EscrowReleaseOperation]], [[EscrowDisputeOperation]].
 */
export interface EscrowTransferOperation extends Operation {
    0: 'escrow_transfer' // 27
    1: {
        from: string // account_name_type
        to: string // account_name_type
        agent: string // account_name_type
        escrow_id: number // uint32_t
        sbd_amount: Asset | string
        steem_amount: Asset | string
        fee: Asset | string
        ratification_deadline: string // time_point_sec
        escrow_expiration: string // time_point_sec
        json_meta: string
    }
}

/**
 * Publish feed operation
 * ----------------------
 * Operation used for witnesses to publish the feed price.
 *
 * Example:
 * ```js
 * var operation = [
 *   'feed_publish',
 *   {
 *     publisher: 'gtg',
 *     exchange_rate: {
 *       base: '0.5 SBD',
 *       quote: '1.000 STEEM'
 *     }
 *   }
 * ]
 * ```
 */
export interface FeedPublishOperation extends Operation {
    0: 'feed_publish' // 7
    1: {
      publisher: string // account_name_type
      exchange_rate: PriceType
    }
}

/**
 * Limit order cancel operation
 * ----------------------------
 * * Cancels an order and returns the balance to owner.
 *
 * Example:
 * ```js
 * var operation = [
 *   'limit_order_cancel',
 *   {
 *     owner: 'alice',
 *     orderid: 123
 *   }
 * ]
 * ```
 */
export interface LimitOrderCancelOperation extends Operation {
    0: 'limit_order_cancel' // 6
    1: {
      owner: string // account_name_type
      orderid: number // uint32_t
    }
}

/**
 * Limit order create operation
 * ----------------------------
 * This operation creates a limit order and matches it against existing open orders.
 *
 * Example:
 * ```js
 * var operation = [
 *   'limit_order_create',
 *   {
 *     owner: 'alice',
 *     orderid: 123,
 *     amount_to_sell: '40.000 STEEM',
 *     min_to_receive: '50.000 SBD',
 *     fill_or_kill: true,
 *     expiration: new Date(Date.now() + 60*60*1000).toISOString().slice(0, -5)
 *   }
 * ]
 * ```
 */
export interface LimitOrderCreateOperation extends Operation {
    0: 'limit_order_create' // 5
    1: {
      owner: string // account_name_type
      orderid: number // uint32_t
      amount_to_sell: Asset | string
      min_to_receive: Asset | string
      fill_or_kill: boolean
      expiration: string // time_point_sec
    }
}

/**
 * Limit order create2 operation
 * -----------------------------
 * This operation is identical to [[LimitOrderCreateOperation]] except it serializes the price rather
 * than calculating it from other fields.
 *
 * Example:
 * ```js
 * var operation = [
 *   'limit_order_create2',
 *   {
 *     owner: 'alice',
 *     orderid: 123,
 *     amount_to_sell: '40.000 STEEM',
 *     fill_or_kill: true,
 *     exchange_rate: {
 *       base: '0.5 SBD',
 *       quote: '1.000 STEEM'
 *     },
 *     expiration: new Date(Date.now() + 60*60*1000).toISOString().slice(0, -5)
 *   }
 * ]
 * ```
 */
export interface LimitOrderCreate2Operation extends Operation {
    0: 'limit_order_create2' // 21
    1: {
      owner: string // account_name_type
      orderid: number // uint32_t
      amount_to_sell: Asset | string
      fill_or_kill: boolean
      exchange_rate: PriceType
      expiration: string // time_point_sec
    }
}

/**
 * Pow operation
 * -------------
 * Legacy proof of work operation. Deprecated.
 */
export interface PowOperation extends Operation {
    0: 'pow' // 14
    1: {
        worker_account: string // account_name_type
        block_id: any
        nonce: number // uint64_t
        work: any
        props: any
    }
}

/**
 * Pow 2 operation
 * ---------------
 * Legacy equihash proof of work operation. Deprecated.
 */
export interface Pow2Operation extends Operation {
    0: 'pow2' // 30
    1: {
        work: any
        new_owner_key?: string | PublicKey // public_key_type
        props: any
    }
}

/**
 * Recover account operation
 * -------------------------
 * Recover an account to a new authority using a previous authority and verification
 * of the recovery account as proof of identity. This operation can only succeed
 * if there was a recovery request sent by the account's recover account.
 *
 * In order to recover the account, the account holder must provide proof
 * of past ownership and proof of identity to the recovery account. Being able
 * to satisfy an owner authority that was used in the past 30 days is sufficient
 * to prove past ownership. The get_owner_history function in the database API
 * returns past owner authorities that are valid for account recovery.
 *
 * Proving identity is an off chain contract between the account holder and
 * the recovery account. The recovery request contains a new authority which
 * must be satisfied by the account holder to regain control. The actual process
 * of verifying authority may become complicated, but that is an application
 * level concern, not a blockchain concern.
 *
 * This operation requires both the past and future owner authorities in the
 * operation because neither of them can be derived from the current chain state.
 * The operation must be signed by keys that satisfy both the new owner authority
 * and the recent owner authority. Failing either fails the operation entirely.
 *
 * If a recovery request was made inadvertantly, the account holder should
 * contact the recovery account to have the request deleted.
 *
 * The two setp combination of the account recovery request and recover is
 * safe because the recovery account never has access to secrets of the account
 * to recover. They simply act as an on chain endorsement of off chain identity.
 * In other systems, a fork would be required to enforce such off chain state.
 * Additionally, an account cannot be permanently recovered to the wrong account.
 * While any owner authority from the past 30 days can be used, including a compromised
 * authority, the account can be continually recovered until the recovery account
 * is confident a combination of uncompromised authorities were used to
 * recover the account. The actual process of verifying authority may become
 * complicated, but that is an application level concern, not the blockchain's
 * concern.
 *
 * Example:
 * ```js
 * var operation = [
 *   'recover_account',
 *   {
 *     account_to_recover: 'alice'
 *     new_owner_authority: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [['STM6Tdk5mdUAViXWxkm1Uchu1bksG9iJFBT2z3BwLzKw7yjdmaiAf', 1]]
 *     },
 *     recent_owner_authority: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [['STM8a4MMRRXjzosAEi2U7kuKTwdTv4kpswNAD59cxXEyN2oX6s2ux', 1]]
 *     },
 *     extensions: []
 *   }
 * ]
 * ```
 */
export interface RecoverAccountOperation extends Operation {
    0: 'recover_account' // 25
    1: {
        /**
         * The account to be recovered.
         */
        account_to_recover: string // account_name_type
        /**
         * The new owner authority as specified in the request account recovery operation.
         */
        new_owner_authority: AuthorityType
        /**
         * A previous owner authority that the account holder will use to prove
         * past ownership of the account to be recovered.
         */
        recent_owner_authority: AuthorityType
        /**
         * Extensions. Not currently used.
         */
        extensions: any[] // extensions_type
    }
}

/**
 * Report over production operation
 * --------------------------------
 * This operation is used to report a miner who signs two blocks
 * at the same time. To be valid, the violation must be reported within
 * STEEMIT_MAX_WITNESSES blocks of the head block (1 round) and the
 * producer must be in the ACTIVE witness set.
 *
 * Users not in the ACTIVE witness set should not have to worry about their
 * key getting compromised and being used to produced multiple blocks so
 * the attacker can report it and steel their vesting steem.
 *
 * The result of the operation is to transfer the full VESTING STEEM balance
 * of the block producer to the reporter.
 */
export interface ReportOverProductionOperation extends Operation {
    0: 'report_over_production' // 16
    1: {
        reporter: string // account_name_type
        first_block: SignedBlockHeader
        second_block: SignedBlockHeader
    }
}

/**
 * Request account recovery operation
 * ----------------------------------
 * All account recovery requests come from a listed recovery account. This
 * is secure based on the assumption that only a trusted account should be
 * a recovery account. It is the responsibility of the recovery account to
 * verify the identity of the account holder of the account to recover by
 * whichever means they have agreed upon. The blockchain assumes identity
 * has been verified when this operation is broadcast.
 *
 * This operation creates an account recovery request which the account to
 * recover has 24 hours to respond to before the request expires and is
 * invalidated.
 *
 * There can only be one active recovery request per account at any one time.
 * Pushing this operation for an account to recover when it already has
 * an active request will either update the request to a new new owner authority
 * and extend the request expiration to 24 hours from the current head block
 * time or it will delete the request. To cancel a request, simply set the
 * weight threshold of the new owner authority to 0, making it an open authority.
 *
 * Additionally, the new owner authority must be satisfiable. In other words,
 * the sum of the key weights must be greater than or equal to the weight
 * threshold.
 *
 * This operation only needs to be signed by the the recovery account.
 * The account to recover confirms its identity to the blockchain in
 * the recover account operation.
 *
 * Example:
 * ```js
 * var operation = [
 *   'request_account_recovery',
 *   {
 *     recovery_account: 'steem',
 *     account_to_recover: 'alice',
 *     new_owner_authority: {
 *       weight_threshold: 1,
 *       account_auths: [],
 *       key_auths: [['STM6Tdk5mdUAViXWxkm1Uchu1bksG9iJFBT2z3BwLzKw7yjdmaiAf', 1]]
 *     },
 *     extensions: []
 *   }
 * ]
 * ```
 */
export interface RequestAccountRecoveryOperation extends Operation {
    0: 'request_account_recovery' // 24
    1: {
        /**
         * The recovery account is listed as the recovery account on the account to recover.
         */
        recovery_account: string // account_name_type
        /**
         * The account to recover. This is likely due to a compromised owner authority.
         */
        account_to_recover: string // account_name_type
        /**
         * The new owner authority the account to recover wishes to have. This is secret
         * known by the account to recover and will be confirmed in a recover_account_operation.
         */
        new_owner_authority: AuthorityType
        /**
         * Extensions. Not currently used.
         */
        extensions: any[] // extensions_type
    }
}

/**
 * Reset account operation
 * -----------------------
 * Not implemented
 *
 * This operation allows recovery_account to change account_to_reset's owner authority to
 * new_owner_authority after 60 days of inactivity.
 */
export interface ResetAccountOperation extends Operation {
    0: 'reset_account' // 37
    1: {
        reset_account: string // account_name_type
        account_to_reset: string // account_name_type
        new_owner_authority: AuthorityType
    }
}

/**
 * Set reset account operation
 * ---------------------------
 * Not implemented
 *
 * This operation allows 'account' owner to control which account has the power
 * to execute the 'reset_account_operation' after 60 days.
 */
export interface SetResetAccountOperation extends Operation {
    0: 'set_reset_account' // 38
    1: {
        account: string // account_name_type
        current_reset_account: string // account_name_type
        reset_account: string // account_name_type
    }
}

/**
 * Set withdraw vesting route operation
 * ------------------------------------
 * Allows an account to setup a vesting withdraw but with the additional
 * request for the funds to be transferred directly to another account's
 * balance rather than the withdrawing account. In addition, those funds
 * can be immediately vested again, circumventing the conversion from
 * vests to steem and back, guaranteeing they maintain their value.
 *
 * Example:
 * ```js
 * var operation = [
 *   'set_withdraw_vesting_route',
 *   {
 *     from_account: 'alice',
 *     to_account: 'alice2',
 *     percent: 10000,
 *     auto_vest: false
 *   }
 * ]
 * ```
 */
export interface SetWithdrawVestingRouteOperation extends Operation {
    0: 'set_withdraw_vesting_route' // 20
    1: {
        from_account: string // account_name_type
        to_account: string // account_name_type
        percent: number // uint16_t (100% = STEEMIT_100_PERCENT = 10000)
        auto_vest: boolean
    }
}

/**
 * Transfer operation
 * ------------------
 * Transfers STEEM or SBD from one account to another.
 *
 * Example:
 * ```js
 * var operation = [
 *   'transfer',
 *   {
 *     from: 'alice',
 *     to: 'bob',
 *     amount: '5.000 STEEM',
 *     memo: 'payment. thanks'
 *   }
 * ]
 * ```
 */
export interface TransferOperation extends Operation {
    0: 'transfer' // 2
    1: {
        /**
         * Sending account name.
         */
        from: string // account_name_type
        /**
         * Receiving account name.
         */
        to: string // account_name_type
        /**
         * Amount of STEEM or SBD to send.
         */
        amount: string | Asset
        /**
         * Plain-text note attached to transaction.
         */
        memo: string
    }
}

/**
 * Transfer from savings operation
 * -------------------------------
 * Transfers STEEM or SBD from savings to one account to another.
 * The funds are deposited after 3 days
 *
 * Example:
 * ```js
 * var operation = [
 *   'transfer_from_savings',
 *   {
 *     from: 'alice',
 *     request_id: 123,
 *     to: 'alice',
 *     amount: '5.000 STEEM',
 *     memo: 'liquid steem'
 *   }
 * ]
 * ```
 * See also [[TransferToSavingsOperation]]
 */
export interface TransferFromSavingsOperation extends Operation {
    0: 'transfer_from_savings' // 33
    1: {
        from: string // account_name_type
        request_id: number // uint32_t
        to: string // account_name_type
        amount: string | Asset
        memo: string
    }
}

/**
 * Transfer to savings operation
 * -------------------------------
 * Transfers STEEM or SBD from the hot wallet to savings.
 * This is useful to prevent instant transfers when an account is compromised.
 *
 * Example:
 * ```js
 * var operation = [
 *   'transfer_to_savings',
 *   {
 *     from: 'alice',
 *     to: 'alice',
 *     amount: '5.000 STEEM',
 *     memo: 'saving'
 *   }
 * ]
 * ```
 * See also [[TransferFromSavingsOperation]]
 */
export interface TransferToSavingsOperation extends Operation {
    0: 'transfer_to_savings' // 32
    1: {
        amount: string | Asset
        from: string // account_name_type
        memo: string
        request_id: number // uint32_t
        to: string // account_name_type
    }
}

/**
 * Transfer to vesting operation
 * -----------------------------
 * This operation converts STEEM into VFS (Vesting Fund Shares) at
 * the current exchange rate. With this operation it is possible to
 * give another account vesting shares so that faucets can
 * pre-fund new accounts with vesting shares.
 * (A.k.a. Powering Up)
 *
 * Example:
 * ```js
 * var operation = [
 *   'transfer_to_vesting',
 *   {
 *     from: 'alice',
 *     to: 'alice',
 *     amount: '500.000 STEEM',
 *   }
 * ]
 * ```
 */
export interface TransferToVestingOperation extends Operation {
    0: 'transfer_to_vesting' // 3
    1: {
        from: string // account_name_type
        to: string // account_name_type
        /**
         * Amount to power up, must be STEEM.
         */
        amount: string | Asset
    }
}

/**
 * Vote operation
 * --------------
 * Vote comments or posts
 *
 * Example:
 * ```js
 * var operation = [
 *   'vote',
 *   {
 *     voter: 'bob',
 *     author: 'alice',
 *     permlink: 'my-first-post',
 *     weight: 10000
 *   }
 * ]
 * ```
 */
export interface VoteOperation extends Operation {
    0: 'vote' // 0
    1: {
        voter: string // account_name_type
        author: string // account_name_type
        permlink: string
        /**
         * Voting weight, 100% = 10000 (STEEMIT_100_PERCENT).
         */
        weight: number // int16_t
    }
}

/**
 * Withdraw vesting operation
 * --------------------------
 * At any given point in time an account can be withdrawing from their
 * vesting shares. A user may change the number of shares they wish to
 * cash out at any time between 0 and their total vesting stake.
 *
 * After applying this operation, vesting_shares will be withdrawn
 * in 13 weekly deposits.
 *
 * This operation is not valid if the user has no vesting shares.
 * (A.k.a. Powering Down)
 *
 * Example:
 * ```js
 * var operation = [
 *   'withdraw_vesting',
 *   {
 *     account: 'alice',
 *     vesting_shares: '15000000.000000 VESTS'
 *   }
 * ]
 * ```
 */
export interface WithdrawVestingOperation extends Operation {
    0: 'withdraw_vesting' // 4
    1: {
        account: string // account_name_type
        /**
         * Amount to power down, must be VESTS.
         */
        vesting_shares: string | Asset
    }
}

/**
 * Witness update operation
 * ------------------------
 * Operation to become or update a witness
 * If the block_signing_key is null then the witness is removed from
 * contention.  The network will pick the top 21 witnesses for
 * producing blocks.
 *
 * Example:
 * ```js
 * var operation = [
 *   'witness_update',
 *   {
 *     owner: 'alice',
 *     url: '',
 *     block_signing_key: 'STM7T2TBdQWqNAhuzH5SXfSnsTLmrZkAufmvMwEsbvGihtHsf7dWk',
 *     props: {
 *        account_creation_fee: '3.000 STEEM',
 *        maximum_block_size: 65536,
 *        sbd_interest_rate:0
 *     },
 *     fee: '0.000 STEEM'
 *   }
 * ]
 * ```
 */
export interface WitnessUpdateOperation extends Operation {
    0: 'witness_update' // 11
    1: {
        owner: string // account_name_type
        /**
         * URL for witness, usually a link to a post in the witness-category tag.
         */
        url: string
        block_signing_key: string | PublicKey | null // public_key_type
        props: ChainProperties
        /**
         * The fee paid to register a new witness, should be 10x current block production pay.
         */
        fee: string | Asset
    }
}

/**
 * Witness set properties operation
 * --------------------------------
 * Added in HF20 to replace the [[WitnessUpdateOperation]] which was not easily extendable.
 * While it is recommended to use witness_set_properties, witness_update will continue to work.
 * All the fields in `props` are optional
 *
 * Example:
 * ```js
 * var operation = [
 *   'witness_set_properties',
 *   {
 *     owner: 'alice',
 *     props: {
 *       account_creation_fee: '3.000 STEEM',
 *       account_subsidy_budget: 10000,
 *       account_subsidy_decay: 330782,
 *       maximum_block_size: 65536,
 *       sbd_interest_rate: 0,
 *       sbd_exchange_rate: {
 *         base: '0.500 SBD',
 *         quote: '1.000 STEEM'
 *       },
 *       url: '',
 *       new_signing_key: 'STM7T2TBdQWqNAhuzH5SXfSnsTLmrZkAufmvMwEsbvGihtHsf7dWk'
 *     },
 *     extensions: []
 *   }
 * ]
 * ```
 */
export interface WitnessSetPropertiesOperation extends Operation {
    0: 'witness_set_properties' // 42
    1: {
        owner: string
        props: Array<[string, Buffer]>
        extensions: any[]
    }
}
