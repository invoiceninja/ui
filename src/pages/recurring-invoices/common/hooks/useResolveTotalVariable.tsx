/* eslint-disable react/display-name */

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from './useFormatMoney';
import { CustomField } from 'components/CustomField';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Element } from '@invoiceninja/cards';
import { useSetCurrentRecurringInvoiceProperty } from './useSetCurrentRecurringInvoiceProperty';
import { useResolveTranslation } from 'pages/invoices/common/hooks/useResolveTranslation';
import { resolveTotalVariable } from 'pages/invoices/common/helpers/resolve-total-variable';
import { useCurrentRecurringInvoice } from 'common/hooks/useCurrentRecurringInvoice';

export function useResolveTotalVariable() {
  const formatMoney = useFormatMoney();
  const invoice = useCurrentRecurringInvoice();
  const company = useCurrentCompany();
  const handleChange = useSetCurrentRecurringInvoiceProperty();
  const resolveTranslation = useResolveTranslation();

  const aliases: Record<string, string> = {
    total: 'amount',
  };

  return (variable: string) => {
    let value = 0;

    const { property } = resolveTotalVariable(variable);
    const identifier = aliases[property] || property;

    if (variable === '$custom_surcharge1') {
      return (
        <CustomField
          field="surcharge1"
          defaultValue={invoice?.custom_surcharge1 || ''}
          value={company?.custom_fields.surcharge1 || ''}
          onChange={(value) => handleChange('custom_surcharge1', value)}
        />
      );
    }

    if (variable === '$custom_surcharge2') {
      return (
        <CustomField
          field="surcharge2"
          defaultValue={invoice?.custom_surcharge2 || ''}
          value={company?.custom_fields.surcharge2 || ''}
          onChange={(value) => handleChange('custom_surcharge2', value)}
        />
      );
    }

    if (variable === '$custom_surcharge3') {
      return (
        <CustomField
          field="surcharge3"
          defaultValue={invoice?.custom_surcharge3 || ''}
          value={company?.custom_fields.surcharge3 || ''}
          onChange={(value) => handleChange('custom_surcharge3', value)}
        />
      );
    }

    if (variable === '$custom_surcharge4') {
      return (
        <CustomField
          field="surcharge4"
          defaultValue={invoice?.custom_surcharge4 || ''}
          value={company?.custom_fields.surcharge4 || ''}
          onChange={(value) => handleChange('custom_surcharge4', value)}
        />
      );
    }

    if (invoice) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      value = invoice[identifier] ?? 0;
    }

    return (
      <Element leftSide={resolveTranslation(identifier, '$')}>
        {formatMoney(value)}
      </Element>
    );
  };
}
