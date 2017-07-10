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

import * as ByteBuffer from 'bytebuffer'

/**
 * Asset symbol string.
 */
export type AssetSymbol = 'STEEM' | 'VESTS'

/**
 * Asset string with amount and symbol, eg `0.123456 VESTS`
 */
export type AssetString = string

export class Asset {

    /**
     * Create a new Asset instance from an AssetString, e.g. `42.000 STEEM`.
     */
    public static fromString(string: AssetString) {
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
    public toString(): AssetString {
        return `${ this.amount.toFixed(this.getPrecision()) } ${ this.symbol }`
    }

    /**
     * For JSON serialization, same as toString().
     */
    public toJSON(): string {
        return this.toString()
    }

    /**
     * For protocol serialization.
     * @note This looses precision for amounts larger than 2^53-1/10^precision.
     *       Should not be a problem in real-word usage.
     */
    public writeTo(buffer: ByteBuffer) {
        const precision = this.getPrecision()
        buffer.writeInt64(Math.round(this.amount * Math.pow(10, precision)))
        buffer.writeUint8(precision)
        for (let i = 0; i < 7; i++) {
            buffer.writeUint8(this.symbol.charCodeAt(i) || 0)
        }
    }

}
