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
import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
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
import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { AxiosError, AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';
import {
  resetChanges,
  updateRecord,
} from '$app/common/stores/slices/company-users';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { PaymentMeans } from '$app/components/e-invoice/PaymentMeans';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { whiteLabelPlan } from '$app/common/guards/guards/white-label';
import { EUTaxDetails } from './common/components/EUTaxDetails';
import { Onboarding } from './peppol/Onboarding';
import { Preferences } from './peppol/Preferences';
import { PEPPOL_COUNTRIES } from '$app/common/helpers/peppol-countries';
import { PEPPOLPlanBanner } from './common/components/PEPPOLPlanBanner';

export type EInvoiceType = {
  [key: string]: string | number | EInvoiceType;
};

export interface EInvoiceComponent {
  saveEInvoice: () => EInvoiceType | undefined;
}

const INVOICE_TYPES = {
  PEPPOL: 'PEPPOL',
  FACT1: 'FACT1',
  EN16931: 'EN16931',
  XInvoice_3_0: 'XInvoice_3.0',
  XInvoice_2_3: 'XInvoice_2.3',
  XInvoice_2_2: 'XInvoice_2.2',
  XInvoice_2_1: 'XInvoice_2.1',
  XInvoice_2_0: 'XInvoice_2.0',
  XInvoice_1_0: 'XInvoice_1.0',
  'XInvoice-Extended': 'XInvoice-Extended',
  'XInvoice-BasicWL': 'XInvoice-BasicWL',
  'XInvoice-Basic': 'XInvoice-Basic',
  'Facturae_3.2.2': 'Facturae_3.2.2',
  'Facturae_3.2.1': 'Facturae_3.2.1',
  'Facturae_3.2': 'Facturae_3.2',
  FatturaPA: 'FatturaPA',
};

export function EInvoice() {
  const company = useInjectCompanyChanges();
  const [t] = useTranslation();

  const shouldShowPEPPOLOption = () => {
    if (import.meta.env.DEV) {
      return true;
    }

    if (import.meta.env.VITE_ENABLE_PEPPOL_STANDARD !== 'true') {
      return false;
    }

    const isPlanActive =
      (isHosted() && enterprisePlan()) || (isSelfHosted() && whiteLabelPlan());

    return (
      isPlanActive &&
      PEPPOL_COUNTRIES.includes(company?.settings.country_id || '')
    );
  };

  const eInvoiceRef = useRef<EInvoiceComponent>(null);

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('e_invoicing'), href: '/settings/e_invoice' },
  ];

  const dispatch = useDispatch();

  const onSave = useHandleCompanySave();
  const disableSettingsField = useDisableSettingsField();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

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
          dispatch(resetChanges('company'));

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
      title={t('e_invoicing')}
      docsLink="en/advanced-settings/#e_invoice"
      breadcrumbs={pages}
      // onSaveClick={() => {
      //   if (eInvoiceRef?.current?.saveEInvoice()) {
      //     handleChange('e_invoice', eInvoiceRef?.current?.saveEInvoice());
      //   } else {
      //     handleChange('e_invoice', {});
      //   }

      //   setSaveChanges(true);
      // }}
      onSaveClick={() => {
        eInvoiceRef?.current?.saveEInvoice();
        onSave();
      }}
    >
      <PEPPOLPlanBanner />

      {Boolean(!company?.legal_entity_id) && (
        <Card title={t('e_invoicing')}>
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
              dismissable={false}
              customSelector
            >
              {Object.entries(INVOICE_TYPES)
                .filter(([key]) => key !== 'PEPPOL' || shouldShowPEPPOLOption())
                .map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
            </SelectField>
          </Element>

          {company?.settings.e_invoice_type !== 'PEPPOL' ? (
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
          ) : null}

          {company?.settings.e_invoice_type === 'PEPPOL' ? (
            <>
              {/* {company?.settings.enable_e_invoice && (
              <EInvoiceGenerator
                ref={eInvoiceRef}
                currentEInvoice={company?.e_invoice || {}}
              />
            )} */}

              {company?.settings.enable_e_invoice &&
              company?.legal_entity_id ? (
                <div className="flex flex-col space-y-4">{/*  */}</div>
              ) : (
                <Onboarding />
              )}
            </>
          ) : (
            <>
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
                      checked={Boolean(
                        company?.settings.merge_e_invoice_to_pdf
                      )}
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
                        labelElement={
                          <SettingsLabel label={t('e_quote_type')} />
                        }
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
      )}

      {company?.settings.e_invoice_type === 'PEPPOL' &&
      shouldShowPEPPOLOption() &&
      company.legal_entity_id ? (
        <Preferences />
      ) : null}

      {company?.settings.enable_e_invoice ? (
        <PaymentMeans
          ref={eInvoiceRef}
          currentEInvoice={company?.e_invoice || {}}
          entity="company"
        />
      ) : null}

      {company?.settings.enable_e_invoice &&
      company?.legal_entity_id &&
      shouldShowPEPPOLOption() ? (
        <EUTaxDetails />
      ) : null}
    </Settings>
  );
}
