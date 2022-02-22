/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { Invoice } from 'common/interfaces/invoice';
import { setCurrentInvoiceProperty } from 'common/stores/slices/invoices';
import { CustomField } from 'components/CustomField';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function Totals() {
  const [t] = useTranslation();
  const invoice = useCurrentInvoice();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const handleChange = (property: keyof Invoice, value: unknown) => {
    dispatch(
      setCurrentInvoiceProperty({
        property,
        value,
      })
    );
  };

  return (
    <Card className="col-span-12 xl:col-span-4 h-max">
      <Element leftSide={t('subtotal')} pushContentToRight>
        {invoice?.amount}
      </Element>

      <Element leftSide={t('balance_due')} pushContentToRight>
        {invoice?.balance}
      </Element>

      {invoice && company?.custom_fields?.surcharge1 && (
        <CustomField
          field="surcharge1"
          defaultValue={invoice?.custom_surcharge1 || ''}
          value={company.custom_fields.surcharge1}
          onChange={(value) => handleChange('custom_surcharge1', value)}
        />
      )}

      {invoice && company?.custom_fields?.surcharge2 && (
        <CustomField
          field="surcharge2"
          defaultValue={invoice?.custom_surcharge2 || ''}
          value={company.custom_fields.surcharge2}
          onChange={(value) => handleChange('custom_surcharge2', value)}
        />
      )}

      {invoice && company?.custom_fields?.surcharge3 && (
        <CustomField
          field="surcharge3"
          defaultValue={invoice?.custom_surcharge3 || ''}
          value={company.custom_fields.surcharge3}
          onChange={(value) => handleChange('custom_surcharge3', value)}
        />
      )}

      {invoice && company?.custom_fields?.surcharge4 && (
        <CustomField
          field="surcharge4"
          defaultValue={invoice?.custom_surcharge4 || ''}
          value={company.custom_fields.surcharge4}
          onChange={(value) => handleChange('custom_surcharge4', value)}
        />
      )}
    </Card>
  );
}
