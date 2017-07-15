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

import {Asset} from './asset'

/**
 * Large number that may be unsafe to represent natively in JavaScript.
 */
export type Bignum = string

/**
 * Buffer wrapper that serializes to a hex-encoded string.
 */
export class HexBuffer {

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
