/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { Settings } from '../../../../components/layouts/Settings';
import { Field } from '../components';

export function Invoices() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('custom_fields')}`;
  });

  return (
    <Settings title={t('custom_fields')}>
      <Card title={`${t('custom_fields')}: ${t('invoices')}`}>
        {['invoice1', 'invoice2', 'invoice3', 'invoice4'].map((field) => (
          <Field key={field} field={field} placeholder={t('invoice_field')} />
        ))}
      </Card>

      <Card>
        {['surchage1', 'surchage2', 'surchage3', 'surchage4'].map((field) => (
          <Element
            leftSide={
              <InputField id={field} placeholder={t('surcharge_field')} />
            }
          >
            <Toggle label={t('charge_taxes')} />
          </Element>
        ))}
      </Card>
    </Settings>
  );
}
