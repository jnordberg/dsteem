import 'mocha'
import * as assert from 'assert'

import { Client, Asset, Transaction, PrivateKey } from './../src/index-node'
import { getTestnetAccounts, randomString, agent, TEST_NODE } from './common'

describe('rc_api', function () {
    this.slow(500)
    this.timeout(20 * 1000)

    const client = Client.testnet({ agent })
    let serverConfig: { [key: string]: boolean | string | number }
    const liveClient = new Client(TEST_NODE, { agent })

    let acc: { username: string, posting: string, active: string }
    before(async function () {
        [acc] = await getTestnetAccounts()
    })

    // _calculateManabar max_mana: number, { current_mana, last_update_time }

    it('calculateVPMana', function() {
        let max_mana = 209662282841403
        let current_mana = 97630298249416
        let last_update_time = 1538095485

        //client.rc.calculateVPMana()
    })

    it('calculateRCMana', function() {
        let rc_account = { 
            account: 'therealwolf',
            rc_manabar: {
                current_mana: '100000',
                last_update_time: 1537064449
            },
            max_rc_creation_adjustment: {
                amount: '500',
                precision: 3,
                nai: '@@000000021'
            },
            max_rc: '1000000'
        }

        let bar = client.rc.calculateRCMana(rc_account)
        assert.equal(bar.percentage, 10000)
        assert.equal(bar.current_mana, 1000000)
        rc_account.rc_manabar.last_update_time = Date.now() / 1000
        bar = client.rc.calculateRCMana(rc_account)
        assert(bar.percentage > 1000 && bar.percentage < 1100)
    })

    it('verifyAuthority', async function() {
        this.slow(5 * 1000)
        const tx: Transaction = {
            ref_block_num: 0,
            ref_block_prefix: 0,
            expiration: '2000-01-01T00:00:00',
            operations: [['custom_json', {
                required_auths: [],
                required_posting_auths: [acc.username],
                id: 'rpc-params',
                json: '{"foo": "bar"}'
            }]],
            'extensions': [],
        }
        const key = PrivateKey.fromString(acc.posting)
        const stx = client.broadcast.sign(tx, key)
        const rv = await client.database.verifyAuthority(stx)
        assert(rv === true)
        const bogusKey = PrivateKey.fromSeed('ogus')
        try {
            await client.database.verifyAuthority(client.broadcast.sign(tx, bogusKey))
            assert(false, 'should not be reached')
        } catch (error) {
            assert.equal(error.message, `Missing Posting Authority ${ acc.username }`)
        }
    })
})
