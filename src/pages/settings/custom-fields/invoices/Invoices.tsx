/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useShouldDisableCustomFields } from 'common/hooks/useShouldDisableCustomFields';
import { useTitle } from 'common/hooks/useTitle';
import { CustomFieldsPlanAlert } from 'components/CustomFieldsPlanAlert';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { Settings } from '../../../../components/layouts/Settings';
import { Field } from '../components';

export function Invoices() {
  const { documentTitle } = useTitle('custom_fields');

  const [t] = useTranslation();

  const disabledCustomFields = useShouldDisableCustomFields();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
    { name: t('invoices'), href: '/settings/custom_fields/invoices' },
  ];

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#custom_fields"
    >
      <CustomFieldsPlanAlert />

      <Card title={`${t('custom_fields')}: ${t('invoices')}`}>
        {['invoice1', 'invoice2', 'invoice3', 'invoice4'].map((field) => (
          <Field key={field} field={field} placeholder={t('invoice_field')} />
        ))}
      </Card>
      <Card>
        {['surcharge1', 'surcharge2', 'surcharge3', 'surcharge4'].map(
          (field, index) => (
            <Element
              key={index}
              leftSide={
                <InputField
                  id={field}
                  placeholder={t('surcharge_field')}
                  disabled={disabledCustomFields}
                />
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
