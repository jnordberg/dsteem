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

/**
 * Transaction operation name.
 */
export type OperationName =
        | 'vote_operation'
        | 'comment_operation'
        | 'transfer_operation'
        | 'transfer_to_vesting_operation'
        | 'withdraw_vesting_operation'
        | 'limit_order_create_operation'
        | 'limit_order_cancel_operation'
        | 'feed_publish_operation'
        | 'convert_operation'
        | 'account_create_operation'
        | 'account_update_operation'
        | 'witness_update_operation'
        | 'account_witness_vote_operation'
        | 'account_witness_proxy_operation'
        | 'pow_operation'
        | 'custom_operation'
        | 'report_over_production_operation'
        | 'delete_comment_operation'
        | 'custom_json_operation'
        | 'comment_options_operation'
        | 'set_withdraw_vesting_route_operation'
        | 'limit_order_create2_operation'
        | 'challenge_authority_operation'
        | 'prove_authority_operation'
        | 'request_account_recovery_operation'
        | 'recover_account_operation'
        | 'change_recovery_account_operation'
        | 'escrow_transfer_operation'
        | 'escrow_dispute_operation'
        | 'escrow_release_operation'
        | 'pow2_operation'
        | 'escrow_approve_operation'
        | 'transfer_to_savings_operation'
        | 'transfer_from_savings_operation'
        | 'cancel_transfer_from_savings_operation'
        | 'custom_binary_operation'
        | 'decline_voting_rights_operation'
        | 'reset_account_operation'
        | 'set_reset_account_operation'
        | 'claim_reward_balance_operation'
        | 'delegate_vesting_shares_operation'
        | 'account_create_with_delegation_operation'

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

export interface TransferToSavingsOperation extends Operation {
    0: 'transfer_to_savings_operation'
    1: {
        amount: string
        from: string
        memo: string
        request_id: number
        to: string,
    }
}
