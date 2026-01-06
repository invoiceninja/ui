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
import { Card, Element } from '$app/components/cards';
import Toggle from '$app/components/forms/Toggle';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { ValidationAlert } from '$app/components/ValidationAlert';
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { cloneDeep } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { Settings } from '$app/common/interfaces/docuninja/api';
import { useColorScheme } from '$app/common/colors';

function Notifications() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | null>(null);
  const [settings, setSettings] = useState<Settings>({
    email_client_when_completed: false,
    ninja_quote_notification: false,
    ninja_invoice_notification: false,
    ninja_credit_notification: false,
    ninja_purchase_order_notification: false,
    force_des_signature: false,
  });
  const isInitialized = useRef(false);
  const settingsRef = useRef<Settings>(settings);

  // Get DocuNinja data from unified atoms (NO QUERY!)
  const [docuData] = useAtom(docuNinjaAtom);
  const docuCompanies = docuData?.companies;
  const id = docuCompanies?.[0]?.id;

  // Initialize settings from company data only once
  useEffect(() => {
    if (docuCompanies?.[0]?.settings && !isInitialized.current) {
      setSettings(docuCompanies[0].settings as any);
      settingsRef.current = docuCompanies[0].settings as any;
      isInitialized.current = true;
    }
  }, [docuCompanies?.[0]?.settings]);

  // Keep ref in sync with settings state
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);


  const handleSave = () => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();

      // Create updated company object with new settings
      const updatedCompany = cloneDeep(docuCompanies?.[0]);
      if (updatedCompany) {
        updatedCompany.settings = settingsRef.current;
      }

      request(
        'PUT',
        docuNinjaEndpoint('/api/companies/:id', {
          id: id,
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
            setErrors(error.response.data);
            const errorMessage = error.response.data.message || 'validation_errors';
            toast.error(errorMessage);
          } else {
            toast.error('error_title');
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
    [isFormBusy]
  );

  return (
    <>
      {errors && <ValidationAlert errors={errors} />}
      
      <Card
        title={t('notifications')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
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
    </Card>
  </>
  );
}

export default Notifications;
