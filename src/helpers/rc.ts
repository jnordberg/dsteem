import { Client } from './../client'
import { Account } from './../steem/account'
import { RCAccount, RCParams, RCPool } from './../steem/rc'
import { getVests } from '../steem/misc'

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
        let rc_account: RCAccount = (await this.findRCAccounts([username]))[0]
        return this.calculateRCMana(rc_account)
    }
    /**
    * Calculates the RC mana-data based on an RCAccount - findRCAccounts()
    */
    public calculateRCMana(rc_account: RCAccount) {
        let max_mana: number = Number(rc_account.max_rc)
        let delta: number = Date.now() / 1000 - rc_account.rc_manabar.last_update_time
        let current_mana: number = Number(rc_account.rc_manabar.current_mana) + (delta * max_mana / 432000)
        let percentage: number = Math.round(current_mana / max_mana * 10000)

        if (!isFinite(percentage)) percentage = 0
        if (percentage > 10000) percentage = 10000
        else if (percentage < 0) percentage = 0

        return { current_mana, max_mana, percentage }
    }
    /**
    * Makes a API call and returns the VP mana-data for a specified username
    */
    public async getVPMana(username: string) {
        let account: Account = (await this.client.call(`condenser_api`, 'get_accounts', [[username]]))[0]
        return this.calculateVPMana(account)
    }
    /**
    * Calculates the RC mana-data based on an Account - getAccounts()
    */
    public calculateVPMana(account: Account) {
        let max_mana: number = getVests(account) * Math.pow(10, 6)
        let delta: number = Date.now() / 1000 - account.voting_manabar.last_update_time
        let current_mana: number = Number(account.voting_manabar.current_mana) + (delta * max_mana / 432000)
        let percentage: number = Math.round(current_mana / max_mana * 10000)

        if (!isFinite(percentage)) percentage = 0
        if (percentage > 10000) percentage = 10000
        else if (percentage < 0) percentage = 0

        return { current_mana, max_mana, percentage }
    }
} 