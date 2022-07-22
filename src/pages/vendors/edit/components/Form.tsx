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
import { Button, InputField, SelectField } from '@invoiceninja/forms';
import { useCountries } from 'common/hooks/useCountries';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useHandleCustomFieldChange } from 'common/hooks/useHandleCustomFieldChange';
import { Vendor, Contact } from 'common/interfaces/vendor';
import { Divider } from 'components/cards/Divider';
import { CountrySelector } from 'components/CountrySelector';
import { CustomField } from 'components/CustomField';
import { UserSelector } from 'components/users/UserSelector';
import { set } from 'lodash';
import { Field } from 'pages/settings/custom-fields/components';
import { useTranslation } from 'react-i18next';

interface Props {
  vendor: Vendor;
  setVendor: React.Dispatch<React.SetStateAction<Vendor | undefined>>;
}

export function Form(props: Props) {
  const [t] = useTranslation();
  const { vendor, setVendor } = props;

  const company = useCurrentCompany();
  const handleCustomFieldChange = useHandleCustomFieldChange();
  const countries = useCountries();

  const handleChange = (property: keyof Vendor, value: unknown) => {
    setVendor((current) => current && { ...current, [property]: value });
  };

  const handleContactChange = (
    property: keyof Contact,
    value: string,
    index: number
  ) => {
    const contacts = [...vendor.contacts];

    set(contacts[index], property, value);

    handleChange('contacts', contacts);
  };

  const handleDelete = (index: number) => {
    const contacts = [...vendor.contacts];

    contacts.splice(index, 1);

    handleChange('contacts', contacts);
  };

  const handleCreate = () => {
    const contacts = [...vendor.contacts];

    contacts.push({
      id: '',
      first_name: '',
      last_name: '',
      email: '',
      created_at: 0,
      updated_at: 0,
      archived_at: 0,
      is_primary: false,
      phone: '',
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
    });

    handleChange('contacts', contacts);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 xl:col-span-6 space-y-4">
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

          {company?.custom_fields?.vendor1 && (
            <CustomField
              field="contact1"
              defaultValue={vendor.custom_value1}
              value={company.custom_fields.vendor1}
              onChange={(value) => handleChange('custom_value1', value)}
            />
          )}

          {company?.custom_fields?.vendor2 && (
            <CustomField
              field="vendor2"
              defaultValue={vendor.custom_value2}
              value={company.custom_fields.vendor2}
              onChange={(value) => handleChange('custom_value2', value)}
            />
          )}

          {company?.custom_fields?.vendor3 && (
            <CustomField
              field="vendor3"
              defaultValue={vendor.custom_value3}
              value={company.custom_fields.vendor3}
              onChange={(value) => handleChange('custom_value3', value)}
            />
          )}

          {company?.custom_fields?.vendor4 && (
            <CustomField
              field="vendor4"
              defaultValue={vendor.custom_value4}
              value={company.custom_fields.vendor4}
              onChange={(value) => handleChange('custom_value4', value)}
            />
          )}
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
            <SelectField
              id="country_id"
              value={vendor?.country_id}
              onValueChange={(value) => handleChange('country_id', value)}
            >
              <option value=""></option>

              {countries.map((country, index) => (
                <option key={index} value={country.id}>
                  {country.name}
                </option>
              ))}
            </SelectField>


          </Element>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-6 space-y-4">
        <Card title={t('contacts')}>
          {vendor.contacts.map((contact, index, { length }) => (
            <div key={index}>
              <Element leftSide={t('first_name')}>
                <InputField
                  value={contact.first_name}
                  onValueChange={(value) =>
                    handleContactChange('first_name', value, index)
                  }
                />
              </Element>

              <Element leftSide={t('last_name')}>
                <InputField
                  value={contact.last_name}
                  onValueChange={(value) =>
                    handleContactChange('last_name', value, index)
                  }
                />
              </Element>

              <Element leftSide={t('email')}>
                <InputField
                  value={contact.email}
                  onValueChange={(value) =>
                    handleContactChange('email', value, index)
                  }
                />
              </Element>

              <Element leftSide={t('phone')}>
                <InputField
                  value={contact.phone}
                  onValueChange={(value) =>
                    handleContactChange('phone', value, index)
                  }
                />
              </Element>

              <Element>
                <div className="flex justify-between items-center">
                  {vendor.contacts.length >= 2 && (
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => handleDelete(index)}
                    >
                      {t('remove_contact')}
                    </button>
                  )}

                  {index + 1 == length && (
                    <Button
                      type="minimal"
                      behavior="button"
                      onClick={handleCreate}
                    >
                      {t('add_contact')}
                    </Button>
                  )}
                </div>
              </Element>

              <Divider />
            </div>
          ))}
        </Card>

        <Card title={t('custom_fields')}>
          {company &&
            ['vendor1', 'vendor2', 'vendor3', 'vendor4'].map((field) => (
              <Field
                key={field}
                initialValue={company.custom_fields[field]}
                field={field}
                placeholder={t('contact_field')}
                onChange={(value) => handleCustomFieldChange(field, value)}
              />
            ))}
        </Card>
      </div>
    </div>
  );
}
