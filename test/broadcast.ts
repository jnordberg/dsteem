import 'mocha'
import * as assert from 'assert'
import * as lorem from 'lorem-ipsum'
import {VError} from 'verror'

import {Client, PrivateKey, utils} from './../src'

import {getTestnetAccounts, randomString, agent} from './common'

describe('broadcast', function() {
    this.slow(10 * 1000)
    this.timeout(60 * 1000)

    const client = Client.testnet({agent})

    let acc1, acc2: {username: string, password: string}
    before(async function() {
        [acc1, acc2] = await getTestnetAccounts()
    })

    const postPermlink = `dsteem-test-${ randomString(7) }`

    it('should broadcast', async function() {
        const key = PrivateKey.fromLogin(acc1.username, acc1.password, 'posting')
        const body = [
            `![picture](https://unsplash.it/1200/800?image=${ ~~(Math.random() * 1085) })`,
            '\n---\n',
            lorem({count: ~~(1 + Math.random() * 10), units: 'paragraphs'}),
            '\n\n🐢'
        ].join('\n')
        const result = await client.broadcast.comment({
            parent_author: '',
            parent_permlink: 'test',
            author: acc1.username,
            permlink: postPermlink,
            title: `Picture of the day #${ ~~(Math.random() * 1e8) }`,
            body,
            json_metadata: JSON.stringify({foo: 'bar', tags: ['test']}),
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
            permlink: `${ postPermlink }-botcomment-1`,
            title: 'Comments has titles?',
            body: `Amazing post! Revoted upsteemed and trailing! @${ acc2.username }`,
            json_metadata: '',
        }, key)
        const votePromise = client.broadcast.vote({
            voter: acc2.username,
            author: acc1.username,
            permlink: postPermlink,
            weight: 10000,
        }, key)
        const result = await Promise.all([commentPromise, votePromise])
        assert(result.every((r) => r.expired === false))
    })

})
