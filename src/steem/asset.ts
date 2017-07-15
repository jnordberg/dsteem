/**
 * @file Steem asset type definitions and helpers.
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

import * as assert from 'assert'
import * as ByteBuffer from 'bytebuffer'

/**
 * Asset symbol string.
 */
export type AssetSymbol = 'STEEM' | 'VESTS'

/**
 * Class representing a steem asset, e.g. `1.000 STEEM` or `12.112233 VESTS`.
 */
export class Asset {

    /**
     * Create a new Asset instance from a string, e.g. `42.000 STEEM`.
     */
    public static fromString(string: string) {
        const [amountString, symbol] = string.split(' ')
        if (['STEEM', 'VESTS'].indexOf(symbol) === -1) {
            throw new Error(`Invalid asset symbol: ${ symbol }`)
        }
        const amount = Number.parseFloat(amountString)
        if (!Number.isFinite(amount)) {
            throw new Error(`Invalid asset amount: ${ amountString }`)
        }
        return new Asset(amount, symbol as AssetSymbol)
    }

    /**
     * Convenience to create new Asset.
     */
     public static from(value: string | Asset | number, symbol?: AssetSymbol) {
         if (value instanceof Asset) {
             return value
         } else if (typeof value === 'number') {
             return new Asset(value, symbol || 'STEEM')
         } else {
             return Asset.fromString(value)
         }
     }

    constructor(public readonly amount: number, public readonly symbol: AssetSymbol) {}

    /**
     * Return asset precision.
     */
    public getPrecision(): number {
        switch (this.symbol) {
            case 'STEEM':
                return 3
            case 'VESTS':
                return 6
        }
    }

    /**
     * Return a string representation of this asset, e.g. `42.000 STEEM`.
     */
    public toString(): string {
        return `${ this.amount.toFixed(this.getPrecision()) } ${ this.symbol }`
    }

    /**
     * Return a new Asset instance with amount added.
     */
     public add(amount: Asset | string | number): Asset {
         const other = Asset.from(amount, this.symbol)
         assert(this.symbol === other.symbol, 'can not add with different symbols')
         return new Asset(this.amount + other.amount, this.symbol)
     }

    /**
     * Return a new Asset instance with amount subtracted.
     */
     public subtract(amount: Asset | string | number): Asset {
         const other = Asset.from(amount, this.symbol)
         assert(this.symbol === other.symbol, 'can not subtract with different symbols')
         return new Asset(this.amount - other.amount, this.symbol)
     }

    /**
     * Return a new Asset with the amount multiplied by factor.
     */
     public multiply(factor: Asset | string | number): Asset {
         const other = Asset.from(factor, this.symbol)
         assert(this.symbol === other.symbol, 'can not multiply with different symbols')
         return new Asset(this.amount * other.amount, this.symbol)
     }

    /**
     * For JSON serialization, same as toString().
     */
    public toJSON(): string {
        return this.toString()
    }

}
