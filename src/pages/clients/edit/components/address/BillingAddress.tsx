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
import { InputField } from '$app/components/forms';
import { useCountries } from '$app/common/hooks/useCountries';
import { Client } from '$app/common/interfaces/client';
import { set } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { SearchableSelect } from '$app/components/SearchableSelect';

interface Props {
  client: Client | undefined;
  setClient: Dispatch<SetStateAction<Client | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  errors: ValidationBag | undefined;
}

export function BillingAddress(props: Props) {
  const [t] = useTranslation();
  const countries = useCountries();

  const { errors, setClient, setErrors } = props;

  const handleChange = (property: string, value: string) => {
    setErrors(undefined);

    setClient(
      (client) => client && set(client, property, value)
    );
  };

  return (
    <>
      <Element leftSide={t('billing_address1')}>
        <InputField
          id="address1"
          value={props.client?.address1}
          onValueChange={(v) => handleChange('address1', v)}
          errorMessage={errors?.errors.address1}
        />
      </Element>

      <Element leftSide={t('address2')}>
        <InputField
          id="address2"
          value={props.client?.address2}
          errorMessage={errors?.errors.address2}
          onValueChange={(v) => handleChange('address2', v)}
        />
      </Element>

      <Element leftSide={t('city')}>
        <InputField
          id="city"
          value={props.client?.city}
          onValueChange={(v) => handleChange('city', v)}
          errorMessage={errors?.errors.city}
        />
      </Element>

      <Element leftSide={t('state')}>
        <InputField
          id="state"
          value={props.client?.state}
          onValueChange={(v) => handleChange('state', v)}
          errorMessage={errors?.errors.state}
        />
      </Element>

      <Element leftSide={t('postal_code')}>
        <InputField
          id="postal_code"
          value={props.client?.postal_code}
          onValueChange={(v) => handleChange('postal_code', v)}
          errorMessage={errors?.errors.postal_code}
        />
      </Element>

      {countries.length > 1 && (
        <Element leftSide={t('country')}>
          <SearchableSelect
            value={props.client?.country_id}
            errorMessage={errors?.errors.country_id}
            onValueChange={(v) => handleChange('country_id', v)}
          >
            <option value=""></option>

            {countries.map((country, index) => (
              <option key={index} value={country.id}>
                {country.name}
              </option>
            ))}
          </SearchableSelect>
        </Element>
      )}
    </>
  );
}
