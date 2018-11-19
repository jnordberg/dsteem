/* tslint:disable:no-string-literal */

import { Client } from './../client'
import { Account } from './../steem/account'
import { getVests } from './../steem/misc'
import { Manabar, RCAccount, RCParams, RCPool } from './../steem/rc'

export class RCAPI {
    constructor(readonly client: Client) { }

    /**
     * Convenience for calling `rc_api`.
     */
    public call(method: string, params?: any) {
        return this.client.call('rc_api', method, params)
    }

    /**
     * Returns RC data for array of usernames
     */
    public async findRCAccounts(usernames: string[]): Promise<RCAccount[]> {
        return (await this.call('find_rc_accounts', { accounts: usernames }))['rc_accounts']
    }

    /**
     * Returns the global resource params
     */
    public async getResourceParams(): Promise<RCParams> {
        return (await this.call('get_resource_params', {}))['resource_params']
    }

    /**
     * Returns the global resource pool
     */
    public async getResourcePool(): Promise<RCPool> {
        return (await this.call('get_resource_pool', {}))['resource_pool']
    }

    /**
     * Makes a API call and returns the RC mana-data for a specified username
     */
    public async getRCMana(username: string): Promise<Manabar> {
        const rc_account: RCAccount = (await this.findRCAccounts([username]))[0]
        return this.calculateRCMana(rc_account)
    }

    /**
     * Makes a API call and returns the VP mana-data for a specified username
     */
    public async getVPMana(username: string): Promise<Manabar> {
        const account: Account = (await this.client.call(`condenser_api`, 'get_accounts', [[username]]))[0]
        return this.calculateVPMana(account)
    }

    /**
     * Calculates the RC mana-data based on an RCAccount - findRCAccounts()
     */
    public calculateRCMana(rc_account: RCAccount): Manabar {
        return this._calculateManabar(Number(rc_account.max_rc), rc_account.rc_manabar)
    }

    /**
     * Calculates the RC mana-data based on an Account - getAccounts()
     */
    public calculateVPMana(account: Account): Manabar {
        const max_mana: number = getVests(account) * Math.pow(10, 6)
        return this._calculateManabar(max_mana, account.voting_manabar)
    }

    /**
     * Internal convenience method to reduce redundant code
     */
    private _calculateManabar(max_mana: number, { current_mana, last_update_time }): Manabar {
        const delta: number = Date.now() / 1000 - last_update_time
        current_mana = Number(current_mana) + (delta * max_mana / 432000)
        let percentage: number = Math.round(current_mana / max_mana * 10000)

        if (!isFinite(percentage) || percentage < 0) {
            percentage = 0
        } else if (percentage > 10000) {
            percentage = 10000
        }

        return { current_mana, max_mana, percentage }
    }
}
