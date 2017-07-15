import 'mocha'
import * as assert from 'assert'
import {inspect} from 'util'
import {randomBytes} from 'crypto'

import {
    PrivateKey,
    PublicKey,
    Signature,
    signTransaction,
    Operation,
    Transaction,
    DEFAULT_ADDRESS_PREFIX,
    DEFAULT_CHAIN_ID
} from './../src'

describe('crypto', function() {

    const testnetPrefix = 'STX'
    const testnetPair = {
        private: '5JQy7moK9SvNNDxn8rKNfQYFME5VDYC2j9Mv2tb7uXV5jz3fQR8',
        public: 'STX8FiV6v7yqYWTZz8WuFDckWr62L9X34hCy6koe8vd2cDJHimtgM',
    }
    const mainPair = {
        private: '5K2yDAd9KAZ3ZitBsAPyRka9PLFemUrbcL6UziZiPaw2c6jCeLH',
        public: 'STM8QykigLRi9ZUcNy1iXGY3KjRuCiLM8Ga49LHti1F8hgawKFc3K',
    }
    const mainPairPub = Buffer.from('03d0519ddad62bd2a833bee5dc04011c08f77f66338c38d99c685dee1f454cd1b8', 'hex')

    const testSig = '202c52188b0ecbc26c766fe6d3ec68dac58644f43f43fc7d97da122f76fa028f98691dd48b44394bdd8cecbbe66e94795dcf53291a1ef7c16b49658621273ea68e'
    const testKey = PrivateKey.from(randomBytes(32))

    it('should decode public keys', function() {
        const k1 = PublicKey.fromString(testnetPair.public, testnetPrefix)
        assert(k1.toString(), testnetPair.public)
        const k2 = PublicKey.from(mainPair.public)
        const k3 = PublicKey.from(mainPairPub)
        assert(k2.toString(), mainPair.public)
        assert(k2.toString(), k3.toString())
    })

    it('should decode private keys', function() {
        const k1 = PrivateKey.fromString(testnetPair.private)
        assert(k1.toString(), testnetPair.private)
        const k2 = PrivateKey.from(mainPair.private)
        assert(k2.toString(), mainPair.private)
    })

    it('should create public from private', function() {
        const key = PrivateKey.fromString(testnetPair.private)
        assert(key.createPublic().toString(), testnetPair.public)
    })

    it('should handle prefixed keys', function() {
        const key = PublicKey.from(testnetPair.public, testnetPrefix)
        assert(key.toString(), testnetPair.public)
        assert(PrivateKey.fromString(testnetPair.private).createPublic(testnetPrefix).toString(), testnetPair.public)
    })

    it('should conceal private key when inspecting', function() {
        const key = PrivateKey.fromString(testnetPair.private)
        assert.equal(inspect(key), 'PrivateKey: 5JQy7m...z3fQR8')
        assert.equal(inspect(key.createPublic(testnetPrefix)), 'PublicKey: STX8FiV6v7yqYWTZz8WuFDckWr62L9X34hCy6koe8vd2cDJHimtgM')
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

    it('should create key from login', function() {
        const key = PrivateKey.fromLogin('foo', 'barman')
        assert.equal(key.createPublic().toString(), 'STM87F7tN56tAUL2C6J9Gzi9HzgNpZdi6M2cLQo7TjDU5v178QsYA')
    })

    it('should sign transaction', function() {
        const tx: Transaction = {
            ref_block_num: 1234,
            ref_block_prefix: 1122334455,
            expiration: '2017-07-15T16:51:19',
            extensions: [
                'long-pants'
            ],
            operations: [
                ['vote', {voter: 'foo', author: 'bar', permlink: 'baz', weight: 10000}]
            ]
        }
        const key = PrivateKey.fromSeed('hello')
        assert.equal(key.toString(), '5JA5gN4G78DhFSW4jr28vjb8JEX5UhVMZB16Jr6MjDGaeguJEvm')
        const signed = signTransaction(tx, key, {chainId: DEFAULT_CHAIN_ID, addressPrefix: DEFAULT_ADDRESS_PREFIX})
        assert.deepEqual(signed.signatures, ['2063acd57592a38ce486c77cdb9a05bcaea85b6a20ce65990c759b82296596e116751661df9aad0849392c64c2a1186115cea2e499f2b96f21309155c28a3a7217'])
    })

    it('should handle serialization errors', function() {
        const tx: any = {
            ref_block_num: 1234,
            ref_block_prefix: 1122334455,
            expiration: new Date().toISOString().slice(0, -5),
            extensions: [],
            operations: [
                ['shutdown_network', {}]
            ]
        }
        try {
            signTransaction(tx, testKey, {chainId: DEFAULT_CHAIN_ID, addressPrefix: DEFAULT_ADDRESS_PREFIX})
            assert(false, 'should not be reached')
        } catch (error) {
            assert.equal(error.name, 'SerializationError')
        }
    })

})
