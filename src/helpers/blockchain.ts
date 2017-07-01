/**
 * @file Steem blockchain helpers.
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

import {Duplex} from 'stream'

import {Client} from './../client'
import {AssetString} from './../steem/asset'
import {BlockHeader, SignedBlock} from './../steem/block'
import {Bignum} from './../steem/misc'
import {AppliedOperation} from './../steem/operation'
import {iteratorStream, sleep} from './../utils'

export enum BlockchainMode {
    /**
     * Only get irreversible blocks.
     */
    Irreversible,
    /**
     * Get all blocks.
     */
    Latest,
}

export class Blockchain {

    /**
     * Block fetching mode. Defaults to `Irreversible`.
     */
    public mode = BlockchainMode.Irreversible

    constructor(readonly client: Client) {}

    /**
     * Get latest block number.
     */
    public async getCurrentBlockNum() {
        const props = await this.client.database.getDynamicGlobalProperties()
        switch (this.mode) {
            case BlockchainMode.Irreversible:
                return props.last_irreversible_block_num
            case BlockchainMode.Latest:
                return props.head_block_number
        }
    }

    /**
     * Get latest block header.
     */
    public async getCurrentBlockHeader() {
        return this.client.database.getBlockHeader(await this.getCurrentBlockNum())
    }

    /**
     * Get latest block.
     */
    public async getCurrentBlock() {
        return this.client.database.getBlock(await this.getCurrentBlockNum())
    }

    /**
     * Return a asynchronous block number iterator.
     * @param from Start block number, inclusive. If omitted generation will
     *             start from current block height.
     * @param to End block number, inclusive. If omitted iterator
     *           will continue indefinitely.
     */
    public async *getBlockNumbers(from?: number, to?: number) {
        // const config = await this.client.database.getConfig()
        // const interval = config['STEEMIT_BLOCK_INTERVAL'] as number
        const interval = 3
        let current = await this.getCurrentBlockNum()
        if (from !== undefined && from > current) {
            throw new Error(`From can't be larger than current block num (${ current })`)
        }
        let seen = from !== undefined ? from : current
        while (true) {
            while (current > seen) {
                yield seen++
                if (to !== undefined && seen > to) {
                    return
                }
            }
            sleep(interval * 1000)
            current = await this.getCurrentBlockNum()
        }
    }

    /**
     * Return a stream of block numbers, accepts same parameters as {@link getBlockNumbers}.
     */
    public getBlockNumberStream(from?: number, to?: number) {
        return iteratorStream(this.getBlockNumbers(from, to))
    }

    /**
     * Return a asynchronous block iterator, accepts same parameters as {@link getBlockNumbers}.
     */
    public async *getBlocks(from?: number, to?: number) {
        for await (const num of this.getBlockNumbers(from, to)) {
            yield await this.client.database.getBlock(num)
        }
    }

    /**
     * Return a stream of blocks, accepts same parameters as {@link getBlockNumbers}.
     */
    public getBlockStream(from?: number, to?: number) {
        return iteratorStream(this.getBlocks(from, to))
    }

    /**
     * Return a asynchronous operation iterator, accepts same parameters as {@link getBlockNumbers}.
     */
    public async *getOperations(from?: number, to?: number) {
        for await (const num of this.getBlockNumbers(from, to)) {
            const operations = await this.client.database.getOperations(num)
            for (const operation of operations) {
                yield operation
            }
        }
    }

    /**
     * Return a stream of operations, accepts same parameters as {@link getBlockNumbers}.
     */
    public getOperationsStream(from?: number, to?: number) {
        return iteratorStream(this.getOperations(from, to))
    }

}
