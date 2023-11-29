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
import { Client } from '$app/common/interfaces/client';
import { set } from 'lodash';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CountrySelector } from '$app/components/CountrySelector';

interface Props {
  client: Client | undefined;
  setClient: Dispatch<SetStateAction<Client | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  errors: ValidationBag | undefined;
}

export function BillingAddress(props: Props) {
  const [t] = useTranslation();

  const { errors, setClient, setErrors } = props;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setErrors(undefined);

    setClient(
      (client) => client && set(client, event.target.id, event.target.value)
    );
  };

  return (
    <>
      <Element leftSide={t('billing_address1')}>
        <InputField
          id="address1"
          value={props.client?.address1 || ''}
          onChange={handleChange}
          errorMessage={errors?.errors.address1}
        />
      </Element>

      <Element leftSide={t('address2')}>
        <InputField
          id="address2"
          value={props.client?.address2 || ''}
          onChange={handleChange}
          errorMessage={errors?.errors.address2}
        />
      </Element>

      <Element leftSide={t('city')}>
        <InputField
          id="city"
          value={props.client?.city || ''}
          onChange={handleChange}
          errorMessage={errors?.errors.city}
        />
      </Element>

      <Element leftSide={t('state')}>
        <InputField
          id="state"
          value={props.client?.state || ''}
          onChange={handleChange}
          errorMessage={errors?.errors.state}
        />
      </Element>

      <Element leftSide={t('postal_code')}>
        <InputField
          id="postal_code"
          value={props.client?.postal_code || ''}
          onChange={handleChange}
          errorMessage={errors?.errors.postal_code}
        />
      </Element>

      <Element leftSide={t('country')}>
        <CountrySelector
          value={props.client?.country_id || ''}
          errorMessage={errors?.errors.country_id}
          onChange={(id) => setClient((c) => c && { ...c, country_id: id })}
          dismissable
        />
      </Element>
    </>
  );
}
