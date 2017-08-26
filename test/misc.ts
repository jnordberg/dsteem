import 'mocha'
import * as assert from 'assert'
import * as stream from 'stream'

import {utils} from './../src'

async function *counter(to: number) {
    for (var i = 0; i < to; i++) {
        yield {i}
    }
}

describe('iteratorStream', function() {

    it('should handle backpressure ', function(done) {
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
        }, 100)
    })

})

