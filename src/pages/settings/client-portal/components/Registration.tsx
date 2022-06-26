/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { cloneDeep } from 'lodash';
import { useHandleCurrentCompanyChangeProperty } from 'pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';

interface Field {
  key: string;
  required: boolean;
}

export function Registration() {
  const [t] = useTranslation();

  const company = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const fields = [
    { field: 'first_name', label: t('first_name') },
    { field: 'last_name', label: t('last_name') },
    { field: 'email', label: t('email') },
    { field: 'phone', label: t('phone') },
    { field: 'password', label: t('password') },
    { field: 'name', label: t('name') },
    { field: 'website', label: t('website') },
    { field: 'address1', label: t('address1') },
    { field: 'address2', label: t('address2') },
    { field: 'city', label: t('city') },
    { field: 'state', label: t('state') },
    { field: 'postal_code', label: t('postal_code') },
    { field: 'country_id', label: t('country') },
    { field: 'custom_value1', label: t('custom1') },
    { field: 'custom_value2', label: t('custom2') },
    { field: 'custom_value3', label: t('custom3') },
    { field: 'custom_value4', label: t('custom4') },
    { field: 'public_notes', label: t('public_notes') },
    { field: 'vat_number', label: t('vat_number') },
  ];

  const isRequired = (property: string) => {
    const fields: Field[] = cloneDeep(
      company?.client_registration_fields || []
    );

    return fields.find((field) => field.key === property)?.required;
  };

  const handleRegistrationToggle = (property: string, value: boolean) => {
    const fields: Field[] = cloneDeep(
      company?.client_registration_fields || []
    );

    const index = fields.findIndex((field) => field.key === property);

    if (index >= 0) {
      fields[index].required = value;
    }

    handleChange('client_registration_fields', [...fields]);
  };

  return (
    <Card title={t('registration')}>
      <Element
        leftSide={t('client_registration')}
        leftSideHelp={t('client_registration_help')}
      >
        <Toggle
          checked={company?.settings.client_can_register}
          onValueChange={(value) =>
            handleChange('settings.client_can_register', value)
          }
        />
      </Element>

      <div className="pt-4 border-b"></div>

      {fields.map((field) => (
        <Element key={field.field} leftSide={field.label}>
          <Toggle
            checked={isRequired(field.field)}
            id={field.field}
            onValueChange={(value) =>
              handleRegistrationToggle(field.field, value)
            }
          />
        </Element>
      ))}
    </Card>
  );
}
