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
import { useHandleCancel } from '$app/pages/invoices/edit/hooks/useHandleCancel';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { useDropzone } from 'react-dropzone';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { AxiosResponse, AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { request } from '$app/common/helpers/request';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Image } from 'react-feather';
import { route } from '$app/common/helpers/route';
import { DebouncedCombobox } from '$app/components/forms/DebouncedCombobox';
import { User } from '@sentry/react';
import { Record } from '$app/components/forms/DebouncedCombobox';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../common/atoms';

export function EmailSettings() {
  useTitle('email_settings');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('email_settings'), href: '/settings/email_settings' },
  ];

  const company = useInjectCompanyChanges();
  const currentCompany = useCurrentCompany();

  const errors = useAtomValue(companySettingsErrorsAtom);

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const onSave = useHandleCompanySave();
  const onCancel = useHandleCancel();

  const showPlanAlert = useShouldDisableAdvanceSettings();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(new FormData());

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formData,
    onSubmit: () => {
      toast.loading(t('processing'));

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

          toast.dismiss();
          toast.success(t('uploaded_document'));
        })
        .catch((error: AxiosError) => {
          console.error(error);

          toast.dismiss();
          toast.error(t('error_title'));
        })
        .finally(() => setFormData(new FormData()));
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error(t('invalid_file'));
      return;
    }

    formData.append('e_invoice_certificate', acceptedFiles[0]);
    formData.append('_method', 'PUT');

    setFormData(formData);

    formik.submitForm();
  }, []);

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
        <Element leftSide={t('show_email_footer')}>
          <Toggle
            checked={company?.settings.show_email_footer}
            onValueChange={(value) =>
              handleChange('settings.show_email_footer', value)
            }
          />
        </Element>

        <Element leftSide={t('attach_pdf')}>
          <Toggle
            checked={company?.settings.pdf_email_attachment}
            onValueChange={(value) =>
              handleChange('settings.pdf_email_attachment', value)
            }
          />
        </Element>

        <Element leftSide={t('attach_documents')}>
          <Toggle
            checked={company?.settings.document_email_attachment}
            onValueChange={(value) =>
              handleChange('settings.document_email_attachment', value)
            }
          />
        </Element>

        <Element leftSide={t('attach_ubl')}>
          <Toggle
            checked={company?.settings.ubl_email_attachment}
            onValueChange={(value) =>
              handleChange('settings.ubl_email_attachment', value)
            }
          />
        </Element>

        <Element leftSide={t('enable_e_invoice')}>
          <Toggle
            checked={company?.settings.enable_e_invoice}
            onValueChange={(value) =>
              handleChange('settings.enable_e_invoice', value)
            }
          />
        </Element>
        {company?.settings.enable_e_invoice ? (
          <>
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
          </>
        ) : null}

        <Divider />

        <Element leftSide={t('email_provider')}>
          <SelectField
            value={company?.settings.email_sending_method}
            onValueChange={(value) =>
              handleChange('settings.email_sending_method', value)
            }
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
            <Element leftSide={`Gmail / Microsoft ${t('user')}`}>
              <DebouncedCombobox
                clearButton={true}
                onClearButtonClick={() =>
                  handleChange('settings.gmail_sending_user_id', '0')
                }
                defaultValue={company?.settings.gmail_sending_user_id}
                endpoint={route('/api/v1/users?sending_users=true')}
                label="user"
                onChange={(value: Record<User>) =>
                  value.resource &&
                  handleChange(
                    'settings.gmail_sending_user_id',
                    value?.resource?.id
                  )
                }
                formatLabel={(resource: User) =>
                  `${resource.first_name} ${resource.last_name}`
                }
                staleTime={1}
                errorMessage={errors?.errors['settings.gmail_sending_user_id']}
              />
            </Element>
          )}

        {company?.settings.email_sending_method === 'client_postmark' && (
          <Element leftSide={t('secret')}>
            <InputField
              value={company?.settings.postmark_secret}
              onValueChange={(value) =>
                handleChange('settings.postmark_secret', value)
              }
              errorMessage={errors?.errors['settings.postmark_secret']}
            />
          </Element>
        )}

        {company?.settings.email_sending_method === 'client_mailgun' && (
          <>
            <Element leftSide={t('secret')}>
              <InputField
                value={company?.settings.mailgun_secret}
                onValueChange={(value) =>
                  handleChange('settings.mailgun_secret', value)
                }
                errorMessage={errors?.errors['settings.mailgun_secret']}
              />
            </Element>

            <Element leftSide={t('domain')}>
              <InputField
                value={company?.settings.mailgun_domain}
                onValueChange={(value) =>
                  handleChange('settings.mailgun_domain', value)
                }
                errorMessage={errors?.errors['settings.mailgun_domain']}
              />
            </Element>

            <Element leftSide={t('endpoint')}>
              <SelectField
                value={company?.settings.mailgun_endpoint}
                onValueChange={(value) =>
                  handleChange('settings.mailgun_endpoint', value)
                }
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

        <Element leftSide={t('from_name')}>
          <InputField
            value={company?.settings.email_from_name}
            onValueChange={(value) =>
              handleChange('settings.email_from_name', value)
            }
            errorMessage={errors?.errors['settings.email_from_name']}
          />
        </Element>

        <Element leftSide={t('reply_to_name')}>
          <InputField
            value={company?.settings.reply_to_name}
            onValueChange={(value) =>
              handleChange('settings.reply_to_name', value)
            }
            errorMessage={errors?.errors['settings.reply_to_name']}
          />
        </Element>

        <Element leftSide={t('reply_to_email')}>
          <InputField
            value={company?.settings.reply_to_email}
            onValueChange={(value) =>
              handleChange('settings.reply_to_email', value)
            }
            errorMessage={errors?.errors['settings.reply_to_email']}
          />
        </Element>

        <Element
          leftSide={t('bcc_email')}
          leftSideHelp={t('comma_sparated_list')}
        >
          <InputField
            value={company?.settings.bcc_email}
            onValueChange={(value) => handleChange('settings.bcc_email', value)}
            errorMessage={errors?.errors['settings.bcc_email']}
          />
        </Element>

        <Element leftSide={t('send_time')}>
          <SelectField
            value={company?.settings.entity_send_time}
            onValueChange={(value) =>
              handleChange(
                'settings.entity_send_time',
                value.length > 0 ? value : 6
              )
            }
            withBlank
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

        <Element leftSide={t('email_design')}>
          <SelectField
            value={company?.settings.email_style}
            onValueChange={(value) =>
              handleChange('settings.email_style', value)
            }
            errorMessage={errors?.errors['settings.email_style']}
          >
            <option value="plain">{t('plain')}</option>
            <option value="light">{t('light')}</option>
            <option value="dark">{t('dark')}</option>
            <option value="custom">{t('custom')}</option>
          </SelectField>
        </Element>

        {company?.settings.email_style === 'custom' && (
          <Element leftSide={t('custom')}>
            <InputField
              element="textarea"
              value={company?.settings.email_style_custom}
              onValueChange={(value) =>
                value.includes('$body')
                  ? handleChange('settings.email_style_custom', value)
                  : toast.error(
                      trans('body_variable_missing', { body: '$body' })
                    )
              }
              errorMessage={errors?.errors['settings.email_style_custom']}
            />
          </Element>
        )}

        <Element leftSide={t('signature')}>
          <MarkdownEditor
            value={company?.settings.email_signature}
            onChange={(value) =>
              handleChange('settings.email_signature', value)
            }
          />
        </Element>
      </Card>
    </Settings>
  );
}
