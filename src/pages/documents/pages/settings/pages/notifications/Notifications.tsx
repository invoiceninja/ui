/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import Toggle from '$app/components/forms/Toggle';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { docuCompanyAccountDetailsAtom } from '$app/pages/documents/Document';
import { useAtomValue } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { Settings } from '$app/common/interfaces/docuninja/api';

function Notifications() {
  const [t] = useTranslation();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | null>(null);
  const [settings, setSettings] = useState<Settings>({
    email_client_when_completed: false,
    ninja_quote_notification: false,
    ninja_invoice_notification: false,
    ninja_credit_notification: false,
    ninja_purchase_order_notification: false,
  });
  const isInitialized = useRef(false);
  const settingsRef = useRef<Settings>(settings);

  const docuCompanyAccountDetails = useAtomValue(docuCompanyAccountDetailsAtom);
  const id = docuCompanyAccountDetails?.company?.id;

  // Initialize settings from company data only once
  useEffect(() => {
    if (docuCompanyAccountDetails?.company?.settings && !isInitialized.current) {
      setSettings(docuCompanyAccountDetails.company.settings);
      settingsRef.current = docuCompanyAccountDetails.company.settings;
      isInitialized.current = true;
    }
  }, [docuCompanyAccountDetails?.company?.settings]);

  // Keep ref in sync with settings state
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);


  const handleSave = () => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();

      // Create updated company object with new settings
      const updatedCompany = cloneDeep(docuCompanyAccountDetails?.company);
      if (updatedCompany) {
        updatedCompany.settings = settingsRef.current;
      }

      request(
        'PUT',
        docuNinjaEndpoint('/api/companies/:id', {
          id: docuCompanyAccountDetails?.company?.id,
        }),
        updatedCompany,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then((response) => {
          toast.success('updated_company');

          $refetch(['docuninja_login']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const handleSettingsChange = (property: keyof Settings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [property]: value,
    }));
  };


  useSaveBtn(
    {
      onClick: handleSave,
      disableSaveButton: isFormBusy,
    },
    []
  );

  return (
    <div className="flex flex-col pt-2 pb-2">

      <Element
        leftSide={
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {t('quote_signed_notification')}
            </span>
            <span className="text-xs text-gray-500">
              {t('email_client_when_quote_signed_description')}
            </span>
          </div>
        }
      >
        <Toggle
          checked={settings.ninja_quote_notification}
          onChange={(value: boolean) => handleSettingsChange('ninja_quote_notification', value)}
          disabled={isFormBusy}
        />
      </Element>

      <Element
        leftSide={
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {t('invoice_signed_notification')}
            </span>
            <span className="text-xs text-gray-500">
              {t('email_client_when_invoice_signed_description')}
            </span>
          </div>
        }
      >
        <Toggle
          checked={settings.ninja_invoice_notification}
          onChange={(value: boolean) => handleSettingsChange('ninja_invoice_notification', value)}
          disabled={isFormBusy}
        />
      </Element>

      <Element

        leftSide={
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {t('credit_signed_notification')}
            </span>
            <span className="text-xs text-gray-500">
              {t('email_client_when_credit_signed_description')}
            </span>
          </div>
        }
      >
        <Toggle
          checked={settings.ninja_credit_notification}
          onChange={(value: boolean) => handleSettingsChange('ninja_credit_notification', value)}
          disabled={isFormBusy}
        />
      </Element>

      <Element

        leftSide={
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {t('purchase_order_signed_notification')}
            </span>
            <span className="text-xs text-gray-500">
              {t('email_vendor_when_purchase_order_signed_description')}
            </span>
          </div>
        }
      >
        <Toggle
          checked={settings.ninja_purchase_order_notification}
          onChange={(value: boolean) => handleSettingsChange('ninja_purchase_order_notification', value)}
          disabled={isFormBusy}
        />
      </Element>


      <Element

        leftSide={
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {t('custom_document_completed')}
            </span>
            <span className="text-xs text-gray-500">
              {t('email_client_when_custom_document_completed')}
            </span>
          </div>
        }
      >
        <Toggle
          checked={settings.email_client_when_completed}
          onChange={(value: boolean) => handleSettingsChange('email_client_when_completed', value)}
          disabled={isFormBusy}
        />
      </Element>
      
    </div>
  );
}

export default Notifications;
