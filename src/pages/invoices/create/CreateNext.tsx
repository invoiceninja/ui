/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { useBlankInvoiceQuery } from 'common/queries/invoices';
import { Default } from 'components/layouts/Default';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect } from 'react';
import { invoiceAtom } from '../common/atoms';

export function CreateNext() {
  const { documentTitle } = useTitle('new_invoice');
  const { data } = useBlankInvoiceQuery();

  const company = useCurrentCompany();
  const [invoice, setInvoice] = useAtom(invoiceAtom);

  useEffect(() => {
    if (data && typeof invoice === 'undefined') {
      const _invoice = cloneDeep(data);

      if (company && company.enabled_tax_rates > 0) {
        _invoice.tax_name1 = company.settings.tax_name1;
        _invoice.tax_rate1 = company.settings.tax_rate1;
      }

      if (company && company.enabled_tax_rates > 1) {
        _invoice.tax_name2 = company.settings.tax_name2;
        _invoice.tax_rate2 = company.settings.tax_rate2;
      }

      if (company && company.enabled_tax_rates > 2) {
        _invoice.tax_name3 = company.settings.tax_name3;
        _invoice.tax_rate3 = company.settings.tax_rate3;
      }

      setInvoice(_invoice);
    }

    return () => {
      setInvoice(undefined);
    };
  }, [data]);

  console.log(invoice);

  return <Default title={documentTitle}></Default>;
}
