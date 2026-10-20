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
  EInvoiceLineField,
  EInvoiceLinesRoot,
  getEntryFields,
  getLineEntries,
  getLineTemplate,
  getTemplateFields,
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

  const shown = useRef<{ id?: string; fields: EInvoiceLineField[] }>({
    fields: [],
  });

  const isAvailable =
    company?.settings?.enable_e_invoice === true ||
    company?.settings?.e_invoice_type === 'PEPPOL';

  return useMemo(() => {
    if (!isAvailable) {
      return [];
    }

    const fields = [
      ...(shown.current.id === resource?.id ? shown.current.fields : []),
      ...getTemplateFields(getLineTemplate(company?.e_invoice)),
      ...getEntryFields(getLineEntries(resource?.e_invoice, root)),
    ].filter(
      (field, index, all) =>
        all.findIndex((current) => current.key === field.key) === index
    );

    shown.current = { id: resource?.id, fields };

    return fields;
  }, [
    isAvailable,
    company?.e_invoice,
    resource?.id,
    resource?.e_invoice,
    root,
  ]);
};
