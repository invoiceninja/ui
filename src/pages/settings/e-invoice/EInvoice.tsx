/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Settings } from '$app/components/layouts/Settings';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EInvoiceGenerator } from '$app/components/e-invoice/EInvoiceGenerator';
import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import Toggle from '$app/components/forms/Toggle';
import { useAtom } from 'jotai';
import { companySettingsErrorsAtom } from '../common/atoms';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useFormik } from 'formik';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { AxiosError, AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';

export type EInvoiceType = {
  [key: string]: string | number | EInvoiceType;
};

export interface EInvoiceComponent {
  saveEInvoice: () => EInvoiceType | undefined;
}
export function EInvoice() {
  const [t] = useTranslation();

  const isPeppolStandardEnabled =
    import.meta.env.VITE_ENABLE_PEPPOL_STANDARD === 'true';

  const eInvoiceRef = useRef<EInvoiceComponent>(null);

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('e_invoice'), href: '/settings/e_invoice' },
  ];

  const dispatch = useDispatch();

  const onSave = useHandleCompanySave();
  const disableSettingsField = useDisableSettingsField();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const company = useInjectCompanyChanges();
  const showPlanAlert = useShouldDisableAdvanceSettings();

  const [errors, setErrors] = useAtom(companySettingsErrorsAtom);

  const [formData, setFormData] = useState(new FormData());
  const [saveChanges, setSaveChanges] = useState<boolean>(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formData,
    onSubmit: () => {
      toast.processing();

      setErrors(undefined);

      request(
        'POST',
        endpoint('/api/v1/companies/:id', { id: company?.id }),
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

  useEffect(() => {
    if (saveChanges) {
      onSave();
      setSaveChanges(false);
    }
  }, [saveChanges]);

  return (
    <Settings
      title={t('e_invoice')}
      docsLink="en/advanced-settings/#e_invoice"
      breadcrumbs={pages}
      onSaveClick={() => {
        if (eInvoiceRef?.current?.saveEInvoice()) {
          handleChange('e_invoice', eInvoiceRef?.current?.saveEInvoice());
        }

        setSaveChanges(true);
      }}
      disableSaveButton={showPlanAlert}
    >
      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      <Card title={t('e_invoice')}>
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
          >
            {isPeppolStandardEnabled && <option value="PEPPOL">PEPPOL</option>}
            <option value="FACT1">FACT1</option>
            <option value="EN16931">EN16931</option>
            <option value="XInvoice_3_0">XInvoice_3.0</option>
            <option value="XInvoice_2_3">XInvoice_2.3</option>
            <option value="XInvoice_2_2">XInvoice_2.2</option>
            <option value="XInvoice_2_1">XInvoice_2.1</option>
            <option value="XInvoice_2_0">XInvoice_2.0</option>
            <option value="XInvoice_1_0">XInvoice_1.0</option>
            <option value="XInvoice-Extended">XInvoice-Extended</option>
            <option value="XInvoice-BasicWL">XInvoice-BasicWL</option>
            <option value="XInvoice-Basic">XInvoice-Basic</option>
            <option value="Facturae_3.2.2">Facturae_3.2.2</option>
            <option value="Facturae_3.2.1">Facturae_3.2.1</option>
            <option value="Facturae_3.2">Facturae_3.2</option>
            <option value="FatturaPA">FatturaPA</option>
          </SelectField>
        </Element>

        {company?.settings.e_invoice_type === 'PEPPOL' &&
        isPeppolStandardEnabled ? (
          <EInvoiceGenerator
            ref={eInvoiceRef}
            currentEInvoice={company?.e_invoice || {}}
          />
        ) : (
          <>
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
                <Element
                  leftSide={
                    <PropertyCheckbox
                      propertyKey="merge_e_invoice_to_pdf"
                      labelElement={
                        <SettingsLabel label={t('merge_e_invoice_to_pdf')} />
                      }
                    />
                  }
                >
                  <Toggle
                    checked={Boolean(company?.settings.merge_e_invoice_to_pdf)}
                    onValueChange={(value) =>
                      handleChange('settings.merge_e_invoice_to_pdf', value)
                    }
                    disabled={disableSettingsField('merge_e_invoice_to_pdf')}
                  />
                </Element>

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
                        handleChange(
                          'has_e_invoice_certificate_passphrase',
                          value
                        )
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
                      propertyKey="e_quote_type"
                      labelElement={<SettingsLabel label={t('e_quote_type')} />}
                      defaultValue="OrderX_Comfort"
                    />
                  }
                >
                  <SelectField
                    value={company?.settings.e_quote_type || 'OrderX_Comfort'}
                    onValueChange={(value) =>
                      handleChange('settings.e_quote_type', value)
                    }
                    disabled={disableSettingsField('e_quote_type')}
                  >
                    <option value="OrderX_Comfort">OrderX_Comfort</option>
                    <option value="OrderX_Basic">OrderX_Basic</option>
                    <option value="OrderX_Extended">OrderX_Extended</option>
                  </SelectField>
                </Element>
              </>
            ) : null}
          </>
        )}
      </Card>
    </Settings>
  );
}
