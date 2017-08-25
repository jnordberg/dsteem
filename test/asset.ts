import 'mocha'
import * as assert from 'assert'

import {Asset, Price} from './../src'

describe('asset', function() {

    it('should create from string', function() {
        const oneSteem = Asset.fromString('1.000 STEEM')
        assert.equal(oneSteem.amount, 1)
        assert.equal(oneSteem.symbol, 'STEEM')
        const vests = Asset.fromString('0.123456 VESTS')
        assert.equal(vests.amount, 0.123456)
        assert.equal(vests.symbol, 'VESTS')
        const sbd = Asset.from('0.444 SBD')
        assert.equal(sbd.amount, 0.444)
        assert.equal(sbd.symbol, 'SBD')
    })

    it('should convert to string', function() {
        const steem = new Asset(44.999999, 'STEEM')
        assert.equal(steem.toString(), '45.000 STEEM')
        const vests = new Asset(44.999999, 'VESTS')
        assert.equal(vests.toString(), '44.999999 VESTS')
    })

    it('should add and subtract', function() {
        const a = new Asset(44.999, 'STEEM')
        assert.equal(a.subtract(1.999).toString(), '43.000 STEEM')
        assert.equal(a.add(0.001).toString(), '45.000 STEEM')
        assert.equal(Asset.from('1.999 STEEM').subtract(a).toString(), '-43.000 STEEM')
        assert.equal(Asset.from(a).subtract(a).toString(), '0.000 STEEM')
        assert.equal(Asset.from('99.999999 VESTS').add('0.000001 VESTS').toString(), '100.000000 VESTS')
        assert.throws(() => Asset.fromString('100.000 STEEM').subtract('100.000000 VESTS'))
        assert.throws(() => Asset.from(100, 'VESTS').add(a))
        assert.throws(() => Asset.from(100).add('1.000000 VESTS'))
    })

    it('should throw on invalid strings', function() {
        assert.throws(() => Asset.fromString('1.000 SNACKS'))
        assert.throws(() => Asset.fromString('I LIKE TURT 0.42'))
        assert.throws(() => Asset.fromString('Infinity STEEM'))
        assert.throws(() => Asset.fromString('..0 STEEM'))
    })

    it('should parse price', function() {
        const price1 = new Price(Asset.from('1.000 STEEM'), Asset.from(1, 'SBD'))
        const price2 = Price.from(price1)
        const price3 = Price.from({base: '1.000 STEEM', quote: price1.quote})
        assert.equal(price2.base.toString(), price3.base.toString())
        assert.equal(price2.quote.toString(), price3.quote.toString())
    })

})

