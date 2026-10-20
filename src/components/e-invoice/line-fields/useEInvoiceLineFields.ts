/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo, useRef } from 'react';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import {
  E_INVOICE_LINE_FIELDS,
  EInvoiceLinesRoot,
  getExposedLinePaths,
  getLineEntries,
  isEInvoiceLineFieldsSupported,
  resolveLineFields,
} from './fields';

interface Resource {
  id?: string;
  e_invoice?: unknown;
}

export const useEInvoiceLineFields = (
  resource: Resource | undefined,
  root: EInvoiceLinesRoot
) => {
  const company = useCurrentCompany();

  const shown = useRef<{ id?: string; keys: string[] }>({ keys: [] });

  const isAvailable =
    (company?.settings?.enable_e_invoice === true ||
      company?.settings?.e_invoice_type === 'PEPPOL') &&
    isEInvoiceLineFieldsSupported(company?.settings?.e_invoice_type);

  return useMemo(() => {
    if (!isAvailable) {
      return [];
    }

    const keys = resolveLineFields(
      getExposedLinePaths(company?.e_invoice),
      getLineEntries(resource?.e_invoice, root)
    ).map((field) => field.key);

    shown.current = {
      id: resource?.id,
      keys:
        shown.current.id === resource?.id
          ? [...new Set([...shown.current.keys, ...keys])]
          : keys,
    };

    return E_INVOICE_LINE_FIELDS.filter((field) =>
      shown.current.keys.includes(field.key)
    );
  }, [
    isAvailable,
    company?.e_invoice,
    resource?.id,
    resource?.e_invoice,
    root,
  ]);
};
