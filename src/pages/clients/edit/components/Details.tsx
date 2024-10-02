/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { User } from '$app/common/interfaces/user';
import { useGroupSettingsQuery } from '$app/common/queries/group-settings';
import { useUsersQuery } from '$app/common/queries/users';
import { useTranslation } from 'react-i18next';
import { Client } from '$app/common/interfaces/client';
import { set } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { CustomField } from '$app/components/CustomField';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import Toggle from '$app/components/forms/Toggle';
import { EntityStatus } from '$app/components/EntityStatus';
interface Props {
  client: Client | undefined;
  setClient: Dispatch<SetStateAction<Client | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  errors: ValidationBag | undefined;
  page?: 'create' | 'edit';
}

export function Details(props: Props) {
  const [t] = useTranslation();
  const { data: users } = useUsersQuery();
  const { data: groupSettings } = useGroupSettingsQuery();

  const handleChange = (property: keyof Client, value: string | number) => {
    props.setErrors(undefined);

    props.setClient((client) => client && set({ ...client }, property, value));
  };

  const handleCustomFieldChange = (
    field: string,
    value: string | number | boolean
  ) => {
    props.setClient((client) => client && set({ ...client }, field, value));
  };

  const company = useCurrentCompany();

  return (
    <Card title={t('company_details')}>
      {props.client && props.page === 'edit' && (
        <Element leftSide={t('status')}>
          <EntityStatus entity={props.client} />
        </Element>
      )}

      <Element leftSide={t('name')}>
        <InputField
          value={props.client?.name || ''}
          onValueChange={(value) => handleChange('name', value)}
          errorMessage={props.errors?.errors.name}
        />
      </Element>

      <Element leftSide={t('number')}>
        <InputField
          value={props.client?.number || ''}
          onValueChange={(value) => handleChange('number', value)}
          errorMessage={props.errors?.errors.number}
        />
      </Element>

      {groupSettings && (
        <Element leftSide={t('group')}>
          <SelectField
            value={props.client?.group_settings_id}
            onValueChange={(value) => handleChange('group_settings_id', value)}
            errorMessage={props.errors?.errors.group_settings_id}
            withBlank
            customSelector
          >
            {groupSettings.map((group, index: number) => (
              <option value={group.id} key={index}>
                {group.name}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      {users && (
        <Element leftSide={t('user')}>
          <SelectField
            value={props.client?.assigned_user_id}
            onValueChange={(value) => handleChange('assigned_user_id', value)}
            errorMessage={props.errors?.errors.assigned_user_id}
            withBlank
            customSelector
          >
            {users.data.data.map((user: User, index: number) => (
              <option value={user.id} key={index}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      <Element leftSide={t('id_number')}>
        <InputField
          value={props.client?.id_number || ''}
          onValueChange={(value) => handleChange('id_number', value)}
          errorMessage={props.errors?.errors.id_number}
        />
      </Element>

      <Element leftSide={t('vat_number')}>
        <InputField
          value={props.client?.vat_number || ''}
          onValueChange={(value) => handleChange('vat_number', value)}
          errorMessage={props.errors?.errors.vat_number}
        />
      </Element>

      <Element leftSide={t('website')}>
        <InputField
          value={props.client?.website || ''}
          onValueChange={(value) => handleChange('website', value)}
          errorMessage={props.errors?.errors.website}
        />
      </Element>

      <Element leftSide={t('phone')}>
        <InputField
          value={props.client?.phone || ''}
          onValueChange={(value) => handleChange('phone', value)}
          errorMessage={props.errors?.errors.phone}
        />
      </Element>

      <Element leftSide={t('routing_id')}>
        <InputField
          value={props.client?.routing_id || ''}
          onValueChange={(value) => handleChange('routing_id', value)}
          errorMessage={props.errors?.errors.routing_id}
        />
      </Element>

      <Element leftSide={t('valid_vat_number')}>
        <Toggle
          checked={Boolean(props.client?.has_valid_vat_number)}
          onValueChange={(value) =>
            handleCustomFieldChange('has_valid_vat_number', value)
          }
        />
      </Element>

      <Element leftSide={t('tax_exempt')}>
        <Toggle
          checked={Boolean(props.client?.is_tax_exempt)}
          onValueChange={(value) =>
            handleCustomFieldChange('is_tax_exempt', value)
          }
        />
      </Element>

      <Element leftSide={t('classification')}>
        <SelectField
          value={props.client?.classification ?? ''}
          onValueChange={(value) => handleChange('classification', value)}
          withBlank
          customSelector
        >
          <option value="individual">{t('individual')}</option>
          <option value="business">{t('business')}</option>
          <option value="company">{t('company')}</option>
          <option value="partnership">{t('partnership')}</option>
          <option value="trust">{t('trust')}</option>
          <option value="charity">{t('charity')}</option>
          <option value="government">{t('government')}</option>
          <option value="other">{t('other')}</option>
        </SelectField>
      </Element>

      {company?.custom_fields?.client1 && (
        <CustomField
          field="client1"
          defaultValue={props.client?.custom_value1}
          value={company.custom_fields.client1}
          onValueChange={(value) =>
            handleCustomFieldChange('custom_value1', value)
          }
        />
      )}

      {company?.custom_fields?.client2 && (
        <CustomField
          field="client2"
          defaultValue={props.client?.custom_value2}
          value={company.custom_fields.client2}
          onValueChange={(value) =>
            handleCustomFieldChange('custom_value2', value)
          }
        />
      )}

      {company?.custom_fields?.client3 && (
        <CustomField
          field="client3"
          defaultValue={props.client?.custom_value3}
          value={company.custom_fields.client3}
          onValueChange={(value) =>
            handleCustomFieldChange('custom_value3', value)
          }
        />
      )}

      {company?.custom_fields?.client4 && (
        <CustomField
          field="client4"
          defaultValue={props.client?.custom_value4}
          value={company.custom_fields.client4}
          onValueChange={(value) =>
            handleCustomFieldChange('custom_value4', value)
          }
        />
      )}
    </Card>
  );
}
