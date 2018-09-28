import { SMTAsset } from './asset'
import { Bignum } from './misc'

export interface RCParams {
    resource_history_bytes: Resource,
    resource_new_accounts: Resource,
    resource_market_bytes: Resource,
    resource_state_bytes: Resource,
    resource_execution_time: Resource,
}
export interface Resource {
    resource_dynamics_params: DynamicParam,
    price_curve_params: PriceCurveParam
}
export interface DynamicParam {
    resource_unit: number,
    budget_per_time_unit: number,
    pool_eq: Bignum,
    max_pool_size: Bignum,
    decay_params: {
        decay_per_time_unit: Bignum,
        decay_per_time_unit_denom_shift: number
    },
    min_decay: number
}
export interface PriceCurveParam {
    coeff_a: Bignum,
    coeff_b: Bignum,
    shift: number
}
export interface RCPool {
    resource_history_bytes: Pool,
    resource_new_accounts: Pool,
    resource_market_bytes: Pool,
    resource_state_bytes: Pool,
    resource_execution_time: Pool
}
export interface Pool {
    pool: Bignum
}
export interface RCAccount {
    account: string,
    rc_manabar: {
        current_mana: Bignum,
        last_update_time: number
    },
    max_rc_creation_adjustment: SMTAsset | string,
    max_rc: Bignum
}

export interface Manabar {
    current_mana: number,
    max_mana: number,
    percentage: number
}
