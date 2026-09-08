/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { Invoice } from '$app/common/interfaces/invoice';
import { QuickbooksSyncDirection } from '$app/common/interfaces/quickbooks';

export type QuickbooksInvoiceAction =
  | 'check_record'
  | 'force_link'
  | 'force_pull'
  | 'force_push';

export type QuickbooksCheckOutcome =
  | 'syncable'
  | 'linkable'
  | 'synced'
  | 'data_mismatch'
  | 'not_found'
  | 'voided';

export type QuickbooksCheckAction =
  | Exclude<QuickbooksInvoiceAction, 'check_record'>
  | 'change_invoice_number'
  | 'verify_quickbooks_invoice';

export interface QuickbooksValueComparison<T> {
  matches: boolean;
  invoice_ninja: T;
  quickbooks: T;
}

export interface QuickbooksInvoiceCheck {
  outcome: QuickbooksCheckOutcome;
  linked: boolean;
  message: string;
  checked_at: string;
  quickbooks: {
    id: string;
    number: string;
    total: number;
    balance: number;
    status: string;
    sync_token: string;
    last_updated_at: string;
  } | null;
  comparison: {
    number: QuickbooksValueComparison<string>;
    total: QuickbooksValueComparison<number>;
  } | null;
  recommended_actions: QuickbooksCheckAction[];
}

export interface QuickbooksCheckRecordResponse {
  data: Invoice;
  meta: {
    quickbooks_check: QuickbooksInvoiceCheck;
  };
}

export interface QuickbooksInvoiceActionResource {
  sync?: {
    qb_id?: string | null;
    qb_status?: string | null;
    qb_status_message?: string | null;
  };
}

export interface QuickbooksInvoiceActionCompany {
  quickbooks?: {
    settings?: {
      invoice?: {
        direction?: QuickbooksSyncDirection | string | null;
      };
    };
  };
}

export function hasQuickbooksConnection(
  company: QuickbooksInvoiceActionCompany | undefined
) {
  return Boolean(
    company?.quickbooks && Object.keys(company.quickbooks).length > 0
  );
}

export function isQuickbooksInvoicePushEnabled(
  company: QuickbooksInvoiceActionCompany | undefined
) {
  const direction = company?.quickbooks?.settings?.invoice?.direction;

  return (
    direction === QuickbooksSyncDirection.Push ||
    direction === QuickbooksSyncDirection.Bidirectional
  );
}

export function isQuickbooksInvoicePullEnabled(
  company: QuickbooksInvoiceActionCompany | undefined
) {
  const direction = company?.quickbooks?.settings?.invoice?.direction;

  return (
    direction === QuickbooksSyncDirection.Pull ||
    direction === QuickbooksSyncDirection.Bidirectional
  );
}

export function getQuickbooksInvoiceActions(
  invoice: QuickbooksInvoiceActionResource | undefined,
  company: QuickbooksInvoiceActionCompany | undefined
): QuickbooksInvoiceAction[] {
  if (!hasQuickbooksConnection(company)) {
    return [];
  }

  const actions: QuickbooksInvoiceAction[] = ['check_record'];
  const qbId = invoice?.sync?.qb_id?.trim();
  const status = invoice?.sync?.qb_status;
  const hasStatusMessage = Boolean(invoice?.sync?.qb_status_message?.trim());
  const pushEnabled = isQuickbooksInvoicePushEnabled(company);
  const pullEnabled = isQuickbooksInvoicePullEnabled(company);
  const canForcePush =
    (status === 'syncable' || status === 'synced') &&
    hasStatusMessage &&
    pushEnabled;

  if (!qbId) {
    if (status === 'linkable') {
      actions.push('force_link');
    }

    if (canForcePush) {
      actions.push('force_push');
    }

    return actions;
  }

  if (pullEnabled) {
    actions.push('force_pull');
  }

  if (canForcePush) {
    actions.push('force_push');
  }

  return actions;
}
