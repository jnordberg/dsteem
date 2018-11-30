import 'mocha'
import * as assert from 'assert'
import * as ByteBuffer from 'bytebuffer'

import {Types, Serializer, HexBuffer} from './../src'

/*
 Serializer tests in the format:
 [{"name": "Type[::Subtype]", "values": [["expected output as hex string", <value>]]}]
*/
const serializerTests = require('./serializer-tests.json')

function serialize(serializer: Serializer, data: any) {
    const buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    serializer(buffer, data)
    buffer.flip()
    return Buffer.from(buffer.toBuffer()).toString('hex')
}

describe('serializers', function() {

    for (const test of serializerTests) {
        it(test.name, () => {
            let serializer: Serializer
            if (test.name.indexOf('::') === -1) {
                serializer = Types[test.name]
            } else {
                const [base, ...sub] = test.name.split('::').map((t) => Types[t])
                serializer = base(...sub)
            }
            for (const [expected, value] of test.values) {
                const actual = serialize(serializer, value)
                assert.equal(actual, expected)
            }
        })
    }

    it('Binary', function() {
        const data = HexBuffer.from('026400c800')
        const r1 = serialize(Types.Binary(), HexBuffer.from([0x80, 0x00, 0x80]))
        assert.equal(r1, '03800080')
        const r2 = serialize(Types.Binary(), HexBuffer.from(Buffer.from('026400c800', 'hex')))
        assert.equal(r2, '05026400c800')
        const r3 = serialize(Types.Binary(5), HexBuffer.from(data))
        assert.equal(r3, '026400c800')
        assert.throws(() => {
            serialize(Types.Binary(10), data)
        })
    })

    it('Void', function() {
        assert.throws(() => { serialize(Types.Void, null) })
    })

    it('Invalid Operations', function() {
        assert.throws(() => { serialize(Types.Operation, ['transfer', {}]) })
        assert.throws(() => { serialize(Types.Operation, ['transfer', {from: 1}]) })
        assert.throws(() => { serialize(Types.Operation, ['transfer', 10]) })
    })

})
