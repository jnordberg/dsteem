import 'mocha'
import * as assert from 'assert'

import {Client} from './../src'

import {testnet} from './common'

describe('database api', function() {
    this.slow(200)

    const {addr, chainId, addressPrefix} = testnet
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
