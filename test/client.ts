import 'mocha'
import * as assert from 'assert'
import {VError} from 'verror'

import {Client, utils} from './../src'

describe('client', function() {
    this.slow(200)
    this.timeout(30 * 1000)

    const client = Client.testnet()
    const aclient = client as any

    it('should make rpc call', async function() {
        const result = await client.call('condenser_api', 'get_accounts', [['initminer']]) as any[]
        assert.equal(result.length, 1)
        assert.equal(result[0].name, 'initminer')
    })

    it('should handle rpc errors', async function() {
        try {
            await client.call('condenser_api', 'i_like_turtles')
            assert(false, 'should not be reached')
        } catch (error) {
            assert.equal(error.name, 'RPCError')
            assert(error.message == `itr != _by_name.end(): no method with name 'i_like_turtles'` // pre-appbase
                || error.message == `method_itr != api_itr->second.end(): Could not find method i_like_turtles`) // appbase

            const info = VError.info(error)
            assert.equal(info.code, 10)
            assert.equal(info.name, 'assert_exception')
        }
    })

    it('should format rpc errors', async function() {
        const tx = {operations: [['witness_update', {}]]}
        try {
            await client.call('condenser_api', 'broadcast_transaction', [tx])
            assert(false, 'should not be reached')
        } catch (error) {
            assert.equal(error.name, 'RPCError')
            assert.equal(error.message, 'is_valid_account_name( name ): Account name ${n} is invalid n=')
            const info = VError.info(error)
            assert.equal(info.code, 10)
            assert.equal(info.name, 'assert_exception')
        }
    })

    it('should retry and timeout', async function() {
        this.slow(2500)
        aclient.timeout = 1000
        aclient.address = 'https://jnordberg.github.io/dsteem/FAIL'
        const backoff = aclient.backoff
        let seenBackoff = false
        aclient.backoff = (tries) => {
            seenBackoff = true
            return backoff(tries)
        }
        const tx = {operations: [['witness_update', {}]]}
        try {
            await client.database.getChainProperties()
            assert(false, 'should not be reached')
        } catch (error) {
            assert(seenBackoff, 'should have seen backoff')
        }
    })

})
