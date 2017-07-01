
import 'mocha'

import * as assert from 'assert'
import {VError} from 'verror'

import {Client, ClientOptions, BlockchainMode} from './../src'
import {waitForEvent} from './../src/utils'
import {SignedBlock} from './../src/steem/block'
import {AppliedOperation} from './../src/steem/operation'

const addr = 'wss://testnet.steem.vc'
const chainId = '79276aea5d4877d9a25892eaa01b0adf019d3e5cb12a97478df3298ccdd01673'
const addressPrefix = 'STX'

describe('client', function() {
    this.slow(200)

    const client = new Client(addr, {chainId, addressPrefix, autoConnect: false})
    const aclient = client as any

    it('should connect', async function() {
        this.slow(1000)
        await client.connect()
        assert(client.isConnected())
    })

    it('should make rpc call', async function() {
        const result = await client.call('database_api', 'get_accounts', [['initminer']]) as any[]
        assert.equal(result.length, 1)
        assert.equal(result[0].name, 'initminer')
    })

    it('should reconnect on disconnection', async function() {
        this.slow(1000)
        aclient.socket.close()
        await waitForEvent(client, 'open')
    })

    it('should flush call buffer on reconnection', async function() {
        this.slow(1500)
        aclient.socket.close()
        const p1 = client.call('database_api', 'get_accounts', [['initminer']])
        const p2 = client.call('database_api', 'get_accounts', [['null']])
        const [r1, r2] = await Promise.all([p1, p2])
        assert.equal(r1.length, 1)
        assert.equal(r1[0].name, 'initminer')
        assert.equal(r2.length, 1)
        assert.equal(r2[0].name, 'null')
    })

    it('should time out when loosing connection', async function() {
        this.slow(1000)
        aclient.sendTimeout = 100
        await client.disconnect()
        try {
            await client.call('database_api', 'get_accounts', [['initminer']]) as any[]
            assert(false, 'should not be reached')
        } catch (error) {
            assert.equal(error.name, 'TimeoutError')
        }
        aclient.sendTimeout = 5000
        await client.connect()
    })

    it('should handle rpc errors', async function() {
        try {
            await client.call('database_api', 'i_like_turtles')
            assert(false, 'should not be reached')
        } catch (error) {
            assert.equal(error.name, 'RPCError')
            assert.equal(error.message, `itr != _by_name.end(): no method with name 'i_like_turtles'`)
            const info = VError.info(error)
            assert.equal(info.code, 10)
            assert.equal(info.name, 'assert_exception')
            assert.equal(info.stack[0].data.name, 'i_like_turtles')
        }
    })

    it('should handle garbled data from server', async function() {
        const errorPromise = waitForEvent(client, 'error')
        aclient.messageHandler({data: 'this}}is notJSON!'})
        const error: any = await errorPromise
        assert(error.name, 'MessageError')
    })

    it('should handle write errors', async function() {
        const socketSend = aclient.socket.send
        aclient.socket.send = () => { throw new Error('Send fail') }
        try {
            await client.call('database_api', 'i_like_turtles')
            assert(false, 'should not be reached')
        } catch (error) {
            assert.equal(error.message, 'Send fail')
        }
        aclient.socket.send = socketSend
    })

    it('should disconnect', async function() {
        await client.disconnect()
        assert(!client.isConnected())
    })

})

describe('database api', function() {
    this.slow(200)

    const client = new Client(addr, {chainId, addressPrefix})
    let serverConfig: {[key: string]: boolean | string | number}

    it('getDynamicGlobalProperties', async function() {
        const result = await client.database.getDynamicGlobalProperties()
        assert.deepEqual(Object.keys(result), [
            'id', 'head_block_number', 'head_block_id', 'time', 'current_witness',
            'total_pow', 'num_pow_witnesses', 'virtual_supply', 'current_supply',
            'confidential_supply', 'current_sbd_supply', 'confidential_sbd_supply',
            'total_vesting_fund_steem', 'total_vesting_shares', 'total_reward_fund_steem',
            'total_reward_shares2', 'pending_rewarded_vesting_shares',
            'pending_rewarded_vesting_steem', 'sbd_interest_rate', 'sbd_print_rate',
            'average_block_size', 'maximum_block_size', 'current_aslot',
            'recent_slots_filled', 'participation_count', 'last_irreversible_block_num',
            'max_virtual_bandwidth', 'current_reserve_ratio', 'vote_power_reserve_rate'
        ])
    })

    it('getConfig', async function() {
        const result = await client.database.getConfig()
        assert.equal(result['STEEMIT_CHAIN_ID'], client.options.chainId)
        serverConfig = result
    })

    it('getBlockHeader', async function() {
        const result = await client.database.getBlockHeader(1)
        assert.equal('0000000000000000000000000000000000000000', result.previous)
    })

    it('getBlock', async function() {
        const result = await client.database.getBlock(1)
        assert.equal('0000000000000000000000000000000000000000', result.previous)
        assert.equal(serverConfig['STEEMIT_INIT_PUBLIC_KEY_STR'], result.signing_key)
    })

    it('getOperations', async function() {
        const result = await client.database.getOperations(1)
        assert.deepEqual(result, [])
    })

})

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

describe('asset', function() {


})