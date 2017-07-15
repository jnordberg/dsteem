import 'mocha'
import * as assert from 'assert'

import {Client, Asset} from './../src'

import {testnet} from './common'

describe('database api', function() {
    this.slow(500)
    this.timeout(5 * 1000)

    const {addr, chainId, addressPrefix} = testnet
    const client = new Client(addr, {chainId, addressPrefix})
    let serverConfig: {[key: string]: boolean | string | number}

    const liveClient = new Client('wss://steemd.steemit.com')

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

    it('getDiscussions', async function() {
        this.slow(5 * 1000)
        this.timeout(10 * 1000)
        const r1 = await liveClient.database.getDiscussions('comments', {
            start_author: 'almost-digital',
            start_permlink: 're-pal-re-almost-digital-dsteem-a-strongly-typed-steem-client-library-20170702t131034262z',
            tag: 'almost-digital',
            limit: 1,
        })
        assert.equal(r1.length, 1)
        assert.equal(r1[0].body, '☀️heroin for programmers')
        const r2 = await liveClient.database.getDiscussions('promoted', {
            tag: 'steemit',
            limit: 2,
            start_author: 'aggroed',
            start_permlink: 'boston-steemit-meetup-hosted-by-aggroed-and-justtryme90-6-30-knight-moves-brookline-tuesday-august-1st-6-30pm',
        })
        assert.equal(r2.length, 2)
        assert.equal(r2[0].id, 6905705)
        assert.equal(r2[0].created, '2017-07-11T22:38:24')
        assert.equal(r2[1].id, 6582637)
        assert.equal(r2[1].author, 'isaacfrett')
        assert.equal(r2[1].permlink, 'isaac-from-iowa')
    })

    it('getTransaction', async function() {
        this.slow(5 * 1000)
        this.timeout(10 * 1000)
        const tx = await liveClient.database.getTransaction({id: 'c20a84c8a12164e1e0750f0ee5d3c37214e2f073', block_num: 13680277})
        assert.deepEqual(tx.signatures, ['201e02e8daa827382b1a3aefb6809a4501eb77aa813b705be4983d50d74c66432529601e5ae43981dcba2a7e171de5fd75be2e1820942260375d2daf647df2ccaa'])
        try {
            await client.database.getTransaction({id: 'c20a84c8a12164e1e0750f0ee5d3c37214e2f073', block_num: 1})
            assert(false, 'should not be reached')
        } catch (error) {
            assert.equal(error.message, 'Unable to find transaction c20a84c8a12164e1e0750f0ee5d3c37214e2f073 in block 1')
        }
    })

    it('getChainProperties', async function() {
        const props = await liveClient.database.getChainProperties()
        assert.equal(Asset.from(props.account_creation_fee).symbol, 'STEEM')
    })

})
