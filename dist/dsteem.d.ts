declare module 'dsteem/steem/asset' {
	/**
	 * Asset symbol string.
	 */
	export type AssetSymbol = 'STEEM' | 'VESTS' | 'SBD';
	/**
	 * Class representing a steem asset, e.g. `1.000 STEEM` or `12.112233 VESTS`.
	 */
	export class Asset {
	    readonly amount: number;
	    readonly symbol: AssetSymbol;
	    /**
	     * Create a new Asset instance from a string, e.g. `42.000 STEEM`.
	     */
	    static fromString(string: string): Asset;
	    /**
	     * Convenience to create new Asset.
	     */
	    static from(value: string | Asset | number, symbol?: AssetSymbol): Asset;
	    constructor(amount: number, symbol: AssetSymbol);
	    /**
	     * Return asset precision.
	     */
	    getPrecision(): number;
	    /**
	     * Return a string representation of this asset, e.g. `42.000 STEEM`.
	     */
	    toString(): string;
	    /**
	     * Return a new Asset instance with amount added.
	     */
	    add(amount: Asset | string | number): Asset;
	    /**
	     * Return a new Asset instance with amount subtracted.
	     */
	    subtract(amount: Asset | string | number): Asset;
	    /**
	     * Return a new Asset with the amount multiplied by factor.
	     */
	    multiply(factor: Asset | string | number): Asset;
	    /**
	     * For JSON serialization, same as toString().
	     */
	    toJSON(): string;
	}

}
declare module 'dsteem/steem/account' {
	import { PublicKey } from 'dsteem/crypto';
	import { Asset } from 'dsteem/steem/asset';
	export interface Authority {
	    weight_threshold: number;
	    account_auths: Array<[string, number]>;
	    key_auths: Array<[string | PublicKey, number]>;
	}
	export interface Account {
	    id: number;
	    name: string;
	    owner: Authority;
	    active: Authority;
	    posting: Authority;
	    memo_key: string;
	    json_metadata: string;
	    proxy: string;
	    last_owner_update: string;
	    last_account_update: string;
	    created: string;
	    mined: boolean;
	    owner_challenged: boolean;
	    active_challenged: boolean;
	    last_owner_proved: string;
	    last_active_proved: string;
	    recovery_account: string;
	    reset_account: string;
	    last_account_recovery: string;
	    comment_count: number;
	    lifetime_vote_count: number;
	    post_count: number;
	    can_vote: boolean;
	    voting_power: number;
	    last_vote_time: string;
	    balance: string | Asset;
	    savings_balance: string | Asset;
	    sbd_balance: string | Asset;
	    sbd_seconds: string;
	    sbd_seconds_last_update: string;
	    sbd_last_interest_payment: string;
	    savings_sbd_balance: string | Asset;
	    savings_sbd_seconds: string;
	    savings_sbd_seconds_last_update: string;
	    savings_sbd_last_interest_payment: string;
	    savings_withdraw_requests: number;
	    reward_sbd_balance: string | Asset;
	    reward_steem_balance: string | Asset;
	    reward_vesting_balance: string | Asset;
	    reward_vesting_steem: string | Asset;
	    curation_rewards: number | string;
	    posting_rewards: number | string;
	    vesting_shares: string | Asset;
	    delegated_vesting_shares: string | Asset;
	    received_vesting_shares: string | Asset;
	    vesting_withdraw_rate: string | Asset;
	    next_vesting_withdrawal: string;
	    withdrawn: number | string;
	    to_withdraw: number | string;
	    withdraw_routes: number;
	    proxied_vsf_votes: number[];
	    witnesses_voted_for: number;
	    average_bandwidth: number | string;
	    lifetime_bandwidth: number | string;
	    last_bandwidth_update: string;
	    average_market_bandwidth: number | string;
	    lifetime_market_bandwidth: number | string;
	    last_market_bandwidth_update: string;
	    last_post: string;
	    last_root_post: string;
	}
	export interface ExtendedAccount extends Account {
	    /**
	     * Convert vesting_shares to vesting steem.
	     */
	    vesting_balance: string | Asset;
	    reputation: string | number;
	    /**
	     * Transfer to/from vesting.
	     */
	    transfer_history: any[];
	    /**
	     * Limit order / cancel / fill.
	     */
	    market_history: any[];
	    post_history: any[];
	    vote_history: any[];
	    other_history: any[];
	    witness_votes: string[];
	    tags_usage: string[];
	    guest_bloggers: string[];
	    open_orders?: any[];
	    comments?: any[];
	    blog?: any[];
	    feed?: any[];
	    recent_replies?: any[];
	    recommended?: any[];
	}

}
declare module 'dsteem/steem/misc' {
	/// <reference types="node" />
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
	import { Asset } from 'dsteem/steem/asset';
	/**
	 * Large number that may be unsafe to represent natively in JavaScript.
	 */
	export type Bignum = string;
	/**
	 * Buffer wrapper that serializes to a hex-encoded string.
	 */
	export class HexBuffer {
	    buffer: Buffer;
	    constructor(buffer: Buffer);
	    toString(encoding?: string): string;
	    toJSON(): string;
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
	    account_creation_fee: string | Asset;
	    /**
	     * This witnesses vote for the maximum_block_size which is used by the network
	     * to tune rate limiting and capacity.
	     */
	    maximum_block_size: number;
	    /**
	     * The SBD interest percentage rate decided by witnesses, expressed 0 to 10000.
	     */
	    sbd_interest_rate: number;
	}
	/**
	 * Node state.
	 */
	export interface DynamicGlobalProperties {
	    id: number;
	    /**
	     * Current block height.
	     */
	    head_block_number: number;
	    head_block_id: string;
	    /**
	     * UTC Server time, e.g. 2020-01-15T00:42:00
	     */
	    time: string;
	    /**
	     * Currently elected witness.
	     */
	    current_witness: string;
	    /**
	     * The total POW accumulated, aka the sum of num_pow_witness at the time
	     * new POW is added.
	     */
	    total_pow: number;
	    /**
	     * The current count of how many pending POW witnesses there are, determines
	     * the difficulty of doing pow.
	     */
	    num_pow_witnesses: number;
	    virtual_supply: Asset | string;
	    current_supply: Asset | string;
	    /**
	     * Total asset held in confidential balances.
	     */
	    confidential_supply: Asset | string;
	    current_sbd_supply: Asset | string;
	    /**
	     * Total asset held in confidential balances.
	     */
	    confidential_sbd_supply: Asset | string;
	    total_vesting_fund_steem: Asset | string;
	    total_vesting_shares: Asset | string;
	    total_reward_fund_steem: Asset | string;
	    /**
	     * The running total of REWARD^2.
	     */
	    total_reward_shares2: string;
	    pending_rewarded_vesting_shares: Asset | string;
	    pending_rewarded_vesting_steem: Asset | string;
	    /**
	     * This property defines the interest rate that SBD deposits receive.
	     */
	    sbd_interest_rate: number;
	    sbd_print_rate: number;
	    /**
	     *  Average block size is updated every block to be:
	     *
	     *     average_block_size = (99 * average_block_size + new_block_size) / 100
	     *
	     *  This property is used to update the current_reserve_ratio to maintain
	     *  approximately 50% or less utilization of network capacity.
	     */
	    average_block_size: number;
	    /**
	     * Maximum block size is decided by the set of active witnesses which change every round.
	     * Each witness posts what they think the maximum size should be as part of their witness
	     * properties, the median size is chosen to be the maximum block size for the round.
	     *
	     * @note the minimum value for maximum_block_size is defined by the protocol to prevent the
	     * network from getting stuck by witnesses attempting to set this too low.
	     */
	    maximum_block_size: number;
	    /**
	     * The current absolute slot number. Equal to the total
	     * number of slots since genesis. Also equal to the total
	     * number of missed slots plus head_block_number.
	     */
	    current_aslot: number;
	    /**
	     * Used to compute witness participation.
	     */
	    recent_slots_filled: Bignum;
	    participation_count: number;
	    last_irreversible_block_num: number;
	    /**
	     * The maximum bandwidth the blockchain can support is:
	     *
	     *    max_bandwidth = maximum_block_size * STEEMIT_BANDWIDTH_AVERAGE_WINDOW_SECONDS / STEEMIT_BLOCK_INTERVAL
	     *
	     * The maximum virtual bandwidth is:
	     *
	     *    max_bandwidth * current_reserve_ratio
	     */
	    max_virtual_bandwidth: Bignum;
	    /**
	     * Any time average_block_size <= 50% maximum_block_size this value grows by 1 until it
	     * reaches STEEMIT_MAX_RESERVE_RATIO.  Any time average_block_size is greater than
	     * 50% it falls by 1%.  Upward adjustments happen once per round, downward adjustments
	     * happen every block.
	     */
	    current_reserve_ratio: number;
	    /**
	     * The number of votes regenerated per day.  Any user voting slower than this rate will be
	     * "wasting" voting power through spillover; any user voting faster than this rate will have
	     * their votes reduced.
	     */
	    vote_power_reserve_rate: number;
	}

}
declare module 'dsteem/steem/serializer' {
	/// <reference types="node" />
	/**
	 * @file Steem protocol serialization.
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
	import { PublicKey } from 'dsteem/crypto';
	import { Asset } from 'dsteem/steem/asset';
	import { HexBuffer } from 'dsteem/steem/misc';
	import { Operation } from 'dsteem/steem/operation';
	export interface SerializerOptions {
	    addressPrefix: string;
	}
	export type Serializer = (buffer: ByteBuffer, data: any, options: SerializerOptions) => void;
	export const Types: {
	    Array: (itemSerializer: Serializer) => (buffer: ByteBuffer, data: any[], options: SerializerOptions) => void;
	    Asset: (buffer: ByteBuffer, data: string | Asset) => void;
	    Authority: (buffer: ByteBuffer, data: {
	        [key: string]: any;
	    }, options: SerializerOptions) => void;
	    Boolean: (buffer: ByteBuffer, data: boolean) => void;
	    Buffer: (buffer: ByteBuffer, data: HexBuffer | Buffer) => void;
	    Date: (buffer: ByteBuffer, data: string) => void;
	    FlatMap: (keySerializer: Serializer, valueSerializer: Serializer) => (buffer: ByteBuffer, data: [any, any][], options: SerializerOptions) => void;
	    Int16: (buffer: ByteBuffer, data: number) => void;
	    Object: (keySerializers: [string, Serializer][]) => (buffer: ByteBuffer, data: {
	        [key: string]: any;
	    }, options: SerializerOptions) => void;
	    Operation: (buffer: ByteBuffer, operation: Operation, options: SerializerOptions) => void;
	    PublicKey: (buffer: ByteBuffer, data: string | PublicKey | Buffer, options: SerializerOptions) => void;
	    StaticVariant: (itemSerializers: Serializer[]) => (buffer: ByteBuffer, data: [number, any], options: SerializerOptions) => void;
	    String: (buffer: ByteBuffer, data: string) => void;
	    Transaction: (buffer: ByteBuffer, data: {
	        [key: string]: any;
	    }, options: SerializerOptions) => void;
	    UInt16: (buffer: ByteBuffer, data: number) => void;
	    UInt32: (buffer: ByteBuffer, data: number) => void;
	};

}
declare module 'dsteem/utils' {
	/// <reference types="node" />
	/**
	 * @file Misc utility functions.
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
	import { EventEmitter } from 'events';
	/**
	 * Return a promise that will resove when a specific event is emitted.
	 */
	export function waitForEvent<T>(emitter: EventEmitter, eventName: string | symbol): Promise<T>;
	/**
	 * Sleep for N milliseconds.
	 */
	export function sleep(ms: number): Promise<void>;
	/**
	 * Return a stream that emits iterator values.
	 */
	export function iteratorStream<T>(iterator: AsyncIterableIterator<T>): NodeJS.ReadableStream;
	/**
	 * Return a deep copy of a JSON-serializable object.
	 */
	export function copy<T>(object: T): T;

}
declare module 'dsteem/crypto' {
	/// <reference types="node" />
	import { SignedTransaction, Transaction } from 'dsteem/steem/transaction';
	/**
	 * ECDSA (secp256k1) public key.
	 */
	export class PublicKey {
	    readonly key: Buffer;
	    readonly prefix: string;
	    /**
	     * Create a new instance from a WIF-encoded key.
	     */
	    static fromString(wif: string, prefix?: string): PublicKey;
	    /**
	     * Create a new instance.
	     */
	    static from(value: string | PublicKey | Buffer, prefix?: string): PublicKey;
	    constructor(key: Buffer, prefix?: string);
	    /**
	     * Verify a 32-byte signature.
	     * @param message 32-byte message to verify.
	     * @param signature Signature to verify.
	     */
	    verify(message: Buffer, signature: Signature): boolean;
	    /**
	     * Return a WIF-encoded representation of the key.
	     */
	    toString(): string;
	    /**
	     * Return JSON representation of this key, same as toString().
	     */
	    toJSON(): string;
	    /**
	     * Used by `utils.inspect` and `console.log` in node.js.
	     */
	    inspect(): string;
	}
	export type KeyRole = 'owner' | 'active' | 'posting' | 'memo';
	/**
	 * ECDSA (secp256k1) private key.
	 */
	export class PrivateKey {
	    private key;
	    /**
	     * Convenience to create a new instance from WIF string or buffer.
	     */
	    static from(value: string | Buffer): PrivateKey;
	    /**
	     * Create a new instance from a WIF-encoded key.
	     */
	    static fromString(wif: string): PrivateKey;
	    /**
	     * Create a new instance from a seed.
	     */
	    static fromSeed(seed: string): PrivateKey;
	    /**
	     * Create key from username and password.
	     */
	    static fromLogin(username: string, password: string, role?: KeyRole): PrivateKey;
	    constructor(key: Buffer);
	    /**
	     * Sign message.
	     * @param message 32-byte message.
	     */
	    sign(message: Buffer): Signature;
	    /**
	     * Derive the public key for this private key.
	     */
	    createPublic(prefix?: string): PublicKey;
	    /**
	     * Return a WIF-encoded representation of the key.
	     */
	    toString(): string;
	    /**
	     * Used by `utils.inspect` and `console.log` in node.js. Does not show the full key
	     * to get the full encoded key you need to explicitly call {@link toString}.
	     */
	    inspect(): string;
	}
	/**
	 * ECDSA (secp256k1) signature.
	 */
	export class Signature {
	    data: Buffer;
	    recovery: number;
	    static fromBuffer(buffer: Buffer): Signature;
	    static fromString(string: string): Signature;
	    constructor(data: Buffer, recovery: number);
	    /**
	     * Recover public key from signature by providing original signed message.
	     * @param message 32-byte message that was used to create the signature.
	     */
	    recover(message: Buffer): PublicKey;
	    toBuffer(): Buffer;
	    toString(): string;
	}
	/**
	 * Return copy of transaction with signature appended to signatures array.
	 * @param transaction Transaction to sign.
	 * @param key Key to sign transaction with.
	 * @param options Chain id and address prefix, compatible with {@link Client}.
	 */
	export function signTransaction(transaction: Transaction, key: PrivateKey, options: {
	    chainId: Buffer;
	    addressPrefix: string;
	}): SignedTransaction;

}
declare module 'dsteem/steem/comment' {
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
	import { Asset } from 'dsteem/steem/asset';
	export interface Comment {
	    id: number;
	    category: string;
	    parent_author: string;
	    parent_permlink: string;
	    author: string;
	    permlink: string;
	    title: string;
	    body: string;
	    json_metadata: string;
	    last_update: string;
	    created: string;
	    active: string;
	    last_payout: string;
	    depth: number;
	    children: number;
	    net_rshares: string;
	    abs_rshares: string;
	    vote_rshares: string;
	    children_abs_rshares: string;
	    cashout_time: string;
	    max_cashout_time: string;
	    total_vote_weight: number;
	    reward_weight: number;
	    total_payout_value: Asset | string;
	    curator_payout_value: Asset | string;
	    author_rewards: string;
	    net_votes: number;
	    root_comment: number;
	    max_accepted_payout: string;
	    percent_steem_dollars: number;
	    allow_replies: boolean;
	    allow_votes: boolean;
	    allow_curation_rewards: boolean;
	    beneficiaries: BeneficiaryRoute[];
	}
	/**
	 * Discussion a.k.a. Post.
	 */
	export interface Discussion extends Comment {
	    url: string;
	    root_title: string;
	    pending_payout_value: Asset | string;
	    total_pending_payout_value: Asset | string;
	    active_votes: any[];
	    replies: string[];
	    author_reputation: number;
	    promoted: Asset | string;
	    body_length: string;
	    reblogged_by: any[];
	    first_reblogged_by?: any;
	    first_reblogged_on?: any;
	}
	export interface BeneficiaryRoute {
	    account: string;
	    weight: number;
	}

}
declare module 'dsteem/steem/operation' {
	/// <reference types="node" />
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
	import { PublicKey } from 'dsteem/crypto';
	import { Authority } from 'dsteem/steem/account';
	import { Asset } from 'dsteem/steem/asset';
	import { BeneficiaryRoute } from 'dsteem/steem/comment';
	import { HexBuffer } from 'dsteem/steem/misc';
	/**
	 * Transaction operation name.
	 */
	export type OperationName = 'account_create' | 'account_create_with_delegation' | 'account_update' | 'account_witness_proxy' | 'account_witness_vote' | 'author_reward' | 'cancel_transfer_from_savings' | 'challenge_authority' | 'change_recovery_account' | 'claim_reward_balance' | 'comment' | 'comment_benefactor_reward' | 'comment_options' | 'comment_payout_update' | 'comment_reward' | 'convert' | 'curation_reward' | 'custom' | 'custom_binary' | 'custom_json' | 'decline_voting_rights' | 'delegate_vesting_shares' | 'delete_comment' | 'escrow_approve' | 'escrow_dispute' | 'escrow_release' | 'escrow_transfer' | 'feed_publish' | 'fill_convert_request' | 'fill_order' | 'fill_transfer_from_savings' | 'fill_vesting_withdraw' | 'hardfork' | 'interest' | 'limit_order_cancel' | 'limit_order_create' | 'limit_order_create2' | 'liquidity_reward' | 'pow' | 'pow2' | 'prove_authority' | 'recover_account' | 'report_over_production' | 'request_account_recovery' | 'reset_account' | 'return_vesting_delegation' | 'set_reset_account' | 'set_withdraw_vesting_route' | 'shutdown_witness' | 'transfer' | 'transfer_from_savings' | 'transfer_to_savings' | 'transfer_to_vesting' | 'vote' | 'withdraw_vesting' | 'witness_update';
	/**
	 * Generic operation.
	 */
	export interface Operation {
	    0: OperationName;
	    1: {
	        [key: string]: any;
	    };
	}
	export interface AppliedOperation {
	    trx_id: string;
	    block: number;
	    trx_in_block: number;
	    op_in_trx: number;
	    virtual_op: number;
	    timestamp: string;
	    op: Operation;
	}
	export interface VoteOperation extends Operation {
	    0: 'vote';
	    1: {
	        voter: string;
	        author: string;
	        permlink: string;
	        weight: number;
	    };
	}
	export interface CommentOperation extends Operation {
	    0: 'comment';
	    1: {
	        parent_author: string;
	        parent_permlink: string;
	        author: string;
	        permlink: string;
	        title: string;
	        body: string;
	        json_metadata: string;
	    };
	}
	export interface DelegateVestingSharesOperation extends Operation {
	    0: 'delegate_vesting_shares';
	    1: {
	        /**
	         * The account delegating vesting shares.
	         */
	        delegator: string;
	        /**
	         * The account receiving vesting shares.
	         */
	        delegatee: string;
	        /**
	         * The amount of vesting shares delegated.
	         */
	        vesting_shares: string | Asset;
	    };
	}
	export interface CustomOperation extends Operation {
	    0: 'custom';
	    1: {
	        required_auths: string[];
	        id: number;
	        data: Buffer | HexBuffer;
	    };
	}
	export interface CustomJsonOperation extends Operation {
	    0: 'custom_json';
	    1: {
	        required_auths: string[];
	        required_posting_auths: string[];
	        /** ID string, must be less than 32 characters long. */
	        id: string;
	        /** JSON encoded string, must be valid JSON. */
	        json: string;
	    };
	}
	export interface TransferOperation extends Operation {
	    0: 'transfer';
	    1: {
	        /** Sending account name. */
	        from: string;
	        /** Receiving account name. */
	        to: string;
	        /** Amount of STEEM or SBD to send. */
	        amount: string | Asset;
	        /** Plain-text note attached to transaction.  */
	        memo: string;
	    };
	}
	export interface AccountCreateOperation extends Operation {
	    0: 'account_create';
	    1: {
	        fee: string | Asset;
	        creator: string;
	        new_account_name: string;
	        owner: Authority;
	        active: Authority;
	        posting: Authority;
	        memo_key: string | PublicKey;
	        json_metadata: string;
	    };
	}
	export interface AccountCreateWithDelegationOperation extends Operation {
	    0: 'account_create_with_delegation';
	    1: {
	        fee: string | Asset;
	        delegation: string | Asset;
	        creator: string;
	        new_account_name: string;
	        owner: Authority;
	        active: Authority;
	        posting: Authority;
	        memo_key: string | PublicKey;
	        json_metadata: string;
	    };
	}
	export interface TransferToSavingsOperation extends Operation {
	    0: 'transfer_to_savings';
	    1: {
	        amount: string;
	        from: string;
	        memo: string;
	        request_id: number;
	        to: string;
	    };
	}
	export interface AccountUpdateOperation extends Operation {
	    0: 'account_update';
	    1: {
	        account: string;
	        owner?: Authority;
	        active?: Authority;
	        posting?: Authority;
	        memo_key: string | PublicKey;
	        json_metadata: string;
	    };
	}
	export interface CommentOptionsOperation extends Operation {
	    0: 'comment_options';
	    1: {
	        author: string;
	        permlink: string;
	        /** SBD value of the maximum payout this post will receive. */
	        max_accepted_payout: Asset | string;
	        /** The percent of Steem Dollars to key, unkept amounts will be received as Steem Power. */
	        percent_steem_dollars: number;
	        /** Whether to allow post to receive votes. */
	        allow_votes: boolean;
	        /** Whether to allow post to recieve curation rewards. */
	        allow_curation_rewards: boolean;
	        extensions: Array<[0, {
	            beneficiaries: BeneficiaryRoute[];
	        }]>;
	    };
	}

}
declare module 'dsteem/steem/transaction' {
	/**
	 * @file Steem transaction type definitions.
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
	import { Operation } from 'dsteem/steem/operation';
	export interface Transaction {
	    ref_block_num: number;
	    ref_block_prefix: number;
	    expiration: string;
	    operations: Operation[];
	    extensions: any[];
	}
	export interface SignedTransaction extends Transaction {
	    signatures: string[];
	}
	export interface TransactionConfirmation {
	    id: string;
	    block_num: number;
	    trx_num: number;
	    expired: boolean;
	}

}
declare module 'dsteem/steem/block' {
	/**
	 * @file Steem block type definitions.
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
	import { Transaction } from 'dsteem/steem/transaction';
	/**
	 * Unsigned block header.
	 */
	export interface BlockHeader {
	    previous: string;
	    timestamp: string;
	    witness: string;
	    transaction_merkle_root: string;
	    extensions: any[];
	}
	/**
	 * Full signed block.
	 */
	export interface SignedBlock extends BlockHeader {
	    block_id: string;
	    signing_key: string;
	    witness_signature: string;
	    transaction_ids: string[];
	    transactions: Transaction[];
	}

}
declare module 'dsteem/helpers/blockchain' {
	/// <reference types="node" />
	import { Client } from 'dsteem/client';
	import { BlockHeader, SignedBlock } from 'dsteem/steem/block';
	import { AppliedOperation } from 'dsteem/steem/operation';
	export enum BlockchainMode {
	    /**
	     * Only get irreversible blocks.
	     */
	    Irreversible = 0,
	    /**
	     * Get all blocks.
	     */
	    Latest = 1,
	}
	export interface BlockchainStreamOptions {
	    /**
	     * Start block number, inclusive. If omitted generation will start from current block height.
	     */
	    from?: number;
	    /**
	     * End block number, inclusive. If omitted stream will continue indefinitely.
	     */
	    to?: number;
	    /**
	     * Streaming mode, if set to `Latest` may include blocks that are not applied to the final chain.
	     * Defaults to `Irreversible`.
	     */
	    mode?: BlockchainMode;
	}
	export class Blockchain {
	    readonly client: Client;
	    constructor(client: Client);
	    /**
	     * Get latest block number.
	     */
	    getCurrentBlockNum(mode?: BlockchainMode): Promise<number>;
	    /**
	     * Get latest block header.
	     */
	    getCurrentBlockHeader(mode?: BlockchainMode): Promise<BlockHeader>;
	    /**
	     * Get latest block.
	     */
	    getCurrentBlock(mode?: BlockchainMode): Promise<SignedBlock>;
	    /**
	     * Return a asynchronous block number iterator.
	     * @param options Feed options, can also be a block number to start from.
	     */
	    getBlockNumbers(options?: BlockchainStreamOptions | number): AsyncIterableIterator<number>;
	    /**
	     * Return a stream of block numbers, accepts same parameters as {@link getBlockNumbers}.
	     */
	    getBlockNumberStream(options?: BlockchainStreamOptions | number): NodeJS.ReadableStream;
	    /**
	     * Return a asynchronous block iterator, accepts same parameters as {@link getBlockNumbers}.
	     */
	    getBlocks(options?: BlockchainStreamOptions | number): AsyncIterableIterator<SignedBlock>;
	    /**
	     * Return a stream of blocks, accepts same parameters as {@link getBlockNumbers}.
	     */
	    getBlockStream(options?: BlockchainStreamOptions | number): NodeJS.ReadableStream;
	    /**
	     * Return a asynchronous operation iterator, accepts same parameters as {@link getBlockNumbers}.
	     */
	    getOperations(options?: BlockchainStreamOptions | number): AsyncIterableIterator<AppliedOperation>;
	    /**
	     * Return a stream of operations, accepts same parameters as {@link getBlockNumbers}.
	     */
	    getOperationsStream(options?: BlockchainStreamOptions | number): NodeJS.ReadableStream;
	}

}
declare module 'dsteem/helpers/broadcast' {
	import { Client } from 'dsteem/client';
	import { PrivateKey } from 'dsteem/crypto';
	import { Asset } from 'dsteem/steem/asset';
	import { AccountCreateOperation, AccountUpdateOperation, CommentOperation, CommentOptionsOperation, CustomJsonOperation, DelegateVestingSharesOperation, Operation, TransferOperation, VoteOperation } from 'dsteem/steem/operation';
	import { SignedTransaction, TransactionConfirmation } from 'dsteem/steem/transaction';
	export interface CreateLoginOptions {
	    /**
	     * Username for the new account.
	     */
	    username: string;
	    /**
	     * Password for the new account, all keys will be derived from this.
	     */
	    password: string;
	    /**
	     * Creator account, fee will be deducted from this and the key to sign
	     * the transaction must be the creators active key.
	     */
	    creator: string;
	    /**
	     * Account creation fee. If omitted fee will be set to lowest possible.
	     */
	    fee?: string | Asset;
	    /**
	     * Optional account metadata.
	     */
	    metadata?: {
	        [key: string]: any;
	    };
	}
	export class BroadcastAPI {
	    readonly client: Client;
	    /**
	     * How many milliseconds to set transaction expiry from now when sending a transaction.
	     */
	    expireTime: number;
	    private pendingCallbacks;
	    constructor(client: Client);
	    /**
	     * Brodcast a comment, also used to create a new top level post.
	     * @param comment The comment/post.
	     * @param key Private posting key of comment author.
	     */
	    comment(comment: CommentOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Brodcast a comment and set the options.
	     * @param comment The comment/post.
	     * @param options The comment/post options.
	     * @param key Private posting key of comment author.
	     */
	    commentWithOptions(comment: CommentOperation[1], options: CommentOptionsOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Brodcast a vote.
	     * @param vote The vote to send.
	     * @param key Private posting key of the voter.
	     */
	    vote(vote: VoteOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Brodcast a transfer.
	     * @param data The transfer operation payload.
	     * @param key Private active key of sender.
	     */
	    transfer(data: TransferOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Brodcast custom JSON.
	     * @param data The custom_json operation payload.
	     * @param key Private posting or active key.
	     */
	    json(data: CustomJsonOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Create a new account.
	     * @param data The account_create operation payload.
	     * @param key Private active key of account creator.
	     */
	    createAccount(data: AccountCreateOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Convenience to create a new account with username and password.
	     * @param options New account options.
	     * @param key Private active key of account creator.
	     */
	    createLogin(options: CreateLoginOptions, key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Update account.
	     * @param data The account_update payload.
	     * @param key The private key of the account affected, should be the correspinding
	     *            key level or higher for updating account authorities.
	     */
	    updateAccount(data: AccountUpdateOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
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
	    delegateVestingShares(options: DelegateVestingSharesOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Sign and broadcast transaction with operations to the network. Throws if the transaction expires.
	     * @param operations List of operations to send.
	     * @param key Private key used to sign transaction.
	     */
	    sendOperations(operations: Operation[], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Broadcast a signed transaction to the network.
	     */
	    send(transaction: SignedTransaction): Promise<TransactionConfirmation>;
	    /**
	     * Convenience for calling `network_broadcast_api`.
	     */
	    call(method: string, params?: any[]): Promise<any>;
	    private waitForCallback(id);
	    private noticeHandler;
	    private closeHandler;
	}

}
declare module 'dsteem/helpers/database' {
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
	import { Client } from 'dsteem/client';
	import { ExtendedAccount } from 'dsteem/steem/account';
	import { BlockHeader, SignedBlock } from 'dsteem/steem/block';
	import { Discussion } from 'dsteem/steem/comment';
	import { DynamicGlobalProperties } from 'dsteem/steem/misc';
	import { ChainProperties } from 'dsteem/steem/misc';
	import { AppliedOperation } from 'dsteem/steem/operation';
	import { SignedTransaction, TransactionConfirmation } from 'dsteem/steem/transaction';
	/**
	 * Possible categories for `get_discussions_by_*`.
	 */
	export type DiscussionQueryCategory = 'active' | 'blog' | 'cashout' | 'children' | 'comments' | 'feed' | 'hot' | 'promoted' | 'trending' | 'votes';
	export interface DisqussionQuery {
	    /**
	     * Name of author or tag to fetch.
	     */
	    tag: string;
	    /**
	     * Number of results, max 100.
	     */
	    limit: number;
	    filter_tags?: string[];
	    select_authors?: string[];
	    select_tags?: string[];
	    /**
	     * Number of bytes of post body to fetch, default 0 (all)
	     */
	    truncate_body?: number;
	    /**
	     * Name of author to start from, used for paging.
	     * Should be used in conjunction with `start_permlink`.
	     */
	    start_author?: string;
	    /**
	     * Permalink of post to start from, used for paging.
	     * Should be used in conjunction with `start_author`.
	     */
	    start_permlink?: string;
	    parent_author?: string;
	    parent_permlink?: string;
	}
	export class DatabaseAPI {
	    readonly client: Client;
	    constructor(client: Client);
	    /**
	     * Convenience for calling `database_api`.
	     */
	    call(method: string, params?: any[]): Promise<any>;
	    /**
	     * Return state of server.
	     */
	    getDynamicGlobalProperties(): Promise<DynamicGlobalProperties>;
	    /**
	     * Return median chain properties decided by witness.
	     */
	    getChainProperties(): Promise<ChainProperties>;
	    /**
	     * Return server config. See:
	     * https://github.com/steemit/steem/blob/master/libraries/protocol/include/steemit/protocol/config.hpp
	     */
	    getConfig(): Promise<{
	        [name: string]: string | number | boolean;
	    }>;
	    /**
	     * Return header for *blockNum*.
	     */
	    getBlockHeader(blockNum: number): Promise<BlockHeader>;
	    /**
	     * Return block *blockNum*.
	     */
	    getBlock(blockNum: number): Promise<SignedBlock>;
	    /**
	     * Return all applied operations in *blockNum*.
	     */
	    getOperations(blockNum: number, onlyVirtual?: boolean): Promise<AppliedOperation[]>;
	    /**
	     * Return array of discussions (a.k.a. posts).
	     * @param by The type of sorting for the discussions, valid options are:
	     *           `active` `blog` `cashout` `children` `comments` `created`
	     *           `feed` `hot` `promoted` `trending` `votes`. Note that
	     *           for `blog` and `feed` the tag is set to a username.
	     */
	    getDiscussions(by: DiscussionQueryCategory, query: DisqussionQuery): Promise<Discussion[]>;
	    /**
	     * Return array of account info objects for the usernames passed.
	     * @param usernames The accounts to fetch.
	     */
	    getAccounts(usernames: string[]): Promise<ExtendedAccount[]>;
	    /**
	     * Convenience to fetch a block and return a specific transaction.
	     */
	    getTransaction(txc: TransactionConfirmation | {
	        block_num: number;
	        id: string;
	    }): Promise<SignedTransaction>;
	}

}
declare module 'dsteem/client' {
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	import * as WebSocket from 'ws';
	import { Blockchain } from 'dsteem/helpers/blockchain';
	import { BroadcastAPI } from 'dsteem/helpers/broadcast';
	import { DatabaseAPI } from 'dsteem/helpers/database';
	/**
	 * Main steem network chain id.
	 */
	export const DEFAULT_CHAIN_ID: Buffer;
	/**
	 * Main steem network address prefix.
	 */
	export const DEFAULT_ADDRESS_PREFIX = "STM";
	/**
	 * RPC Client options
	 * ------------------
	 * *Note* - The options inherited from `WebSocket.IClientOptions` are only
	 * valid when running in node.js, they have no effect in the browser.
	 */
	export interface ClientOptions extends WebSocket.IClientOptions {
	    /**
	     * Steem chain id. Defaults to main steem network:
	     * `0000000000000000000000000000000000000000000000000000000000000000`
	     */
	    chainId?: string;
	    /**
	     * Steem address prefix. Defaults to main steem network:
	     * `STM`
	     */
	    addressPrefix?: string;
	    /**
	     * Retry backoff function, returns milliseconds. Default = {@link defaultBackoff}.
	     */
	    backoff?: (tries: number) => number;
	    /**
	     * Whether to connect when {@link Client} instance is created. Default = `true`.
	     */
	    autoConnect?: boolean;
	    /**
	     * How long in milliseconds before a message times out, set to `0` to disable.
	     * Default = `14 * 1000`.
	     */
	    sendTimeout?: number;
	}
	/**
	 * RPC Client events
	 * -----------------
	 */
	export interface ClientEvents {
	    /**
	     * Emitted when the connection closes/opens.
	     */
	    on(event: 'open' | 'close', listener: () => void): this;
	    /**
	     * Emitted on error, throws if there is no listener.
	     */
	    on(event: 'error', listener: (error: Error) => void): this;
	    /**
	     * Emitted when recieveing a server notice message, typically only used for callbacks.
	     */
	    on(event: 'notice', listener: (notice: any) => void): this;
	    on(event: string, listener: Function): this;
	}
	/**
	 * RPC Client
	 * ----------
	 * Can be used in both node.js and the browser. Also see {@link ClientOptions}.
	 */
	export class Client extends EventEmitter implements ClientEvents {
	    /**
	     * Create a new client instance configured for the testnet.
	     */
	    static testnet(options?: ClientOptions): Client;
	    /**
	     * Client options, *read-only*.
	     */
	    readonly options: ClientOptions;
	    /**
	     * Address to Steem WebSocket RPC server, *read-only*.
	     */
	    readonly address: string;
	    /**
	     * Database API helper.
	     */
	    readonly database: DatabaseAPI;
	    /**
	     * Broadcast API helper.
	     */
	    readonly broadcast: BroadcastAPI;
	    /**
	     * Blockchain helper.
	     */
	    readonly blockchain: Blockchain;
	    /**
	     * Chain ID for current network.
	     */
	    readonly chainId: Buffer;
	    /**
	     * Address prefix for current network.
	     */
	    readonly addressPrefix: string;
	    private active;
	    private backoff;
	    private numRetries;
	    private pending;
	    private sendTimeout;
	    private seqNo;
	    private socket?;
	    /**
	     * @param address The address to the Steem RPC server, e.g. `wss://steemd.steemit.com`.
	     * @param options Client options.
	     */
	    constructor(address: string, options?: ClientOptions);
	    /**
	     * Return `true` if the client is connected, otherwise `false`.
	     */
	    isConnected(): boolean;
	    /**
	     * Connect to the server.
	     */
	    connect(): Promise<void>;
	    /**
	     * Disconnect from the server.
	     */
	    disconnect(): Promise<void>;
	    /**
	     * Make a RPC call to the server.
	     *
	     * @param api     The API to call, e.g. `database_api`.
	     * @param method  The API method, e.g. `get_dynamic_global_properties`.
	     * @param params  Array of parameters to pass to the method, optional.
	     *
	     */
	    call(api: string, method: string, params?: any[]): Promise<any>;
	    private send(request);
	    private rpcHandler;
	    private messageHandler;
	    private retryHandler;
	    private closeHandler;
	    private errorHandler;
	    private openHandler;
	    private write;
	    private flushPending();
	}

}
declare module 'dsteem/index-browser' {
	/**
	 * @file dsteem entry point for browsers.
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
	import 'core-js/es6/map';
	import 'core-js/es6/promise';
	import 'core-js/fn/array/from';
	import 'core-js/modules/es7.symbol.async-iterator';
	import 'regenerator-runtime/runtime';
	import * as utils from 'dsteem/utils';
	export { utils };
	export * from 'dsteem/helpers/blockchain';
	export * from 'dsteem/helpers/database';
	export * from 'dsteem/steem/account';
	export * from 'dsteem/steem/asset';
	export * from 'dsteem/steem/block';
	export * from 'dsteem/steem/comment';
	export * from 'dsteem/steem/misc';
	export * from 'dsteem/steem/operation';
	export * from 'dsteem/steem/transaction';
	export * from 'dsteem/client';
	export * from 'dsteem/crypto';

}
declare module 'dsteem' {
	/**
	 * @file dsteem entry point for node.js.
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
	import 'core-js/modules/es7.symbol.async-iterator';
	import * as utils from 'dsteem/utils';
	export { utils };
	export * from 'dsteem/helpers/blockchain';
	export * from 'dsteem/helpers/database';
	export * from 'dsteem/steem/account';
	export * from 'dsteem/steem/asset';
	export * from 'dsteem/steem/block';
	export * from 'dsteem/steem/comment';
	export * from 'dsteem/steem/misc';
	export * from 'dsteem/steem/operation';
	export * from 'dsteem/steem/transaction';
	export * from 'dsteem/client';
	export * from 'dsteem/crypto';

}
