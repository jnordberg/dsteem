import 'mocha'
import * as assert from 'assert'

import {Client, SignedBlock, AppliedOperation, BlockchainMode} from './../src'

describe('blockchain', function() {
    this.slow(2 * 1000)
    this.timeout(5 * 1000)

    const client = new Client('wss://steemd.steemit.com')

    const expectedIds = ['0000000109833ce528d5bbfb3f6225b39ee10086',
                         '00000002ed04e3c3def0238f693931ee7eebbdf1']
    const expectedOps = ['vote', 'vote', 'comment', 'vote', 'vote', 'vote', 'vote',
                         'custom_json', 'author_reward', 'fill_vesting_withdraw',
                         'fill_vesting_withdraw', 'comment', 'comment', 'vote', 'vote',
                         'vote', 'vote', 'comment', 'custom_json', 'custom_json',
                         'custom_json', 'custom_json', 'claim_reward_balance',
                         'custom_json', 'vote', 'comment', 'comment_options',
                         'custom_json', 'vote', 'curation_reward', 'author_reward',
                         'fill_vesting_withdraw', 'fill_vesting_withdraw' ]

    it('should yield blocks', async function() {
        let ids: string[] = []
        for await (const block of client.blockchain.getBlocks(1, 2)) {
            ids.push(block.block_id)
        }
        assert.deepEqual(ids, expectedIds)
    })

    it('should stream blocks', function(done) {
        const stream = client.blockchain.getBlockStream(1, 2)
        let ids: string[] = []
        stream.on('data', (block: SignedBlock) => {
            ids.push(block.block_id)
        })
        stream.on('error', done)
        stream.on('end', () => {
            assert.deepEqual(ids, expectedIds)
            done()
        })
    })

    it('should yield operations', async function() {
        let ops: string[] = []
        for await (const operation of client.blockchain.getOperations(13300000, 13300001)) {
            ops.push(operation.op[0])
        }
        assert.deepEqual(ops, expectedOps)
    })

    it('should stream operations', function(done) {
        const stream = client.blockchain.getOperationsStream(13300000, 13300001)
        let ops: string[] = []
        stream.on('data', (operation: AppliedOperation) => {
            ops.push(operation.op[0])
        })
        stream.on('error', done)
        stream.on('end', () => {
            assert.deepEqual(ops, expectedOps)
            done()
        })
    })

    it('should yield latest blocks', async function() {
        this.slow(10 * 1000)
        this.timeout(20 * 1000)
        client.blockchain.mode = BlockchainMode.Latest
        const latest = await client.blockchain.getCurrentBlock()
        for await (const block of client.blockchain.getBlocks()) {
            if (block.block_id === latest.block_id) {
                continue
            }
            assert(block.previous === latest.block_id)
            break
        }
    })

    it('should handle errors on stream', function(done) {
        const stream = client.blockchain.getBlockStream(Number.MAX_VALUE)
        stream.on('error', (error) => {
            done()
        })
    })

})
