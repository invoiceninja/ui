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
import { VendorProps } from 'common/interfaces/vendor-props';
import { useStaticsQuery } from 'common/queries/statics';
import { Alert } from 'components/Alert';
import { useTranslation } from 'react-i18next';

export function Address(props: VendorProps) {
  const [t] = useTranslation();
  const { data: statics } = useStaticsQuery();

  return (
    <Card title={t('address')} className="mb-5">
      {props.errors?.notes && <Alert type="danger">{props.errors.notes}</Alert>}
      <Element leftSide={t('address1')}>
        <InputField
          id="address1"
          onChange={props.handleChange}
          value={props.data.address1}
        />
      </Element>
      <Element leftSide={t('address2')}>
        <InputField
          id="address2"
          onChange={props.handleChange}
          value={props.data.address2}
        />
      </Element>
      <Element leftSide={t('city')}>
        <InputField
          id="city"
          onChange={props.handleChange}
          value={props.data.city}
        />
      </Element>
      <Element leftSide={t('state')}>
        <InputField
          id="state"
          onChange={props.handleChange}
          value={props.data.state}
        />
      </Element>
      <Element leftSide={t('postal_code')}>
        <InputField
          id="postal_code"
          onChange={props.handleChange}
          value={props.data.postal_code}
        />
      </Element>
      <Element leftSide={t('country_id')}>
        <SelectField
          value={props.data.country_id}
          onChange={(event: any) => {
            props.setFieldValue('country_id', event.target.value);
          }}
        >
          <option value=""></option>
          {statics?.data.countries.map((element: any, index: any) => {
            return (
              <option value={element.id} key={index}>
                {element.full_name}
              </option>
            );
          })}
        </SelectField>
      </Element>
    </Card>
  );
}
