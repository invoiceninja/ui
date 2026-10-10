/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useHasPermission } from './permissions/useHasPermission';
import { useCurrentUser } from './useCurrentUser';
import { useReactSettingsField } from './useReactSettings';

export const GUIDED_RECURRING_INVOICE_ROLLOUT_DATE = '2026-08-09';

export const GUIDED_RECURRING_INVOICE_PATHS = {
  create: '/recurring_invoices/guided',
  edit: '/recurring_invoices/:id/guided',
};

export const DETAILED_RECURRING_INVOICE_PATHS = {
  create: '/recurring_invoices/create',
  edit: '/recurring_invoices/:id/edit',
};

export function useShowGuidedRecurringInvoiceEditor() {
  const user = useCurrentUser();
  const preference = useReactSettingsField(
    'show_advanced_recurring_invoice_editor'
  );

  if (typeof preference === 'boolean') {
    return !preference;
  }

  if (!user?.created_at) {
    return false;
  }

  return (
    user.created_at >=
    dayjs(GUIDED_RECURRING_INVOICE_ROLLOUT_DATE).startOf('day').unix()
  );
}

export function useRecurringInvoiceEditorPaths() {
  const hasPermission = useHasPermission();

  const guided = useShowGuidedRecurringInvoiceEditor();
  const editable = hasPermission('edit_recurring_invoice');

  return useMemo(
    () => ({
      create: guided
        ? GUIDED_RECURRING_INVOICE_PATHS.create
        : DETAILED_RECURRING_INVOICE_PATHS.create,
      edit:
        guided && editable
          ? GUIDED_RECURRING_INVOICE_PATHS.edit
          : DETAILED_RECURRING_INVOICE_PATHS.edit,
    }),
    [guided, editable]
  );
}
