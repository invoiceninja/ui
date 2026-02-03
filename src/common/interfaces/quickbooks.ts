/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Quickbooks {
    accessTokenKey: string;
    refresh_token: string;
    realmID: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
    baseURL: string;
    companyName: string;
    settings: QuickbooksSettings;
}

export interface QuickbooksSettings {
    client: QuickbooksSync;
    invoice: QuickbooksSync;
    vendor: QuickbooksSync;
    sales: QuickbooksSync;
    quote: QuickbooksSync;
    purchase_order: QuickbooksSync;
    product: QuickbooksSync;
    payment: QuickbooksSync;
    expense: QuickbooksSync;
    expense_category: QuickbooksSync;
    income_account_map: IncomeAccountMapEntry[];
    qb_income_account_id: string | null;
    tax_rate_map: TaxRateMapEntry[];
    automatic_taxes: boolean;
}

export enum QuickbooksSyncDirection {
    None = 'none',
    Push = 'push',
    Pull = 'pull',
    Bidirectional = 'bidirectional',
}

export interface QuickbooksSync {
    direction: QuickbooksSyncDirection;
}

export type IncomeAccountMapEntry = [id: string, name: string, fully_qualified_name: string];
export type TaxRateMapEntry = [id: string, name: string, rate: string];
