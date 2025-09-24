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
import { Dispatch, SetStateAction } from 'react';
import { LanguageSelector } from '$app/components/LanguageSelector';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useColorScheme } from '$app/common/colors';
import { Trash } from '$app/components/icons/Trash';
import { Plus } from '$app/components/icons/Plus';
import classNames from 'classnames';

interface Props {
  vendor: Vendor;
  setVendor: Dispatch<SetStateAction<Vendor | undefined>>;
  setContacts: Dispatch<SetStateAction<Partial<VendorContact>[]>>;
  contacts: Partial<VendorContact>[];
  errors: ValidationBag | undefined;
  page?: 'create' | 'edit';
  modalForm?: boolean;
  fundamentalConceptVisible?: boolean;
}

export function Form(props: Props) {
  const [t] = useTranslation();

  const {
    vendor,
    setVendor,
    errors,
    page,
    setContacts,
    contacts,
    fundamentalConceptVisible,
  } = props;

  const colors = useColorScheme();
  const languages = useLanguages();
  const company = useCurrentCompany();
  const { isAdmin, isOwner } = useAdmin();

  const handleChange = (property: keyof Vendor, value: unknown) => {
    setVendor((current) => current && { ...current, [property]: value });
  };

  const handleContactChange = (
    property: keyof VendorContact,
    value: string | number | boolean,
    index: number
  ) => {
    set(contacts[index], property, value);

    setContacts([...contacts]);
  };

  const handleDelete = (index: number) => {
    let currentContacts = [...contacts];

    currentContacts = currentContacts.filter(
      (_, contactIndex) => index !== contactIndex
    );

    setContacts(currentContacts);
  };

  const handleCreate = () => {
    const currentContacts = [...contacts];

    currentContacts.push({
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
      can_sign: false,
    });

    setContacts(currentContacts);
  };

  const handleAddContact = () => {
    handleCreate();

    setTimeout(() => {
      const contactElements = document.querySelectorAll('[id^="first_name_"]');

      if (contactElements.length > 2) {
        const lastContactElement = contactElements[contactElements.length - 1];
        lastContactElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 50);
  };

  return (
    <>
      {fundamentalConceptVisible ? (
        <div className="flex flex-col space-y-3">
          <InputField
            label={t('name')}
            value={vendor?.name || ''}
            onValueChange={(value) => handleChange('name', value)}
            errorMessage={errors?.errors.name}
          />

          <InputField
            label={`${t('contact')} ${t('first_name')}`}
            value={contacts[0].first_name}
            onValueChange={(value) =>
              handleContactChange('first_name', value, 0)
            }
            errorMessage={errors?.errors['contacts.0.first_name']}
          />

          <InputField
            label={`${t('contact')} ${t('last_name')}`}
            value={contacts[0].last_name}
            onValueChange={(value) =>
              handleContactChange('last_name', value, 0)
            }
            errorMessage={errors?.errors['contacts.0.last_name']}
          />

          <InputField
            label={`${t('contact')} ${t('email')}`}
            value={contacts[0].email}
            onValueChange={(value) => handleContactChange('email', value, 0)}
            errorMessage={errors?.errors['contacts.0.email']}
          />

          <InputField
            label={`${t('contact')} ${t('phone')}`}
            value={contacts[0].phone}
            onValueChange={(value) => handleContactChange('phone', value, 0)}
            errorMessage={errors?.errors['contacts.0.phone']}
          />

          <CurrencySelector
            label={t('currency')}
            value={vendor?.currency_id || ''}
            onChange={(value) => handleChange('currency_id', value)}
            errorMessage={errors?.errors.currency_id}
            dismissable
          />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-6 space-y-4">
            <Card
              className="shadow-sm"
              title={t('details')}
              style={{ borderColor: colors.$24 }}
              headerStyle={{ borderColor: colors.$20 }}
            >
              {page === 'edit' && (
                <Element leftSide={t('status')}>
                  <EntityStatus entity={vendor} />
                </Element>
              )}

              <Element leftSide={t('name')}>
                <InputField
                  id="name"
                  value={vendor.name || ''}
                  onValueChange={(value) => handleChange('name', value)}
                  errorMessage={errors?.errors.name}
                />
              </Element>

              <Element leftSide={t('number')}>
                <InputField
                  value={vendor.number || ''}
                  onValueChange={(value) => handleChange('number', value)}
                  errorMessage={errors?.errors.number}
                />
              </Element>

              <Element leftSide={t('assigned_user')}>
                <UserSelector
                  value={vendor.assigned_user_id}
                  onChange={(user) => handleChange('assigned_user_id', user.id)}
                  onClearButtonClick={() =>
                    handleChange('assigned_user_id', '')
                  }
                  clearButton
                  errorMessage={errors?.errors.assigned_user_id}
                />
              </Element>

              <Element leftSide={t('id_number')}>
                <InputField
                  value={vendor.id_number || ''}
                  onValueChange={(value) => handleChange('id_number', value)}
                  errorMessage={errors?.errors.id_number}
                />
              </Element>

              <Element leftSide={t('vat_number')}>
                <InputField
                  value={vendor.vat_number || ''}
                  onValueChange={(value) => handleChange('vat_number', value)}
                  errorMessage={errors?.errors.vat_number}
                />
              </Element>

              <Element leftSide={t('website')}>
                <InputField
                  value={vendor.website || ''}
                  onValueChange={(value) => handleChange('website', value)}
                  errorMessage={errors?.errors.website}
                />
              </Element>

              <Element leftSide={t('phone')}>
                <InputField
                  value={vendor.phone || ''}
                  onValueChange={(value) => handleChange('phone', value)}
                  errorMessage={errors?.errors.phone}
                />
              </Element>

              <Element leftSide={t('routing_id')}>
                <InputField
                  value={vendor.routing_id || ''}
                  onValueChange={(value) => handleChange('routing_id', value)}
                  errorMessage={props.errors?.errors.routing_id}
                />
              </Element>

              <Element leftSide={t('tax_exempt')}>
                <Toggle
                  checked={Boolean(vendor.is_tax_exempt)}
                  onValueChange={(value) =>
                    handleChange('is_tax_exempt', value)
                  }
                />
              </Element>

              <Element leftSide={t('classification')}>
                <SelectField
                  value={vendor.classification ?? ''}
                  onValueChange={(value) =>
                    handleChange('classification', value)
                  }
                  errorMessage={errors?.errors.classification}
                  customSelector
                  dismissable
                >
                  <option value="individual">{t('individual')}</option>
                  <option value="business">{t('business')}</option>
                  <option value="company">{t('company')}</option>
                  <option value="partnership">{t('partnership')}</option>
                  <option value="trust">{t('trust')}</option>
                  <option value="charity">{t('charity')}</option>
                  <option value="government">{t('government')}</option>
                  <option value="other">{t('other')}</option>
                </SelectField>
              </Element>

              {company?.custom_fields?.vendor1 && (
                <CustomField
                  field="contact1"
                  defaultValue={vendor.custom_value1}
                  value={company.custom_fields.vendor1}
                  onValueChange={(value) =>
                    handleChange('custom_value1', value)
                  }
                />
              )}

              {company?.custom_fields?.vendor2 && (
                <CustomField
                  field="vendor2"
                  defaultValue={vendor.custom_value2}
                  value={company.custom_fields.vendor2}
                  onValueChange={(value) =>
                    handleChange('custom_value2', value)
                  }
                />
              )}

              {company?.custom_fields?.vendor3 && (
                <CustomField
                  field="vendor3"
                  defaultValue={vendor.custom_value3}
                  value={company.custom_fields.vendor3}
                  onValueChange={(value) =>
                    handleChange('custom_value3', value)
                  }
                />
              )}

              {company?.custom_fields?.vendor4 && (
                <CustomField
                  field="vendor4"
                  defaultValue={vendor.custom_value4}
                  value={company.custom_fields.vendor4}
                  onValueChange={(value) =>
                    handleChange('custom_value4', value)
                  }
                />
              )}
            </Card>

            <Card
              className="shadow-sm"
              title={t('address')}
              style={{ borderColor: colors.$24 }}
              headerStyle={{ borderColor: colors.$20 }}
            >
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
            <Card
              className="shadow-sm"
              title={t('contacts')}
              headerClassName="px-4 sm:px-6 py-[0.825rem]"
              style={{ borderColor: colors.$24 }}
              headerStyle={{ borderColor: colors.$20 }}
              withoutBodyPadding
              withoutHeaderPadding
              topRight={
                <Button
                  className="shadow-sm"
                  type="secondary"
                  behavior="button"
                  onClick={handleAddContact}
                >
                  <div className="flex items-center">
                    <div>
                      <Plus size="0.7rem" color={colors.$3} />
                    </div>

                    <span className="font-medium">{t('add_contact')}</span>
                  </div>
                </Button>
              }
            >
              {contacts.map((contact, index) => (
                <div key={index} className="px-6">
                  <div
                    className={classNames('pb-2 pt-4 border-b border-dashed', {
                      'border-b-0': index === contacts.length - 1,
                    })}
                    style={{ borderColor: colors.$24 }}
                  >
                    <Element leftSide={t('first_name')} noExternalPadding>
                      <InputField
                        id={`first_name_${index}`}
                        value={contact.first_name}
                        onValueChange={(value) =>
                          handleContactChange('first_name', value, index)
                        }
                        errorMessage={
                          props.errors?.errors[`contacts.${index}.first_name`]
                        }
                      />
                    </Element>

                    <Element leftSide={t('last_name')} noExternalPadding>
                      <InputField
                        id={`last_name_${index}`}
                        value={contact.last_name}
                        onValueChange={(value) =>
                          handleContactChange('last_name', value, index)
                        }
                        errorMessage={
                          props.errors?.errors[`contacts.${index}.last_name`]
                        }
                      />
                    </Element>

                    <Element leftSide={t('email')} noExternalPadding>
                      <InputField
                        id={`email_${index}`}
                        value={contact.email}
                        onValueChange={(value) =>
                          handleContactChange('email', value, index)
                        }
                        errorMessage={
                          props.errors?.errors[`contacts.${index}.email`]
                        }
                      />
                    </Element>

                    <Element leftSide={t('phone')} noExternalPadding>
                      <InputField
                        value={contact.phone}
                        onValueChange={(value) =>
                          handleContactChange('phone', value, index)
                        }
                        errorMessage={
                          props.errors?.errors[`contacts.${index}.phone`]
                        }
                      />
                    </Element>

                    <Element leftSide={t('send_email')} noExternalPadding>
                      <Toggle
                        checked={contact.send_email}
                        onChange={(value) =>
                          handleContactChange('send_email', value, index)
                        }
                      />
                    </Element>

                    {company?.enable_modules && (
                    <Element leftSide={t('authorized_to_sign')} noExternalPadding>
                      <Toggle
                        checked={contact.can_sign}
                        onChange={(value) =>
                          handleContactChange('can_sign', value, index)
                        }
                        />
                      </Element>
                    )}

                    {company?.custom_fields?.vendor_contact1 && (
                      <CustomField
                        field="vendor_contact1"
                        defaultValue={contact.custom_value1 || ''}
                        value={company.custom_fields.vendor_contact1}
                        onValueChange={(value) =>
                          handleContactChange('custom_value1', value, index)
                        }
                        noExternalPadding
                      />
                    )}

                    {company?.custom_fields?.vendor_contact2 && (
                      <CustomField
                        field="vendor_contact2"
                        defaultValue={contact.custom_value2 || ''}
                        value={company.custom_fields.vendor_contact2}
                        onValueChange={(value) =>
                          handleContactChange('custom_value2', value, index)
                        }
                        noExternalPadding
                      />
                    )}

                    {company?.custom_fields?.vendor_contact3 && (
                      <CustomField
                        field="vendor_contact3"
                        defaultValue={contact.custom_value3 || ''}
                        value={company.custom_fields.vendor_contact3}
                        onValueChange={(value) =>
                          handleContactChange('custom_value3', value, index)
                        }
                        noExternalPadding
                      />
                    )}

                    {company?.custom_fields?.vendor_contact4 && (
                      <CustomField
                        field="vendor_contact4"
                        defaultValue={contact.custom_value4 || ''}
                        value={company.custom_fields.vendor_contact4}
                        onValueChange={(value) =>
                          handleContactChange('custom_value4', value, index)
                        }
                        noExternalPadding
                      />
                    )}

                    <Element noExternalPadding pushContentToRight>
                      <div className="flex items-center">
                        {contacts.length >= 2 && (
                          <Button
                            className="shadow-sm"
                            type="secondary"
                            behavior="button"
                            onClick={() => handleDelete(index)}
                          >
                            <div className="flex space-x-2 items-center">
                              <div>
                                <Trash size="1rem" color="#ef4444" />
                              </div>

                              <span className="font-medium text-red-500">
                                {t('remove_contact')}
                              </span>
                            </div>
                          </Button>
                        )}
                      </div>
                    </Element>
                  </div>
                </div>
              ))}
            </Card>

            <Card
              className="shadow-sm"
              title={t('additional_info')}
              style={{ borderColor: colors.$24 }}
              headerStyle={{ borderColor: colors.$20 }}
            >
              <TabGroup
                tabs={[
                  t('settings'),
                  ...(isAdmin || isOwner ? [t('custom_fields')] : []),
                ]}
                withHorizontalPadding
                horizontalPaddingWidth="1.5rem"
                fullRightPadding
              >
                <div className="flex flex-col space-y-4 px-6">
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
                      <LanguageSelector
                        value={vendor.language_id}
                        onChange={(v) => handleChange('language_id', v)}
                        errorMessage={errors?.errors.language_id}
                        dismissable
                      />
                    </Element>
                  )}

                  <MarkdownEditor
                    label={t('public_notes').toString()}
                    onChange={(value) => handleChange('public_notes', value)}
                    value={vendor.public_notes}
                  />

                  <div className="pt-3">
                    <MarkdownEditor
                      label={t('private_notes').toString()}
                      onChange={(value) => handleChange('private_notes', value)}
                      value={vendor.private_notes}
                    />
                  </div>
                </div>

                <div className="px-6 pt-1">
                  <span className="text-sm">{t('custom_fields')} &nbsp;</span>

                  <Link
                    to="/settings/custom_fields/vendors"
                    className="capitalize"
                  >
                    {t('click_here')}.
                  </Link>
                </div>
              </TabGroup>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
