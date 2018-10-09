import 'mocha'
import * as assert from 'assert'

import {Client, SignedBlock, AppliedOperation, BlockchainMode} from './../src/index-node'

import {agent, TEST_NODE} from './common'

describe('blockchain', function() {
    this.slow(5 * 1000)
    this.timeout(60 * 1000)

    const client = new Client(TEST_NODE, {agent})

    const expectedIds = ['0000000109833ce528d5bbfb3f6225b39ee10086',
                         '00000002ed04e3c3def0238f693931ee7eebbdf1']
    const expectedOps = ['vote', 'vote', 'comment', 'vote', 'vote', 'vote', 'vote',
                         'custom_json', 'producer_reward', 'author_reward', 'fill_vesting_withdraw',
                         'fill_vesting_withdraw', 'comment', 'comment', 'vote', 'vote',
                         'vote', 'vote', 'comment', 'custom_json', 'custom_json',
                         'custom_json', 'custom_json', 'claim_reward_balance',
                         'custom_json', 'vote', 'comment', 'comment_options',
                         'custom_json', 'vote', 'producer_reward', 'curation_reward', 'author_reward',
                         'fill_vesting_withdraw', 'fill_vesting_withdraw' ]

    it('should yield blocks', async function() {
        let ids: string[] = []
        for await (const block of client.blockchain.getBlocks({from: 1, to: 2})) {
            ids.push(block.block_id)
        }
        assert.deepEqual(ids, expectedIds)
    })

    it('should stream blocks', async function() {
        await new Promise((resolve, reject) => {
            const stream = client.blockchain.getBlockStream({from: 1, to: 2})
            let ids: string[] = []
            stream.on('data', (block: SignedBlock) => {
                ids.push(block.block_id)
            })
            stream.on('error', reject)
            stream.on('end', () => {
                assert.deepEqual(ids, expectedIds)
                resolve()
            })
        })
    })

    it('should yield operations', async function() {
        let ops: string[] = []
        for await (const operation of client.blockchain.getOperations({from: 13300000, to: 13300001})) {
            ops.push(operation.op[0])
        }
        assert.deepEqual(ops, expectedOps)
    })

    it('should stream operations', async function() {
        await new Promise((resolve, reject) => {
            const stream = client.blockchain.getOperationsStream({from: 13300000, to: 13300001})
            let ops: string[] = []
            stream.on('data', (operation: AppliedOperation) => {
                ops.push(operation.op[0])
            })
            stream.on('error', reject)
            stream.on('end', () => {
                assert.deepEqual(ops, expectedOps)
                resolve()
            })
        })
    })

    it('should yield latest blocks', async function() {
        const latest = await client.blockchain.getCurrentBlock(BlockchainMode.Latest)
        for await (const block of client.blockchain.getBlocks({mode: BlockchainMode.Latest})) {
            if (block.block_id === latest.block_id) {
                continue
            }
            assert.equal(block.previous, latest.block_id, 'should have the same block id')
            break
        }
    })

    it('should handle errors on stream', async function() {
        await new Promise((resolve, reject) => {
            const stream = client.blockchain.getBlockStream(Number.MAX_VALUE)
            stream.on('data', () => {
                assert(false, 'unexpected stream data')
            })
            stream.on('error', (error) => {
                resolve()
            })
        })
    })

    it('should get block number stream', async function() {
        const current = await client.blockchain.getCurrentBlockNum()
        await new Promise(async (resolve, reject) => {
            const stream = client.blockchain.getBlockNumberStream()
            stream.on('data', (num) => {
                assert(num >= current)
                resolve()
            })
            stream.on('error', reject)
        })
    })

    it('should get current block header', async function() {
        const now = Date.now()
        const header = await client.blockchain.getCurrentBlockHeader()
        const ts = new Date(header.timestamp+'Z').getTime()
        assert(Math.abs((ts / 1000) - (now / 1000)) < 120, 'blockheader timestamp too old')
    })

})
