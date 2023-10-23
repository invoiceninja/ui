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
import { InputField, SelectField } from '$app/components/forms';
import { endpoint, isHosted, trans } from '$app/common/helpers';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { Divider } from '$app/components/cards/Divider';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import Toggle from '$app/components/forms/Toggle';
import { Settings } from '$app/components/layouts/Settings';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useDropzone } from 'react-dropzone';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { AxiosError, AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { request } from '$app/common/helpers/request';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Image } from 'react-feather';
import { useAtom } from 'jotai';
import { companySettingsErrorsAtom } from '../common/atoms';
import { UserSelector } from '$app/components/users/UserSelector';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

export function EmailSettings() {
  useTitle('email_settings');

  const [t] = useTranslation();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('email_settings'), href: '/settings/email_settings' },
  ];

  const company = useInjectCompanyChanges();
  const currentCompany = useCurrentCompany();

  const disableSettingsField = useDisableSettingsField();

  const [errors, setErrors] = useAtom(companySettingsErrorsAtom);

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  const showPlanAlert = useShouldDisableAdvanceSettings();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(new FormData());

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formData,
    onSubmit: () => {
      toast.processing();

      setErrors(undefined);

      request(
        'POST',
        endpoint('/api/v1/companies/:id', { id: currentCompany.id }),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
        .then((response: AxiosResponse) => {
          dispatch(
            updateRecord({ object: 'company', data: response.data.data })
          );

          toast.success('uploaded_document');
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setFormData(new FormData()));
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast.error('invalid_file');
        return;
      }

      formData.append('e_invoice_certificate', acceptedFiles[0]);
      formData.append('_method', 'PUT');

      setFormData(formData);

      formik.submitForm();
    },
    [formData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxFiles: 1,
    accept: {
      'application/*': [
        '.p12',
        '.pfx',
        '.pem',
        '.cer',
        '.crt',
        '.der',
        '.txt',
        '.p7b',
        '.spc',
        '.bin',
      ],
    },
  });

  return (
    <Settings
      title={t('email_settings')}
      docsLink="en/advanced-settings/#email_settings"
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={showPlanAlert}
      withoutBackButton
    >
      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      <Card title={t('settings')}>
        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="show_email_footer"
              labelElement={<SettingsLabel label={t('show_email_footer')} />}
            />
          }
        >
          <Toggle
            checked={Boolean(company?.settings.show_email_footer)}
            onValueChange={(value) =>
              handleChange('settings.show_email_footer', value)
            }
            disabled={disableSettingsField('show_email_footer')}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="pdf_email_attachment"
              labelElement={<SettingsLabel label={t('attach_pdf')} />}
            />
          }
        >
          <Toggle
            checked={Boolean(company?.settings.pdf_email_attachment)}
            onValueChange={(value) =>
              handleChange('settings.pdf_email_attachment', value)
            }
            disabled={disableSettingsField('pdf_email_attachment')}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="document_email_attachment"
              labelElement={<SettingsLabel label={t('attach_documents')} />}
            />
          }
        >
          <Toggle
            checked={Boolean(company?.settings.document_email_attachment)}
            onValueChange={(value) =>
              handleChange('settings.document_email_attachment', value)
            }
            disabled={disableSettingsField('document_email_attachment')}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="ubl_email_attachment"
              labelElement={<SettingsLabel label={t('attach_ubl')} />}
            />
          }
        >
          <Toggle
            checked={Boolean(company?.settings.ubl_email_attachment)}
            onValueChange={(value) =>
              handleChange('settings.ubl_email_attachment', value)
            }
            disabled={disableSettingsField('ubl_email_attachment')}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="enable_e_invoice"
              labelElement={<SettingsLabel label={t('enable_e_invoice')} />}
            />
          }
        >
          <Toggle
            checked={Boolean(company?.settings.enable_e_invoice)}
            onValueChange={(value) =>
              handleChange('settings.enable_e_invoice', value)
            }
            disabled={disableSettingsField('enable_e_invoice')}
          />
        </Element>
        {company?.settings.enable_e_invoice ? (
          <>
            {isCompanySettingsActive && (
              <Element
                leftSide={t('upload_certificate')}
                leftSideHelp={
                  company?.has_e_invoice_certificate
                    ? t('certificate_set')
                    : t('certificate_not_set')
                }
              >
                <div
                  {...getRootProps()}
                  className="flex flex-col md:flex-row md:items-center"
                >
                  <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <input {...getInputProps()} />
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {isDragActive
                        ? 'drop_your_logo_here'
                        : t('dropzone_default_message')}
                    </span>
                  </div>
                </div>
              </Element>
            )}

            {isCompanySettingsActive && (
              <Element
                leftSide={t('certificate_passphrase')}
                leftSideHelp={
                  company?.has_e_invoice_certificate_passphrase
                    ? t('passphrase_set')
                    : t('passphrase_not_set')
                }
              >
                <InputField
                  value=""
                  id="password"
                  type="password"
                  onValueChange={(value) =>
                    handleChange('has_e_invoice_certificate_passphrase', value)
                  }
                  errorMessage={
                    errors?.errors.has_e_invoice_certificate_passphrase
                  }
                />
              </Element>
            )}

            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="e_invoice_type"
                  labelElement={<SettingsLabel label={t('e_invoice_type')} />}
                  defaultValue="EN16931"
                />
              }
            >
              <SelectField
                value={company?.settings.e_invoice_type || 'EN16931'}
                onValueChange={(value) =>
                  handleChange('settings.e_invoice_type', value)
                }
                disabled={disableSettingsField('e_invoice_type')}
                errorMessage={errors?.errors['settings.e_invoice_type']}
              >
                <option value="EN16931">EN16931</option>
                <option value="XInvoice_2_2">XInvoice_2_2</option>
                <option value="XInvoice_2_1">XInvoice_2_1</option>
                <option value="XInvoice_2_0">XInvoice_2_0</option>
                <option value="XInvoice_1_0">XInvoice_1_0</option>
                <option value="XInvoice-Extended">XInvoice-Extended</option>
                <option value="XInvoice-BasicWL">XInvoice-BasicWL</option>
                <option value="XInvoice-Basic">XInvoice-Basic</option>
                <option value="Facturae_3.2">Facturae_3.2</option>
                <option value="Facturae_3.2.1">Facturae_3.2.1</option>
                <option value="Facturae_3.2.2">Facturae_3.2.2</option>
              </SelectField>
            </Element>
          </>
        ) : null}

        <Divider />

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="email_sending_method"
              labelElement={<SettingsLabel label={t('email_provider')} />}
              defaultValue="default"
            />
          }
        >
          <SelectField
            value={company?.settings.email_sending_method || 'default'}
            onValueChange={(value) =>
              handleChange('settings.email_sending_method', value)
            }
            disabled={disableSettingsField('email_sending_method')}
            errorMessage={errors?.errors['settings.email_sending_method']}
          >
            <option defaultChecked value="default">
              {t('default')}
            </option>
            {isHosted() && <option value="gmail">Gmail</option>}
            {isHosted() && <option value="office365">Microsoft</option>}
            <option value="client_postmark">Postmark</option>
            <option value="client_mailgun">Mailgun</option>
          </SelectField>
        </Element>

        {(company?.settings.email_sending_method === 'office365' ||
          company?.settings.email_sending_method === 'microsoft' ||
          company?.settings.email_sending_method === 'gmail') &&
          isHosted() && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="gmail_sending_user_id"
                  labelElement={
                    <SettingsLabel label={`Gmail / Microsoft ${t('user')}`} />
                  }
                />
              }
            >
              <UserSelector
                endpoint="/api/v1/users?sending_users=true"
                value={company?.settings?.gmail_sending_user_id}
                onChange={(user) =>
                  handleChange('settings.gmail_sending_user_id', user.id)
                }
                onClearButtonClick={() =>
                  handleChange('settings.gmail_sending_user_id', '0')
                }
                readonly={disableSettingsField('gmail_sending_user_id')}
                errorMessage={errors?.errors['settings.gmail_sending_user_id']}
                staleTime={1}
              />
            </Element>
          )}

        {company?.settings.email_sending_method === 'client_postmark' && (
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="postmark_secret"
                labelElement={<SettingsLabel label={t('secret')} />}
              />
            }
          >
            <InputField
              value={company?.settings.postmark_secret || ''}
              onValueChange={(value) =>
                handleChange('settings.postmark_secret', value)
              }
              disabled={disableSettingsField('postmark_secret')}
              errorMessage={errors?.errors['settings.postmark_secret']}
            />
          </Element>
        )}

        {company?.settings.email_sending_method === 'client_mailgun' && (
          <>
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="mailgun_secret"
                  labelElement={<SettingsLabel label={t('secret')} />}
                />
              }
            >
              <InputField
                value={company?.settings.mailgun_secret || ''}
                onValueChange={(value) =>
                  handleChange('settings.mailgun_secret', value)
                }
                disabled={disableSettingsField('mailgun_secret')}
                errorMessage={errors?.errors['settings.mailgun_secret']}
              />
            </Element>

            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="mailgun_domain"
                  labelElement={<SettingsLabel label={t('domain')} />}
                />
              }
            >
              <InputField
                value={company?.settings.mailgun_domain || ''}
                onValueChange={(value) =>
                  handleChange('settings.mailgun_domain', value)
                }
                disabled={disableSettingsField('mailgun_domain')}
                errorMessage={errors?.errors['settings.mailgun_domain']}
              />
            </Element>

            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="mailgun_endpoint"
                  labelElement={<SettingsLabel label={t('endpoint')} />}
                  defaultValue="api.mailgun.net"
                />
              }
            >
              <SelectField
                value={company?.settings.mailgun_endpoint || 'api.mailgun.net'}
                onValueChange={(value) =>
                  handleChange('settings.mailgun_endpoint', value)
                }
                disabled={disableSettingsField('mailgun_endpoint')}
                errorMessage={errors?.errors['settings.mailgun_endpoint']}
              >
                <option value="api.mailgun.net" defaultChecked>
                  api.mailgun.net
                </option>
                <option value="api.eu.mailgun.net">api.eu.mailgun.net</option>
              </SelectField>
            </Element>
          </>
        )}

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="email_from_name"
              labelElement={<SettingsLabel label={t('from_name')} />}
            />
          }
        >
          <InputField
            value={company?.settings.email_from_name || ''}
            onValueChange={(value) =>
              handleChange('settings.email_from_name', value)
            }
            disabled={disableSettingsField('email_from_name')}
            errorMessage={errors?.errors['settings.email_from_name']}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="reply_to_name"
              labelElement={<SettingsLabel label={t('reply_to_name')} />}
            />
          }
        >
          <InputField
            value={company?.settings.reply_to_name || ''}
            onValueChange={(value) =>
              handleChange('settings.reply_to_name', value)
            }
            disabled={disableSettingsField('reply_to_name')}
            errorMessage={errors?.errors['settings.reply_to_name']}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="reply_to_email"
              labelElement={<SettingsLabel label={t('reply_to_email')} />}
            />
          }
        >
          <InputField
            value={company?.settings.reply_to_email || ''}
            onValueChange={(value) =>
              handleChange('settings.reply_to_email', value)
            }
            disabled={disableSettingsField('reply_to_email')}
            errorMessage={errors?.errors['settings.reply_to_email']}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="bcc_email"
              labelElement={
                <SettingsLabel
                  label={t('bcc_email')}
                  helpLabel={t('comma_sparated_list')}
                />
              }
            />
          }
        >
          <InputField
            value={company?.settings.bcc_email || ''}
            onValueChange={(value) => handleChange('settings.bcc_email', value)}
            disabled={disableSettingsField('bcc_email')}
            errorMessage={errors?.errors['settings.bcc_email']}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="entity_send_time"
              labelElement={<SettingsLabel label={t('send_time')} />}
            />
          }
        >
          <SelectField
            value={company?.settings.entity_send_time || ''}
            onValueChange={(value) =>
              handleChange(
                'settings.entity_send_time',
                value.length > 0 ? value : 6
              )
            }
            withBlank
            disabled={disableSettingsField('entity_send_time')}
            errorMessage={errors?.errors['settings.entity_send_time']}
          >
            {[...Array(24).keys()].map((number, index) => (
              <option key={index} value={number + 1}>
                {dayjs()
                  .startOf('day')
                  .add(number + 1, 'hour')
                  .format('h:ss A')}
              </option>
            ))}
          </SelectField>
        </Element>

        <Divider />

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="email_style"
              labelElement={<SettingsLabel label={t('email_design')} />}
              defaultValue="plain"
            />
          }
        >
          <SelectField
            value={company?.settings.email_style || 'plain'}
            onValueChange={(value) =>
              handleChange('settings.email_style', value)
            }
            disabled={disableSettingsField('email_style')}
            errorMessage={errors?.errors['settings.email_style']}
          >
            <option value="plain">{t('plain')}</option>
            <option value="light">{t('light')}</option>
            <option value="dark">{t('dark')}</option>
            <option value="custom">{t('custom')}</option>
          </SelectField>
        </Element>

        {company?.settings.email_style === 'custom' && (
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="email_style_custom"
                labelElement={<SettingsLabel label={t('custom')} />}
              />
            }
          >
            <InputField
              element="textarea"
              value={company?.settings.email_style_custom || ''}
              onValueChange={(value) =>
                value.includes('$body')
                  ? handleChange('settings.email_style_custom', value)
                  : toast.error(
                      trans('body_variable_missing', { body: '$body' })
                    )
              }
              disabled={disableSettingsField('email_style_custom')}
              errorMessage={errors?.errors['settings.email_style_custom']}
            />
          </Element>
        )}

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="email_signature"
              labelElement={<SettingsLabel label={t('signature')} />}
            />
          }
        >
          <MarkdownEditor
            value={company?.settings.email_signature || ''}
            onChange={(value) =>
              handleChange('settings.email_signature', value)
            }
            disabled={disableSettingsField('email_signature')}
          />
        </Element>
      </Card>
    </Settings>
  );
}
