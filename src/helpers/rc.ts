import { Client } from './../client'
import { Account } from './../steem/account'
import { RCAccount, RCParams, RCPool } from './../steem/rc'
import { getVests } from '../steem/misc'
import { DatabaseAPI } from './database'

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
    public async findRCAccounts(usernames: string[]): Promise<Array<RCAccount>> {
        let x = await this.call('find_rc_accounts', { accounts: usernames })
        return x['rc_accounts'] ? x['rc_accounts'] as Array<RCAccount> : x
    }

    /**
     * Returns the global resource params
     */
    public async getResourceParams(): Promise<RCParams> {
        let x = await this.call('get_resource_params', {})
        return x['resource_params'] ? x['resource_params'] as RCParams : x
    }

    /**
     * Returns the global resource pool
     */
    public async getResourcePool(): Promise<RCPool> {
        let x = await this.call('get_resource_pool', {})
        return x['resource_pool'] ? x['resource_pool'] as RCPool : x
    }

    /**
     * Makes a API call and returns the RC mana-data for a specified username
     */
    public async getRCMana(username: string) {
        let rc_account: RCAccount = await this.findRCAccounts([username])[0]
        return this.calculateRCMana(rc_account)
    }

    /**
     * Calculates the RC mana-data based on an RCAccount - findRCAccounts()
     */
    public async calculateRCMana(rc_account: RCAccount) {
        let max_mana: number = Number(rc_account.max_rc)
        let delta: number = Date.now() - rc_account.rc_manabar.last_update_time
        let current_mana: number = Number(rc_account.rc_manabar.current_mana) + (delta / 1000) * max_mana / (5 * 24 * 60 * 60)
        let percentage = (current_mana / max_mana).toFixed(2)
        return { current_mana, max_mana, percentage }
    }

    /**
     * Makes a API call and returns the VP mana-data for a specified username
     */
    public async getVPMana(username: string) {
        let account: Account = await this.client.call(`condenser_api`, 'get_accounts', [[username]])
        return this.calculateVPMana(account)
    }

    /**
     * Calculates the RC mana-data based on an Account - getAccounts()
     */
    public async calculateVPMana(account: Account) {
        let max_mana: number = getVests(account).amount
        let delta: number = Date.now() - account.voting_manabar.last_update_time
        let current_mana: number = Number(account.voting_manabar.current_mana) + (delta / 1000) * max_mana / (5 * 24 * 60 * 60)
        let percentage = (current_mana / max_mana).toFixed(2)
        return { current_mana, max_mana, percentage }
    }
}