import 'mocha'
import * as assert from 'assert'
import {inspect} from 'util'

import {PrivateKey, PublicKey} from './../src'

describe('account', function() {

    const testnetPair = {
        prefix: 'STX',
        private: '5JQy7moK9SvNNDxn8rKNfQYFME5VDYC2j9Mv2tb7uXV5jz3fQR8',
        public: '8FiV6v7yqYWTZz8WuFDckWr62L9X34hCy6koe8vd2cDJHimtgM',
    }

    it('should decode public keys', function() {
        const key = PublicKey.fromEncoded(testnetPair.public)
        assert(key.toEncoded(), testnetPair.public)
    })

    it('should decode private keys', function() {
        const key = PrivateKey.fromEncoded(testnetPair.private)
        assert(key.toEncoded(), testnetPair.private)
    })

    it('should create public from private', function() {
        const key = PrivateKey.fromEncoded(testnetPair.private)
        assert(key.createPublic().toEncoded(), testnetPair.public)
    })

    it('should conceal private key when inspecting', function() {
        const key = PrivateKey.fromEncoded(testnetPair.private)
        assert.equal(inspect(key), 'PrivateKey: 5JQy7m...z3fQR8')
        assert.equal(inspect(key.createPublic()), 'PublicKey: 8FiV6v7yqYWTZz8WuFDckWr62L9X34hCy6koe8vd2cDJHimtgM')
    })




})
