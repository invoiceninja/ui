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
import { useCurrentUser } from './useCurrentUser';
import { useReactSettingsField } from './useReactSettings';

export const GUIDED_INVOICE_ROLLOUT_DATE = '2026-08-09';

export const GUIDED_INVOICE_PATHS = {
  create: '/invoices/wizard',
  edit: '/invoices/wizard/edit/:id',
};

export const DETAILED_INVOICE_PATHS = {
  create: '/invoices/create',
  edit: '/invoices/:id/edit',
};

export function useShowGuidedInvoiceEditor(): boolean {
  const preference = useReactSettingsField('show_advanced_invoice_editor');
  const user = useCurrentUser();

  if (typeof preference === 'boolean') {
    return !preference;
  }

  if (!user?.created_at) {
    return false;
  }

  return (
    user.created_at >= dayjs(GUIDED_INVOICE_ROLLOUT_DATE).startOf('day').unix()
  );
}

export function useInvoiceEditorPaths() {
  return useShowGuidedInvoiceEditor()
    ? GUIDED_INVOICE_PATHS
    : DETAILED_INVOICE_PATHS;
}
