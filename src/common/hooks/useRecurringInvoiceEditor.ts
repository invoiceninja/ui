/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useHasPermission } from './permissions/useHasPermission';
import { useShowGuidedInvoiceEditor } from './useInvoiceEditor';

export const GUIDED_RECURRING_INVOICE_PATHS = {
  create: '/recurring_invoices/guided',
  edit: '/recurring_invoices/:id/guided',
};

export const DETAILED_RECURRING_INVOICE_PATHS = {
  create: '/recurring_invoices/create',
  edit: '/recurring_invoices/:id/edit',
};

export function useRecurringInvoiceEditorPaths() {
  const hasPermission = useHasPermission();

  const guided = useShowGuidedInvoiceEditor();
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
