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
import { Button, InputField, Link, SelectField } from '$app/components/forms';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Vendor } from '$app/common/interfaces/vendor';
import { VendorContact } from '$app/common/interfaces/vendor-contact';
import { Divider } from '$app/components/cards/Divider';
import { CountrySelector } from '$app/components/CountrySelector';
import { CustomField } from '$app/components/CustomField';
import Toggle from '$app/components/forms/Toggle';
import { UserSelector } from '$app/components/users/UserSelector';
import { set } from 'lodash';
import { useTranslation } from 'react-i18next';
import { TabGroup } from '$app/components/TabGroup';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { useLanguages } from '$app/common/hooks/useLanguages';
import { EntityStatus } from '$app/components/EntityStatus';

interface Props {
  vendor: Vendor;
  setVendor: React.Dispatch<React.SetStateAction<Vendor | undefined>>;
  errors: ValidationBag | undefined;
  page?: 'create' | 'edit';
}

export function Form(props: Props) {
  const [t] = useTranslation();
  const { vendor, setVendor, errors, page } = props;

  const company = useCurrentCompany();

  const handleChange = (property: keyof Vendor, value: unknown) => {
    setVendor((current) => current && { ...current, [property]: value });
  };

  const handleContactChange = (
    property: keyof VendorContact,
    value: string | boolean,
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
      send_email: false,
      created_at: 0,
      updated_at: 0,
      archived_at: 0,
      is_primary: false,
      phone: '',
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
      link: '',
      last_login: 0,
    });

    handleChange('contacts', contacts);
  };

  const languages = useLanguages();

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 xl:col-span-6 space-y-4">
        <Card title={t('details')}>
          {page === 'edit' && (
            <Element leftSide={t('status')}>
              <EntityStatus entity={vendor} />
            </Element>
          )}

          <Element leftSide={t('name')}>
            <InputField
              value={vendor.name}
              onValueChange={(value) => handleChange('name', value)}
              errorMessage={errors?.errors.name}
            />
          </Element>

          <Element leftSide={t('number')}>
            <InputField
              value={vendor.number}
              onValueChange={(value) => handleChange('number', value)}
              errorMessage={errors?.errors.number}
            />
          </Element>

          <Element leftSide={t('user')}>
            <UserSelector
              value={vendor.assigned_user_id}
              onChange={(user) => handleChange('assigned_user_id', user.id)}
              onClearButtonClick={() => handleChange('assigned_user_id', '')}
              clearButton
              errorMessage={errors?.errors.assigned_user_id}
            />
          </Element>

          <Element leftSide={t('id_number')}>
            <InputField
              value={vendor.id_number}
              onValueChange={(value) => handleChange('id_number', value)}
              errorMessage={errors?.errors.id_number}
            />
          </Element>

          <Element leftSide={t('vat_number')}>
            <InputField
              value={vendor.vat_number}
              onValueChange={(value) => handleChange('vat_number', value)}
              errorMessage={errors?.errors.vat_number}
            />
          </Element>

          <Element leftSide={t('website')}>
            <InputField
              value={vendor.website}
              onValueChange={(value) => handleChange('website', value)}
              errorMessage={errors?.errors.website}
            />
          </Element>

          <Element leftSide={t('phone')}>
            <InputField
              value={vendor.phone}
              onValueChange={(value) => handleChange('phone', value)}
              errorMessage={errors?.errors.phone}
            />
          </Element>

          {company?.custom_fields?.vendor1 && (
            <CustomField
              field="contact1"
              defaultValue={vendor.custom_value1}
              value={company.custom_fields.vendor1}
              onValueChange={(value) => handleChange('custom_value1', value)}
            />
          )}

          {company?.custom_fields?.vendor2 && (
            <CustomField
              field="vendor2"
              defaultValue={vendor.custom_value2}
              value={company.custom_fields.vendor2}
              onValueChange={(value) => handleChange('custom_value2', value)}
            />
          )}

          {company?.custom_fields?.vendor3 && (
            <CustomField
              field="vendor3"
              defaultValue={vendor.custom_value3}
              value={company.custom_fields.vendor3}
              onValueChange={(value) => handleChange('custom_value3', value)}
            />
          )}

          {company?.custom_fields?.vendor4 && (
            <CustomField
              field="vendor4"
              defaultValue={vendor.custom_value4}
              value={company.custom_fields.vendor4}
              onValueChange={(value) => handleChange('custom_value4', value)}
            />
          )}
        </Card>

        <Card title={t('address')}>
          <Element leftSide={t('address1')}>
            <InputField
              value={vendor.address1}
              onValueChange={(value) => handleChange('address1', value)}
              errorMessage={errors?.errors.address1}
            />
          </Element>

          <Element leftSide={t('address2')}>
            <InputField
              value={vendor.address2}
              onValueChange={(value) => handleChange('address2', value)}
              errorMessage={errors?.errors.address2}
            />
          </Element>

          <Element leftSide={t('city')}>
            <InputField
              value={vendor.city}
              onValueChange={(value) => handleChange('city', value)}
              errorMessage={errors?.errors.city}
            />
          </Element>

          <Element leftSide={t('state')}>
            <InputField
              value={vendor.state}
              onValueChange={(value) => handleChange('state', value)}
              errorMessage={errors?.errors.state}
            />
          </Element>

          <Element leftSide={t('postal_code')}>
            <InputField
              value={vendor.postal_code}
              onValueChange={(value) => handleChange('postal_code', value)}
              errorMessage={errors?.errors.postal_code}
            />
          </Element>

          <Element leftSide={t('country')}>
            <CountrySelector
              value={vendor.country_id}
              onChange={(value) => handleChange('country_id', value)}
              errorMessage={errors?.errors.country_id}
            />
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
                  errorMessage={
                    props.errors?.errors[`contacts.${index}.first_name`]
                  }
                />
              </Element>

              <Element leftSide={t('last_name')}>
                <InputField
                  value={contact.last_name}
                  onValueChange={(value) =>
                    handleContactChange('last_name', value, index)
                  }
                  errorMessage={
                    props.errors?.errors[`contacts.${index}.last_name`]
                  }
                />
              </Element>

              <Element leftSide={t('email')}>
                <InputField
                  value={contact.email}
                  onValueChange={(value) =>
                    handleContactChange('email', value, index)
                  }
                  errorMessage={props.errors?.errors[`contacts.${index}.email`]}
                />
              </Element>

              <Element leftSide={t('phone')}>
                <InputField
                  value={contact.phone}
                  onValueChange={(value) =>
                    handleContactChange('phone', value, index)
                  }
                  errorMessage={props.errors?.errors[`contacts.${index}.phone`]}
                />
              </Element>

              <Element leftSide={t('send_email')}>
                <Toggle
                  checked={contact.send_email}
                  onChange={(value) =>
                    handleContactChange('send_email', value, index)
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

        <Card title={t('additional_info')}>
          <TabGroup className="px-5" tabs={[t('settings'), t('custom_fields')]}>
            <div className="flex flex-col space-y-4">
              <Element leftSide={t('currency')} noExternalPadding>
                <CurrencySelector
                  value={vendor.currency_id}
                  onChange={(value) =>
                    handleChange('currency_id', parseInt(value))
                  }
                  errorMessage={errors?.errors.currency_id}
                />
              </Element>

              {languages.length > 1 && (
                <Element leftSide={t('language')} noExternalPadding>
                  <SelectField
                    value={vendor.language_id}
                    onValueChange={(value) =>
                      handleChange('language_id', value)
                    }
                    errorMessage={errors?.errors.language_id}
                    withBlank
                  >
                    {languages.map((language, index) => (
                      <option key={index} value={language.id}>
                        {language.name}
                      </option>
                    ))}
                  </SelectField>
                </Element>
              )}

              <MarkdownEditor
                label={t('public_notes').toString()}
                onChange={(value) => handleChange('public_notes', value)}
                value={vendor.public_notes}
              />

              <MarkdownEditor
                label={t('private_notes').toString()}
                onChange={(value) => handleChange('private_notes', value)}
                value={vendor.private_notes}
              />
            </div>

            <div>
              <span className="text-sm">
                {t('custom_fields_location_changed')} &nbsp;
              </span>
              <Link to="/settings/custom_fields/vendors" className="capitalize">
                {t('click_here')}
              </Link>
            </div>
          </TabGroup>
        </Card>
      </div>
    </div>
  );
}
