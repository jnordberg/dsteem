import 'mocha'
import * as assert from 'assert'

import { Client, Asset, Transaction, PrivateKey } from './../src'
import { getTestnetAccounts, randomString, agent, TEST_NODE } from './common'

describe('rc_api', function () {
    this.slow(500)
    this.timeout(20 * 1000)

    const client = Client.testnet({ agent })
    let serverConfig: { [key: string]: boolean | string | number }
    const liveClient = new Client(TEST_NODE, { agent })

    let acc: { username: string, posting: string, active: string }
    /*before(async function () {
        [acc] = await getTestnetAccounts()
    })*/

    // _calculateManabar max_mana: number, { current_mana, last_update_time }

    it('calculateVPMana', function() {
        let account: any = {
            name: 'therealwolf',
            voting_manabar: {
                current_mana: 130168665536029,
                last_update_time: Date.now() / 1000
            },
            vesting_shares: '80241942 VESTS',
            delegated_vesting_shares: '60666472 VESTS',
            received_vesting_shares: '191002659 VESTS'
        }

        let bar = client.rc.calculateVPMana(account)
        assert.equal(bar.percentage, 6181)
        account.voting_manabar.last_update_time = 1537064449
        bar = client.rc.calculateVPMana(account)
        assert.equal(bar.percentage, 10000)
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
        rc_account.rc_manabar.last_update_time = Date.now() / 1000
        bar = client.rc.calculateRCMana(rc_account)
        assert(bar.percentage >= 1000 && bar.percentage < 1100)
    })
})
