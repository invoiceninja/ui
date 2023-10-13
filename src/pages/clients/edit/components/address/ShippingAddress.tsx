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
import { Button, InputField } from '$app/components/forms';
import { useCountries } from '$app/common/hooks/useCountries';
import { Client } from '$app/common/interfaces/client';
import { set } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { SearchableSelect } from '$app/components/SearchableSelect';

interface Props {
  client: Client | undefined;
  setClient: React.Dispatch<React.SetStateAction<Client | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  errors: ValidationBag | undefined;
}

export function ShippingAddress(props: Props) {
  const [t] = useTranslation();
  const countries = useCountries();

  const { errors, setErrors, setClient } = props;

  const handleChange = (property: string, value: string) => {
    setErrors(undefined);

    setClient(
      (client) => client && set(client, property, value)
    );
  };

  const copyBilling = () => {
    props.setClient(
      (client) =>
        client && {
          ...client,
          shipping_address1: client?.address1,
          shipping_address2: client?.address2,
          shipping_city: client?.city,
          shipping_state: client?.state,
          shipping_postal_code: client?.postal_code,
          shipping_country_id: client?.country_id,
        }
    );
  };

  return (
    <>
      <Button
        onClick={copyBilling}
        type="secondary"
        behavior="button"
        className="mx-4 rounded-md bg-grey h-6"
      >
        {t('copy_billing')}
      </Button>
      <Element leftSide={t('billing_address1')}>
        <InputField
          id="shipping_address1"
          value={props.client?.shipping_address1}
          onValueChange={(v) => handleChange('shipping_address1', v)}
          errorMessage={errors?.errors.shipping_address1}
        />
      </Element>

      <Element leftSide={t('address2')}>
        <InputField
          id="shipping_address2"
          value={props.client?.shipping_address2}
          onValueChange={(v) => handleChange('shipping_address2', v)}
        />
      </Element>

      <Element leftSide={t('city')}>
        <InputField
          id="shipping_city"
          value={props.client?.shipping_city}
          onValueChange={(v) => handleChange('shipping_city', v)}
          errorMessage={errors?.errors.shipping_city}
        />
      </Element>

      <Element leftSide={t('state')}>
        <InputField
          id="shipping_state"
          value={props.client?.shipping_state}
          onValueChange={(v) => handleChange('shipping_state', v)}
          errorMessage={errors?.errors.shipping_state}
        />
      </Element>

      <Element leftSide={t('postal_code')}>
        <InputField
          id="shipping_postal_code"
          value={props.client?.shipping_postal_code}
          onValueChange={(v) => handleChange('shipping_postal_code', v)}
          errorMessage={errors?.errors.shipping_postal_code}
        />
      </Element>
      {countries.length > 1 && (
        <Element leftSide={t('country')}>
          <SearchableSelect
            value={props.client?.shipping_country_id}
            errorMessage={errors?.errors.shipping_country_id}
            onValueChange={(v) => handleChange('shipping_country_id', v)}
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
