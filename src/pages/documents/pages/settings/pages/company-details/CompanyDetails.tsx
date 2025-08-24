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
import { CountrySelector } from '$app/components/CountrySelector';
import { InputField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

export default function CompanyDetails() {
  const [t] = useTranslation();

  return (
    <div className="pt-4 pb-4">
      <Element leftSide={t('company_name')}>
        <InputField />
      </Element>

      <Element leftSide={t('address1')}>
        <InputField />
      </Element>

      <Element leftSide={t('address2')}>
        <InputField />
      </Element>

      <Element leftSide={t('city')}>
        <InputField />
      </Element>

      <Element leftSide={t('state')}>
        <InputField />
      </Element>

      <Element leftSide={t('postal_code')}>
        <InputField />
      </Element>

      <Element leftSide={t('country')}>
        <CountrySelector value="" onChange={(value) => console.log(value)} />
      </Element>

      <Element leftSide={t('website')}>
        <InputField />
      </Element>
    </div>
  );
}
