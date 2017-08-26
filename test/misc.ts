import 'mocha'
import * as assert from 'assert'
import * as stream from 'stream'

import {utils} from './../src'

async function *counter(to: number) {
    for (var i = 0; i < to; i++) {
        yield {i}
    }
}

async function *errorCounter(to: number, errorAt: number) {
    for (var i = 0; i < to; i++) {
        yield {i}
        if (errorAt === i) {
            throw new Error('Oh noes')
        }
    }
}

describe('iteratorStream', function() {

    it('should handle backpressure', function(done) {
        this.slow(500)
        const s1 = new stream.PassThrough({highWaterMark: 10, objectMode: true})
        const s2 = utils.iteratorStream(counter(100))
        s2.pipe(s1)
        setTimeout(() => {
            let c = 0
            s1.on('data', (d: any) => {
                c = d.i
            })
            s1.on('end', () => {
                assert.equal(c, 99)
                done()
            })
        }, 50)
    })

    it('should handle errors', function(done) {
        const s = utils.iteratorStream(errorCounter(10, 2))
        let last = 0
        let sawError = false
        s.on('data', (d) => {
            last = d.i
        })
        s.on('error', (error) => {
            assert.equal(last, 2)
            sawError = true
        })
        s.on('end', () => {
            assert(sawError)
            done()
        })
    })

})

