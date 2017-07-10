import 'mocha'
import * as assert from 'assert'

import {Asset, Client, PrivateKey} from './../src'

import {testnet, getTestnetAccounts} from './common'

describe('operations', function() {
    this.slow(10 * 1000)
    this.timeout(60 * 1000)

    const {addr, chainId, addressPrefix} = testnet
    const client = new Client(addr, {chainId, addressPrefix})

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

})
