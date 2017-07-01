
# [dsteem](https://github.com/jnordberg/dsteem) [![Build Status](https://img.shields.io/travis/jnordberg/dsteem.svg?style=flat-square)](https://travis-ci.org/jnordberg/dsteem) [![Coverage Status](https://img.shields.io/coveralls/jnordberg/dsteem.svg?style=flat-square)](https://coveralls.io/github/jnordberg/dsteem?branch=master) [![Package Version](https://img.shields.io/npm/v/dsteem.svg?style=flat-square)](https://www.npmjs.com/package/dsteem) ![License](https://img.shields.io/npm/l/dsteem.svg?style=flat-square)

[Steem blockchain](https://steem.io) WebSocket RPC client.

* **[Demo](https://comments.steem.vc)** ([source](https://github.com/jnordberg/dsteem/tree/master/examples/comment-feed))
* [Documentation](https://jnordberg.github.io/dsteem/)
* [Issues](https://github.com/jnordberg/dsteem/issues)

---


Minimal example
---------------

```typescript
import {Client} from 'dsteem'

const client = new Client('wss://steemd.steemit.com')

// get blocks using async iterator
for await (const block of client.blockchain.getBlocks()) {
    console.log(`Block ID: ${ block.block_id }`)
}

// get blocks using node-style streams
const stream = client.blockchain.getBlockStream()
stream.on('data', (block) => {
    console.log(`Block ID: ${ block.block_id }`)
})
```
