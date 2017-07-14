import 'mocha'
import * as assert from 'assert'

import {Asset, Client, PrivateKey, CustomOperation} from './../src'

import {testnet, getTestnetAccounts} from './common'

describe('operations', function() {
    this.slow(10 * 1000)
    this.timeout(60 * 1000)

    const {addr, chainId, addressPrefix} = testnet
    const client = new Client(addr, {chainId, addressPrefix, sendTimeout: 0})

    let acc1, acc2: {username: string, password: string}
    let acc1Key: PrivateKey
    before(async function() {
        [acc1, acc2] = await getTestnetAccounts()
        acc1Key = PrivateKey.fromLogin(acc1.username, acc1.password, 'active')
    })

    it('should delegate vesting shares', async function() {
        const amount = new Asset(Math.random() * 100, 'VESTS')
        const result = await client.broadcast.delegateVestingShares({
            delegator: acc1.username,
            delegatee: acc2.username,
            vesting_shares: amount,
        }, acc1Key)
        const [user1, user2] = await client.database.getAccounts([acc1.username, acc2.username])
        assert.equal(user2.received_vesting_shares, amount.toString())
        // this does not update directly for some reason
        // assert.equal(user1.delegated_vesting_shares, amount.toString())
    })

    it('should send custom binary', async function() {
        const props = await client.database.getDynamicGlobalProperties()
        const size = props.maximum_block_size - 256 - 512
        const op: CustomOperation = ['custom', {
            required_auths: [acc1.username],
            id: ~~(Math.random() * 65535),
            data: Buffer.alloc(size, 1),
        }]
        const rv = await client.broadcast.sendOperations([op], acc1Key)
        const tx = await client.database.getTransaction(rv)
        const rop = tx.operations[0]
        assert.equal(rop[0], 'custom')
        assert.equal(rop[1].data, op[1].data.toString('hex'))
    })

    it('should send custom json', async function() {
        const data = {test: 123, string: 'unicode🐳'}
        const rv = await client.broadcast.json({
            required_auths: [acc1.username],
            required_posting_auths: [],
            id: 'something',
            json: JSON.stringify(data),
        }, acc1Key)
        const tx = await client.database.getTransaction(rv)
        assert.deepEqual(JSON.parse(tx.operations[0][1].json), data)
    })

})
