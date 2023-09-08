/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { cloneDeep } from 'lodash';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';
import { SelectField } from '$app/components/forms';

interface Field {
  key: string;
  required: boolean;
  visible: boolean;
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
    { field: 'currency_id', label: t('currency') },
    { field: 'custom_value1', label: t('custom1') },
    { field: 'custom_value2', label: t('custom2') },
    { field: 'custom_value3', label: t('custom3') },
    { field: 'custom_value4', label: t('custom4') },
    { field: 'public_notes', label: t('public_notes') },
    { field: 'vat_number', label: t('vat_number') },
  ];

  const getFieldValue = (property: string) => {
    const fields: Field[] = cloneDeep(
      company?.client_registration_fields || []
    );

    const field = fields.find((field) => field.key === property);

    let fieldValue = 'hidden';

    if (field?.required && field?.visible) {
      fieldValue = 'required';
    }

    if (!field?.required && field?.visible) {
      fieldValue = 'optional';
    }

    return fieldValue;
  };

  const handleChangeFieldValue = (property: string, value: string) => {
    let existingFields: Field[] = cloneDeep(
      company?.client_registration_fields || []
    );

    const alreadyAdded = existingFields.some((field) => field.key === property);
    const index = fields.findIndex((field) => field.field === property);

    if (index >= 0) {
      let fieldValues = {
        visible: false,
        required: false,
      };

      if (value === 'optional') {
        fieldValues = { ...fieldValues, visible: true };
      }

      if (value === 'required') {
        fieldValues = { visible: true, required: true };
      }

      if (alreadyAdded) {
        const updatedFields = existingFields.map((field) => ({
          ...field,
          required:
            field.key === property ? fieldValues.required : field.required,
          visible: field.key === property ? fieldValues.visible : field.visible,
        }));

        handleChange('client_registration_fields', updatedFields);
      } else {
        const foundField = fields[index];

        existingFields = [
          ...existingFields,
          { key: foundField.field, ...fieldValues },
        ];

        handleChange('client_registration_fields', existingFields);
      }
    }
  };

  return (
    <Card title={t('registration')}>
      <Element
        leftSide={t('client_registration')}
        leftSideHelp={t('client_registration_help')}
      >
        <Toggle
          checked={Boolean(company?.client_can_register)}
          onValueChange={(value) => handleChange('client_can_register', value)}
        />
      </Element>

      <div className="pt-4 border-b"></div>

      {fields.map((field) => (
        <Element key={field.field} leftSide={field.label}>
          <SelectField
            value={getFieldValue(field.field)}
            onValueChange={(value) =>
              handleChangeFieldValue(field.field, value)
            }
          >
            <option value="hidden" defaultChecked>
              {t('hidden')}
            </option>
            <option value="optional">{t('optional')}</option>
            <option value="required">{t('required')}</option>
          </SelectField>
        </Element>
      ))}
    </Card>
  );
}
