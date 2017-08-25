import 'mocha'
import * as assert from 'assert'
import * as ByteBuffer from 'bytebuffer'

import {Types, Serializer} from '../src/steem/serializer'

function serialize(serializer: Serializer, data: any) {
    const buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    serializer(buffer, data, {addressPrefix: 'STM'})
    buffer.flip()
    return Buffer.from(buffer.toBuffer()).toString('hex')
}

describe('serializers', function() {

    it('Array', function() {
        const r1 = serialize(Types.Array(Types.String), ['foo', 'bar'])
        assert.equal(r1, '0203666f6f03626172')
        const r2 = serialize(Types.Array(Types.UInt16), [100, 200])
        assert.equal(r2, '026400c800')
    })

    it('Buffer', function() {
        const r1 = serialize(Types.Buffer, Buffer.from([0x80, 0x00, 0x80]))
        assert.equal(r1, '03800080')
        const r2 = serialize(Types.Buffer, Buffer.from('026400c800', 'hex'))
        assert.equal(r2, '05026400c800')
    })

    it('Date', function() {
        const r1 = serialize(Types.Date, '2017-07-15T16:51:19')
        assert.equal(r1, '07486a59')
        const r2 = serialize(Types.Date, '2000-01-01T00:00:00')
        assert.equal(r2, '80436d38')
    })

    it('Transaction', function() {
        const tx: any = {
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
        const r1 = serialize(Types.Transaction, tx)
        assert.equal(r1, 'd204f776e54207486a59010003666f6f036261720362617a1027010a6c6f6e672d70616e7473')
    })

    it('Void', function() {
        assert.throws(() => { serialize(Types.Void, null) })
    })

    it('Optional', function() {
        const r1 = serialize(Types.Optional(Types.Boolean), true)
        const r2 = serialize(Types.Optional(Types.Boolean), undefined)
        assert.equal(r1, '0101')
        assert.equal(r2, '00')
    })

})
