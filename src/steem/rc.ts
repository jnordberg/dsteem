import { Bignum } from "./misc";
import { Nai, PriceType } from "./asset"


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
    pool_eq: string|number,
    max_pool_size: string|number,
    decay_params: {
        decay_per_time_unit: Bignum,
        decay_per_time_unit_denom_shift: number
    },
    min_decay: number
}

export interface PriceCurveParam {
    coeff_a: string,
    coeff_b: number, //could be Bignum
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
    pool: string
}

export interface RCAccount {
    account: string,
    rc_manabar: {
        current_mana: Bignum,
        last_update_time: number
    },
    max_rc_creation_adjustment: Nai|PriceType|string,
    max_rc: string|number
}
