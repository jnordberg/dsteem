import 'mocha'
import * as assert from 'assert'
import {VError} from 'verror'

import {Client, utils} from './../src/index-node'

describe('client', function() {
    this.slow(200)
    this.timeout(30 * 1000)

    const client = Client.testnet()
    const aclient = client as any

    it('should make rpc call', async function() {
        const result = await client.call('database_api', 'get_accounts', [['initminer']]) as any[]
        assert.equal(result.length, 1)
        assert.equal(result[0].name, 'initminer')
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

    it('should format rpc errors', async function() {
        const tx = {operations: [['witness_update', {}]]}
        try {
            await client.call('network_broadcast_api', 'broadcast_transaction', [tx])
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
