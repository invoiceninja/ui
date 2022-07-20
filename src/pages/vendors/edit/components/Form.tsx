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
import { InputField } from '@invoiceninja/forms';
import { Vendor } from 'common/interfaces/vendor';
import { CountrySelector } from 'components/CountrySelector';
import { UserSelector } from 'components/users/UserSelector';
import { useTranslation } from 'react-i18next';

interface Props {
  vendor: Vendor;
  setVendor: React.Dispatch<React.SetStateAction<Vendor | undefined>>;
}

export function Form(props: Props) {
  const [t] = useTranslation();
  const { vendor, setVendor } = props;

  const handleChange = (property: keyof Vendor, value: unknown) => {
    setVendor((current) => current && { ...current, [property]: value });
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 md:col-span-6 space-y-4">
        <Card title={t('details')}>
          <Element leftSide={t('name')}>
            <InputField
              value={vendor.name}
              onValueChange={(value) => handleChange('name', value)}
            />
          </Element>

          <Element leftSide={t('number')}>
            <InputField
              value={vendor.number}
              onValueChange={(value) => handleChange('number', value)}
            />
          </Element>

          <Element leftSide={t('user')}>
            <UserSelector
              value={vendor.assigned_user_id}
              onChange={(user) => handleChange('assigned_user_id', user.id)}
              onClearButtonClick={() => handleChange('assigned_user_id', '')}
              clearButton
            />
          </Element>

          <Element leftSide={t('id_number')}>
            <InputField
              value={vendor.id_number}
              onValueChange={(value) => handleChange('id_number', value)}
            />
          </Element>

          <Element leftSide={t('vat_number')}>
            <InputField
              value={vendor.vat_number}
              onValueChange={(value) => handleChange('vat_number', value)}
            />
          </Element>

          <Element leftSide={t('website')}>
            <InputField
              value={vendor.website}
              onValueChange={(value) => handleChange('website', value)}
            />
          </Element>

          <Element leftSide={t('phone')}>
            <InputField
              value={vendor.phone}
              onValueChange={(value) => handleChange('phone', value)}
            />
          </Element>
        </Card>

        <Card title={t('address')}>
          <Element leftSide={t('address1')}>
            <InputField
              value={vendor.address1}
              onValueChange={(value) => handleChange('address1', value)}
            />
          </Element>

          <Element leftSide={t('address2')}>
            <InputField
              value={vendor.address2}
              onValueChange={(value) => handleChange('address2', value)}
            />
          </Element>

          <Element leftSide={t('city')}>
            <InputField
              value={vendor.city}
              onValueChange={(value) => handleChange('city', value)}
            />
          </Element>

          <Element leftSide={t('state')}>
            <InputField
              value={vendor.state}
              onValueChange={(value) => handleChange('state', value)}
            />
          </Element>

          <Element leftSide={t('postal_code')}>
            <InputField
              value={vendor.postal_code}
              onValueChange={(value) => handleChange('postal_code', value)}
            />
          </Element>

          <Element leftSide={t('country')}>
            <CountrySelector
              value={vendor.country_id}
              onChange={(value) => handleChange('country_id', value)}
            />
          </Element>
        </Card>
      </div>
    </div>
  );
}
