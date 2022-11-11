/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { WebhookConfiguration } from "./webhook-configuration";

export interface Subscription {    
    id: string,
    user_id: string,
    group_id: string,
    product_ids: string,
    name: string,
    recurring_product_ids: string,
    assigned_user_id: string,
    company_id: string,
    price: number,
    promo_price: number,
    frequency_id: string,
    auto_bill: string,
    promo_code: string,
    promo_discount: number,
    is_amount_discount: boolean,
    allow_cancellation: boolean,
    per_seat_enabled: boolean,
    max_seats_limit: number,
    trial_enabled: boolean,
    trial_duration: number,
    allow_query_overrides: boolean,
    allow_plan_changes: boolean,
    refund_period: number,
    webhook_configuration: WebhookConfiguration,
    purchase_page: string,
    currency_id: string,
    is_deleted: boolean,
    created_at: number,
    updated_at: number,
    archived_at: number,
    plan_map: string
}


  