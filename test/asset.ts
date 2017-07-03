import 'mocha'
import * as assert from 'assert'

import {Asset} from './../src'

describe('asset', function() {

    it('should create from string', function() {
        const oneSteem = Asset.from('1.000 STEEM')
        assert.equal(oneSteem.amount, 1)
        assert.equal(oneSteem.symbol, 'STEEM')
        const vests = Asset.from('0.123456 VESTS')
        assert.equal(vests.amount, 0.123456)
        assert.equal(vests.symbol, 'VESTS')
    })

    it('should convert to string', function() {
        const steem = new Asset(44.999999, 'STEEM')
        assert.equal(steem.toString(), '45.000 STEEM')
        const vests = new Asset(44.999999, 'VESTS')
        assert.equal(vests.toString(), '44.999999 VESTS')
    })

    it('should throw on invalid strings', function() {
        assert.throws(() => Asset.from('1.000 SNACKS'))
        assert.throws(() => Asset.from('I LIKE TURT 0.42'))
        assert.throws(() => Asset.from('Infinity STEEM'))
        assert.throws(() => Asset.from('..0 STEEM'))
    })

})

