/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { VendorProps } from 'common/interfaces/vendor-props';
import { useUsersQuery } from 'common/queries/users';
import { Alert } from 'components/Alert';
import { CustomField } from 'components/CustomField';
import { useTranslation } from 'react-i18next';

export function Details(props: VendorProps) {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const { data: users } = useUsersQuery();

  return (
    <Card title={t('details')} className="mb-5">
      <Element leftSide={t('name')}>
        <InputField
          id="name"
          onChange={props.handleChange}
          value={props.data.name}
        />
        {props.errors?.notes && (
          <Alert type="danger">{props.errors.notes}</Alert>
        )}
      </Element>
      <Element leftSide={t('number')}>
        <InputField
          id="number"
          onChange={props.handleChange}
          value={props.data.number}
        />
      </Element>
      <Element leftSide={t('user')}>
        <SelectField
          id="user_id"
          defaultValue={'User'}
          onChange={props.handleChange}
        >
          <option value=""></option>
          {users?.data.data.map((user: any, index: any) => {
            return (
              <option value={user.id} key={index}>
                {user.first_name + ' ' + user.last_name}
              </option>
            );
          })}
        </SelectField>
      </Element>
      <Element leftSide={t('id_number')}>
        <InputField
          id="id_number"
          onChange={props.handleChange}
          value={props.data.id_number}
        />
      </Element>
      <Element leftSide={t('vat_number')}>
        <InputField
          id="vat_number"
          onChange={props.handleChange}
          value={props.data.vat_number}
        />
      </Element>
      <Element leftSide={t('website')}>
        <InputField
          id="website"
          onChange={props.handleChange}
          value={props.data.website}
        />
      </Element>
      <Element leftSide={t('phone')}>
        <InputField
          id="phone"
          onChange={props.handleChange}
          value={props.data.phone}
        />
      </Element>
      {company?.custom_fields?.vendor1 && (
        <CustomField
          field="custom_value1"
          defaultValue={props.data?.custom_value1}
          value={company.custom_fields.vendor1}
          onChange={(value) => props.setFieldValue('custom_value1', value)}
        />
      )}

      {company?.custom_fields?.vendor2 && (
        <CustomField
          field="custom_value2"
          defaultValue={props.data?.custom_value2}
          value={company.custom_fields.vendor2}
          onChange={(value) => props.setFieldValue('custom_value2', value)}
        />
      )}

      {company?.custom_fields?.vendor3 && (
        <CustomField
          field="custom_value3"
          defaultValue={props.data?.custom_value3}
          value={company.custom_fields.vendor3}
          onChange={(value) => props.setFieldValue('custom_value3', value)}
        />
      )}

      {company?.custom_fields?.vendor4 && (
        <CustomField
          field="custom_value4"
          defaultValue={props.data?.custom_value4}
          value={company.custom_fields.vendor4}
          onChange={(value) => props.setFieldValue('custom_value4', value)}
        />
      )}
    </Card>
  );
}
