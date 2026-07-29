/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { QuickbooksSyncDirection } from '$app/common/interfaces/quickbooks';

export type QuickbooksInvoiceAction =
  | 'force_link'
  | 'force_pull'
  | 'force_push';

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
      return ['force_link'];
    }

    if (canForcePush) {
      return ['force_push'];
    }

    return [];
  }

  const actions: QuickbooksInvoiceAction[] = [];

  if (pullEnabled) {
    actions.push('force_pull');
  }

  if (canForcePush) {
    actions.push('force_push');
  }

  return actions;
}
