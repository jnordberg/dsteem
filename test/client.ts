import 'mocha'
import * as assert from 'assert'
import {VError} from 'verror'

import {Client, utils} from './../src'

describe('client', function() {
    this.slow(200)

    const client = Client.testnet()

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

})
