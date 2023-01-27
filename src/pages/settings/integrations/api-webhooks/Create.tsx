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
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useTitle } from 'common/hooks/useTitle';
import { ApiWebhook, ApiWebHookHeader } from 'common/interfaces/api-webhook';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankApiWebhookQuery } from 'common/queries/api-webhooks';
import { Settings } from 'components/layouts/Settings';
import { useEffect, useState } from 'react';
import { PlusCircle, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useHandleChange } from './common/hooks';

export function Create() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('new_webhook');

  const { data: blankApiWebHook } = useBlankApiWebhookQuery();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    { name: t('api_webhooks'), href: '/settings/integrations/api_webhooks' },
    {
      name: t('new_webhook'),
      href: '/settings/integrations/api_webhooks/create',
    },
  ];

  const EVENT_CREATE_CLIENT = '1';
  const EVENT_CREATE_INVOICE = '2';
  const EVENT_CREATE_QUOTE = '3';
  const EVENT_CREATE_PAYMENT = '4';
  const EVENT_CREATE_VENDOR = '5';
  const EVENT_UPDATE_QUOTE = '6';
  const EVENT_DELETE_QUOTE = '7';
  const EVENT_UPDATE_INVOICE = '8';
  const EVENT_DELETE_INVOICE = '9';
  const EVENT_UPDATE_CLIENT = '10';
  const EVENT_DELETE_CLIENT = '11';
  const EVENT_DELETE_PAYMENT = '12';
  const EVENT_UPDATE_VENDOR = '13';
  const EVENT_DELETE_VENDOR = '14';
  const EVENT_CREATE_EXPENSE = '15';
  const EVENT_UPDATE_EXPENSE = '16';
  const EVENT_DELETE_EXPENSE = '17';
  const EVENT_CREATE_TASK = '18';
  const EVENT_UPDATE_TASK = '19';
  const EVENT_DELETE_TASK = '20';
  const EVENT_APPROVE_QUOTE = '21';
  const EVENT_LATE_INVOICE = '22';
  const EVENT_EXPIRED_QUOTE = '23';
  const EVENT_REMIND_INVOICE = '24';

  const events = [
    { event: EVENT_CREATE_CLIENT, label: t('create_client') },
    { event: EVENT_UPDATE_CLIENT, label: t('update_client') },
    { event: EVENT_DELETE_CLIENT, label: t('delete_client') },

    { event: EVENT_CREATE_INVOICE, label: t('create_invoice') },
    { event: EVENT_UPDATE_INVOICE, label: t('update_invoice') },
    { event: EVENT_LATE_INVOICE, label: t('late_invoice') },
    { event: EVENT_REMIND_INVOICE, label: t('remind_invoice') },
    { event: EVENT_DELETE_INVOICE, label: t('delete_invoice') },

    { event: EVENT_CREATE_QUOTE, label: t('create_quote') },
    { event: EVENT_UPDATE_QUOTE, label: t('update_quote') },
    { event: EVENT_APPROVE_QUOTE, label: t('approve_quote') },
    { event: EVENT_EXPIRED_QUOTE, label: t('expired_quote') },
    { event: EVENT_DELETE_QUOTE, label: t('delete_quote') },

    { event: EVENT_CREATE_PAYMENT, label: t('create_payment') },
    { event: EVENT_DELETE_PAYMENT, label: t('delete_payment') },

    { event: EVENT_CREATE_VENDOR, label: t('create_vendor') },
    { event: EVENT_UPDATE_VENDOR, label: t('update_vendor') },
    { event: EVENT_DELETE_VENDOR, label: t('delete_vendor') },

    { event: EVENT_CREATE_EXPENSE, label: t('create_expense') },
    { event: EVENT_UPDATE_EXPENSE, label: t('update_expense') },
    { event: EVENT_DELETE_EXPENSE, label: t('delete_expense') },

    { event: EVENT_CREATE_TASK, label: t('create_task') },
    { event: EVENT_UPDATE_TASK, label: t('update_task') },
    { event: EVENT_DELETE_TASK, label: t('delete_task') },
  ];

  const [headers, setHeaders] = useState<ApiWebHookHeader>({});
  const [header, setHeader] = useState<ApiWebHookHeader>({});
  const [errors, setErrors] = useState<ValidationBag>();
  const [apiWebHook, setApiWebHook] = useState<ApiWebhook>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = useHandleChange({ setApiWebHook, setErrors });

  const handleRemoveHeader = (key: string) => {
    if (Object.hasOwn(headers, key)) {
      const updatedHeaders = { ...headers };

      delete updatedHeaders[key];

      setHeaders(updatedHeaders);
    }
  };

  const navigate = useNavigate();

  const handleSave = () => {
    if (apiWebHook && !isFormBusy) {
      toast.processing();
      setIsFormBusy(true);
      setErrors(undefined);

      apiWebHook.headers = headers;

      request('POST', endpoint('/api/v1/webhooks'), apiWebHook)
        .then((response: GenericSingleResourceResponse<ApiWebhook>) => {
          toast.success('created_webhook');

          navigate(
            route('/settings/integrations/api_webhooks/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          } else {
            toast.error();
            console.error(error);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (blankApiWebHook) {
      setApiWebHook({
        ...blankApiWebHook,
        headers: {},
      });
    }
  }, [blankApiWebHook]);

  return (
    <Settings
      title={t('api_webhooks')}
      breadcrumbs={pages}
      disableSaveButton={!apiWebHook}
      onSaveClick={handleSave}
    >
      <Card title={documentTitle}>
        <Element leftSide={t('target_url')} required>
          <InputField
            required
            value={apiWebHook?.target_url}
            onValueChange={(value) => handleChange('target_url', value)}
            errorMessage={errors?.errors.target_url}
          />
        </Element>

        <Element leftSide={t('event_type')}>
          <SelectField
            value={apiWebHook?.event_id}
            onValueChange={(value) => handleChange('event_id', value)}
            errorMessage={errors?.errors.event_id}
          >
            {events.map((event) => (
              <option key={event.event} value={event.event}>
                {event.label}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element leftSide={t('method')}>
          <SelectField
            value={apiWebHook?.rest_method}
            onValueChange={(value) => handleChange('rest_method', value)}
            errorMessage={errors?.errors.method}
          >
            <option value="post">POST</option>
            <option value="put">PUT</option>
          </SelectField>
        </Element>

        <Element leftSide={t('add_header')}>
          <div className="flex flex-col">
            <div className="flex flex-1 justify-between items-center space-x-6">
              <div className="flex-1">
                <InputField
                  debounceTimeout={0}
                  id="header_key"
                  placeholder={t('header_key')}
                  value={header.key || ''}
                  onValueChange={(value) =>
                    setHeader({ ...header, key: value })
                  }
                />
              </div>

              <div className="flex-1">
                <InputField
                  className="flex-1"
                  debounceTimeout={0}
                  id="header_value"
                  value={header.value || ''}
                  placeholder={t('header_value')}
                  onValueChange={(value) => setHeader({ ...header, value })}
                />
              </div>

              <Button
                behavior="button"
                type="minimal"
                disableWithoutIcon
                disabled={Boolean(!header.key) || Boolean(!header.value)}
                onClick={() => {
                  setHeaders((headers) => ({
                    ...headers,
                    [header.key]: header.value,
                  }));

                  setHeader({});
                }}
              >
                <PlusCircle />
              </Button>
            </div>

            <div className="flex flex-col space-y-5 pt-5">
              {Object.entries(headers).map(([key, value], index) => (
                <div
                  key={index}
                  className="flex justify-between items-center space-x-4"
                >
                  <span className="flex-1 text-start">{key}</span>

                  <span className="flex-1 text-start">{value}</span>

                  <Button
                    behavior="button"
                    type="minimal"
                    onClick={() => handleRemoveHeader(key)}
                  >
                    <X size={18} />
                  </Button>
                </div>
              ))}

              {!Object.entries(headers).length && (
                <span className="text-gray-500 self-center text-xl">
                  {t('no_headers')}
                </span>
              )}
            </div>
          </div>
        </Element>
      </Card>
    </Settings>
  );
}
