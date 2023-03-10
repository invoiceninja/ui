/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { useCountries } from '$app/common/hooks/useCountries';
import { Client } from '$app/common/interfaces/client';
import { set } from 'lodash';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client | undefined;
  setClient: React.Dispatch<React.SetStateAction<Client | undefined>>;
}

export function BillingAddress(props: Props) {
  const [t] = useTranslation();
  const countries = useCountries();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.setClient(
      (client) => client && set(client, event.target.id, event.target.value)
    );
  };

  return (
    <>
      <Element leftSide={t('billing_address1')}>
        <InputField
          id="address1"
          value={props.client?.address1}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('address2')}>
        <InputField
          id="address2"
          value={props.client?.address2}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('city')}>
        <InputField
          id="city"
          value={props.client?.city}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('state')}>
        <InputField
          id="state"
          value={props.client?.state}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('postal_code')}>
        <InputField
          id="postal_code"
          value={props.client?.postal_code}
          onChange={handleChange}
        />
      </Element>

      {countries.length > 1 && (
        <Element leftSide={t('country')}>
          <SelectField
            id="country_id"
            defaultValue={props.client?.country_id}
            onChange={handleChange}
          >
            <option value=""></option>

            {countries.map((country, index) => (
              <option key={index} value={country.id}>
                {country.name}
              </option>
            ))}
          </SelectField>
        </Element>
      )}
    </>
  );
}
