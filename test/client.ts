import 'mocha'
import * as assert from 'assert'
import {VError} from 'verror'

import {Client, utils} from './../src'

import {testnet} from './common'

describe('client', function() {
    this.slow(200)

    const {addr, chainId, addressPrefix} = testnet
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
        await utils.waitForEvent(client, 'open')
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
        const errorPromise = utils.waitForEvent(client, 'error')
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
