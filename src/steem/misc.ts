/**
 * @file Misc steem type definitions.
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
import { Account } from './account'
import {Asset, Price} from './asset'

/**
 * Large number that may be unsafe to represent natively in JavaScript.
 */
export type Bignum = string

/**
 * Buffer wrapper that serializes to a hex-encoded string.
 */
export class HexBuffer {

    /**
     * Convenience to create a new HexBuffer, does not copy data if value passed is already a buffer.
     */
    public static from(value: Buffer | HexBuffer | number[] | string) {
        if (value instanceof HexBuffer) {
            return value
        } else if (value instanceof Buffer) {
            return new HexBuffer(value)
        } else if (typeof value === 'string') {
            return new HexBuffer(Buffer.from(value, 'hex'))
        } else {
            return new HexBuffer(Buffer.from(value))
        }
    }

    constructor(public buffer: Buffer) {}

    public toString(encoding = 'hex') {
        return this.buffer.toString(encoding)
    }

    public toJSON() {
        return this.toString()
    }

}

/**
 * Chain roperties that are decided by the witnesses.
 */
export interface ChainProperties {
    /**
     * This fee, paid in STEEM, is converted into VESTING SHARES for the new account. Accounts
     * without vesting shares cannot earn usage rations and therefore are powerless. This minimum
     * fee requires all accounts to have some kind of commitment to the network that includes the
     * ability to vote and make transactions.
     *
     * @note This has to be multiplied by `STEEMIT_CREATE_ACCOUNT_WITH_STEEM_MODIFIER`
     *       (defined as 30 on the main chain) to get the minimum fee needed to create an account.
     *
     */
    account_creation_fee: string | Asset
    /**
     * This witnesses vote for the maximum_block_size which is used by the network
     * to tune rate limiting and capacity.
     */
    maximum_block_size: number // uint32_t
    /**
     * The SBD interest percentage rate decided by witnesses, expressed 0 to 10000.
     */
    sbd_interest_rate: number // uint16_t STEEMIT_100_PERCENT
}

export interface VestingDelegation {
    /**
     * Delegation id.
     */
    id: number // id_type
    /**
     * Account that is delegating vests to delegatee.
     */
    delegator: string // account_name_type
    /**
     * Account that is receiving vests from delegator.
     */
    delegatee: string // account_name_type
    /**
     * Amount of VESTS delegated.
     */
    vesting_shares: Asset | string
    /**
     * Earliest date delegation can be removed.
     */
    min_delegation_time: string // time_point_sec
}

/**
 * Node state.
 */
export interface DynamicGlobalProperties {
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
    virtual_supply: Asset | string
    current_supply: Asset | string
    /**
     * Total asset held in confidential balances.
     */
    confidential_supply: Asset | string
    current_sbd_supply: Asset | string
    /**
     * Total asset held in confidential balances.
     */
    confidential_sbd_supply: Asset | string
    total_vesting_fund_steem: Asset | string
    total_vesting_shares: Asset | string
    total_reward_fund_steem: Asset | string
    /**
     * The running total of REWARD^2.
     */
    total_reward_shares2: string
    pending_rewarded_vesting_shares: Asset | string
    pending_rewarded_vesting_steem: Asset | string
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

/**
 * Return the vesting share price.
 */
export function getVestingSharePrice(props: DynamicGlobalProperties): Price {
    const totalVestingFund = Asset.from(props.total_vesting_fund_steem)
    const totalVestingShares = Asset.from(props.total_vesting_shares)
    if (totalVestingFund.amount === 0 || totalVestingShares.amount === 0) {
        return new Price(new Asset(1, 'VESTS'), new Asset(1, 'STEEM'))
    }
    return new Price(totalVestingShares, totalVestingFund)
}

/**
 * Returns the vests of specified account. Default: Subtract delegated & add received
 */
export function getVests(account: Account, subtract_delegated: boolean = true, add_received: boolean = true) {
    let vests: Asset = Asset.from(account.vesting_shares)
    const vests_delegated: Asset = Asset.from(account.delegated_vesting_shares)
    const vests_received: Asset = Asset.from(account.received_vesting_shares)
    const withdraw_rate: Asset = Asset.from(account.vesting_withdraw_rate)
    const already_withdrawn = (Number(account.to_withdraw) - Number(account.withdrawn)) / 1000000
    const withdraw_vests = Math.min(withdraw_rate.amount, already_withdrawn)
    vests = vests.subtract(withdraw_vests)

    if (subtract_delegated) {
        vests = vests.subtract(vests_delegated)
    }
    if (add_received) {
        vests = vests.add(vests_received)
    }

    return vests.amount
}
