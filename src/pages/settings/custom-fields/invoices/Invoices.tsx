/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
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
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
    { name: t('invoices'), href: '/settings/custom_fields/invoices' },
  ];
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('custom_fields')}`;
  });

  return (
    <Settings
      title={t('custom_fields')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#custom_fields"
    >
      <Card title={`${t('custom_fields')}: ${t('invoices')}`}>
        {['invoice1', 'invoice2', 'invoice3', 'invoice4'].map((field) => (
          <Field key={field} field={field} placeholder={t('invoice_field')} />
        ))}
      </Card>

      <Card>
        {['surchage1', 'surchage2', 'surchage3', 'surchage4'].map(
          (field, index) => (
            <Element
              key={index}
              leftSide={
                <InputField id={field} placeholder={t('surcharge_field')} />
              }
            >
              <Toggle label={t('charge_taxes')} />
            </Element>
          )
        )}
      </Card>
    </Settings>
  );
}
