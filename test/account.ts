import 'mocha'
import * as assert from 'assert'
import {inspect} from 'util'
import {randomBytes} from 'crypto'

import {PrivateKey, PublicKey, Signature} from './../src'

describe('account', function() {

    const testnetPair = {
        prefix: 'STX',
        private: '5JQy7moK9SvNNDxn8rKNfQYFME5VDYC2j9Mv2tb7uXV5jz3fQR8',
        public: '8FiV6v7yqYWTZz8WuFDckWr62L9X34hCy6koe8vd2cDJHimtgM',
    }

    const testSig = '202c52188b0ecbc26c766fe6d3ec68dac58644f43f43fc7d97da122f76fa028f98691dd48b44394bdd8cecbbe66e94795dcf53291a1ef7c16b49658621273ea68e'

    const testKey = new PrivateKey(randomBytes(32))

    it('should decode public keys', function() {
        const key = PublicKey.fromString(testnetPair.public)
        assert(key.toString(), testnetPair.public)
    })

    it('should decode private keys', function() {
        const key = PrivateKey.fromString(testnetPair.private)
        assert(key.toString(), testnetPair.private)
    })

    it('should create public from private', function() {
        const key = PrivateKey.fromString(testnetPair.private)
        assert(key.createPublic().toString(), testnetPair.public)
    })

    it('should conceal private key when inspecting', function() {
        const key = PrivateKey.fromString(testnetPair.private)
        assert.equal(inspect(key), 'PrivateKey: 5JQy7m...z3fQR8')
        assert.equal(inspect(key.createPublic()), 'PublicKey: 8FiV6v7yqYWTZz8WuFDckWr62L9X34hCy6koe8vd2cDJHimtgM')
    })

    it('should sign and verify', function() {
        const message = randomBytes(32)
        const signature = testKey.sign(message)
        assert(testKey.createPublic().verify(message, signature))
        signature.data.writeUInt8(0x42, 3)
        assert(!testKey.createPublic().verify(message, signature))
    })

    it('should de/encode signatures', function() {
        const signature = Signature.fromString(testSig)
        assert.equal(signature.toString(), testSig)
    })

    it('should recover pubkey from signatures', function() {
        const key = PrivateKey.fromString(testnetPair.private)
        const msg = randomBytes(32)
        const signature = key.sign(msg)
        assert.equal(signature.recover(msg).toString(), key.createPublic().toString())
    })

})
