import 'mocha'
import * as assert from 'assert'
import {VError} from 'verror'

import {Client, PrivateKey, signTransaction, CommentOperation, Transaction, utils} from './../src'

import {testnet, getTestnetAccounts, randomString} from './common'

describe('broadcast', function() {
    this.slow(10 * 1000)
    this.timeout(60 * 1000)

    const {addr, chainId, addressPrefix} = testnet
    const client = new Client(addr, {chainId, addressPrefix})

    let acc1, acc2: {username: string, password: string}
    before(async function() {
        [acc1, acc2] = await getTestnetAccounts()
    })

    const postPermlink = `dsteem-test-${ randomString(5) }`

    it('should broadcast', async function() {
        const key = PrivateKey.fromLogin(acc1.username, acc1.password, 'posting')
        const result = await client.broadcast.comment({
            parent_author: '',
            parent_permlink: 'parent',
            author: acc1.username,
            permlink: postPermlink,
            title: 'I like turtles',
            body: '🐢🐢🐢🐢🐢',
            json_metadata: JSON.stringify({foo: 'bar'}),
        }, key)
        const block = await client.database.getBlock(result.block_num)
        assert(block.transaction_ids.indexOf(result.id) !== -1)
    })

    it('should handle concurrent broadcasts', async function() {
        const key = PrivateKey.fromLogin(acc2.username, acc2.password, 'posting')
        const commentPromise = client.broadcast.comment({
            parent_author: acc1.username,
            parent_permlink: postPermlink,
            author: acc2.username,
            permlink: `${ postPermlink }-comment-1`,
            title: 'Comments has titles?',
            body: 'ME ALSO!!',
            json_metadata: '',
        }, key)
        const votePromise = client.broadcast.vote({
            voter: acc2.username,
            author: acc1.username,
            permlink: postPermlink,
            weight: 1337,
        }, key)
        const result = await Promise.all([commentPromise, votePromise])
        assert(result.every((r) => r.expired === false))
    })

})
