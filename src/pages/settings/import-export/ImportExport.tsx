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
import { Card, Element } from '../../../components/cards';
import { InputField, SelectField } from '../../../components/forms';
import { Settings } from '../../../components/layouts/Settings';

export function ImportExport() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('import_export'), href: '/settings/import_export' },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('import_export')}`;
  });

  return (
    <Settings
      title={t('import_export')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#import_export"
    >
      <Card withSaveButton saveButtonLabel={t('import')} title={t('import')}>
        <Element leftSide={t('import_type')}>
          <SelectField>
            <option value="csv">CSV</option>
          </SelectField>
        </Element>
        <Element leftSide={t('clients')}>
          <InputField id="clients" type="file" />
        </Element>
        <Element leftSide={t('invoices')}>
          <InputField id="invoices" type="file" />
        </Element>
        <Element leftSide={t('payments')}>
          <InputField id="payments" type="file" />
        </Element>
        <Element leftSide={t('products')}>
          <InputField id="products" type="file" />
        </Element>
        <Element leftSide={t('vendors')}>
          <InputField id="vendors" type="file" />
        </Element>
        <Element leftSide={t('expenses')}>
          <InputField id="expenses" type="file" />
        </Element>
      </Card>

      <Card withSaveButton saveButtonLabel={t('export')} title={t('export')}>
        <Element>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellat
          repudiandae error, assumenda dolore qui id?
        </Element>
      </Card>
    </Settings>
  );
}
