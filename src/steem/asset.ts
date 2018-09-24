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
export type AssetSymbol = 'STEEM' | 'VESTS' | 'SBD' | 'TESTS' | 'TBD'

/**
 * Class representing a steem asset, e.g. `1.000 STEEM` or `12.112233 VESTS`.
 */
export class Asset {

    /**
     * Create a new Asset instance from a string, e.g. `42.000 STEEM`.
     */
    public static fromString(string: string, expectedSymbol?: AssetSymbol) {
        const [amountString, symbol] = string.split(' ')
        if (['STEEM', 'VESTS', 'SBD', 'TESTS', 'TBD'].indexOf(symbol) === -1) {
            throw new Error(`Invalid asset symbol: ${ symbol }`)
        }
        if (expectedSymbol && symbol !== expectedSymbol) {
            throw new Error(`Invalid asset, expected symbol: ${ expectedSymbol } got: ${ symbol }`)
        }
        const amount = Number.parseFloat(amountString)
        if (!Number.isFinite(amount)) {
            throw new Error(`Invalid asset amount: ${ amountString }`)
        }
        return new Asset(amount, symbol as AssetSymbol)
    }

    /**
     * Convenience to create new Asset.
     * @param symbol Symbol to use when created from number. Will also be used to validate
     *               the asset, throws if the passed value has a different symbol than this.
     */
     public static from(value: string | Asset | number, symbol?: AssetSymbol) {
         if (value instanceof Asset) {
             if (symbol && value.symbol !== symbol) {
                 throw new Error(`Invalid asset, expected symbol: ${ symbol } got: ${ value.symbol }`)
             }
             return value
         } else if (typeof value === 'number' && Number.isFinite(value)) {
             return new Asset(value, symbol || 'STEEM')
         } else if (typeof value === 'string') {
             return Asset.fromString(value, symbol)
         } else {
             throw new Error(`Invalid asset '${ String(value) }'`)
         }
     }

    /**
     * Return the smaller of the two assets.
     */
    public static min(a: Asset, b: Asset) {
        assert(a.symbol === b.symbol, 'can not compare assets with different symbols')
        return a.amount < b.amount ? a : b
    }

    /**
     * Return the larger of the two assets.
     */
    public static max(a: Asset, b: Asset) {
        assert(a.symbol === b.symbol, 'can not compare assets with different symbols')
        return a.amount > b.amount ? a : b
    }

    constructor(public readonly amount: number, public readonly symbol: AssetSymbol) {}

    /**
     * Return asset precision.
     */
    public getPrecision(): number {
        switch (this.symbol) {
            case 'TESTS':
            case 'TBD':
            case 'STEEM':
            case 'SBD':
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
     * Return a new Asset with the amount divided.
     */
     public divide(divisor: Asset | string | number): Asset {
         const other = Asset.from(divisor, this.symbol)
         assert(this.symbol === other.symbol, 'can not divide with different symbols')
         return new Asset(this.amount / other.amount, this.symbol)
     }

    /**
     * For JSON serialization, same as toString().
     */
    public toJSON(): string {
        return this.toString()
    }

}

export type PriceType = Price | {base: Asset | string, quote: Asset | string}

/**
 * Represents quotation of the relative value of asset against another asset.
 * Similar to 'currency pair' used to determine value of currencies.
 *
 *  For example:
 *  1 EUR / 1.25 USD where:
 *  1 EUR is an asset specified as a base
 *  1.25 USD us an asset specified as a qute
 *
 *  can determine value of EUR against USD.
 */
export class Price {

    /**
     * Convenience to create new Price.
     */
     public static from(value: PriceType) {
         if (value instanceof Price) {
             return value
         } else {
             return new Price(Asset.from(value.base), Asset.from(value.quote))
         }
     }

    /**
     * @param base  - represents a value of the price object to be expressed relatively to quote
     *                asset. Cannot have amount == 0 if you want to build valid price.
     * @param quote - represents an relative asset. Cannot have amount == 0, otherwise
     *                asertion fail.
     *
     * Both base and quote shall have different symbol defined.
     */
    constructor(public readonly base: Asset, public readonly quote: Asset) {
        assert(base.amount !== 0 && quote.amount !== 0, 'base and quote assets must be non-zero')
        assert(base.symbol !== quote.symbol, 'base and quote can not have the same symbol')
    }

    /**
     * Return a string representation of this price pair.
     */
    public toString() {
        return `${ this.base }:${ this.quote }`
    }

    /**
     * Return a new Asset with the price converted between the symbols in the pair.
     * Throws if passed asset symbol is not base or quote.
     */
    public convert(asset: Asset) {
        if (asset.symbol === this.base.symbol) {
            assert(this.base.amount > 0)
            return new Asset(asset.amount * this.quote.amount / this.base.amount, this.quote.symbol)
        } else if (asset.symbol === this.quote.symbol) {
            assert(this.quote.amount > 0)
            return new Asset(asset.amount * this.base.amount / this.quote.amount, this.base.symbol)
        } else {
            throw new Error(`Can not convert ${ asset } with ${ this }`)
        }
    }

}
