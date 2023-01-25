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
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useApiWebhookQuery } from 'common/queries/api-webhooks';
import { Divider } from 'components/cards/Divider';
import { Settings } from 'components/layouts/Settings';
import { ResourceActions } from 'components/ResourceActions';
import { ChangeEvent, useEffect, useState } from 'react';
import { PlusCircle, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useHandleChange } from './common/hooks';
import { useActions } from './common/useActions';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();

  useTitle('edit_webhook');

  const navigate = useNavigate();

  const actions = useActions();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    { name: t('api_webhooks'), href: '/settings/integrations/api_webhooks' },
    {
      name: t('edit_webhook'),
      href: route('/settings/integrations/api_webhooks/:id/edit', {
        id,
      }),
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

  const [headers, setHeaders] = useState<ApiWebHookHeader[]>([]);
  const [header, setHeader] = useState<ApiWebHookHeader>({});
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [apiWebHook, setApiWebHook] = useState<ApiWebhook>();

  const handleChange = useHandleChange({ setApiWebHook, setErrors });

  const queryClient = useQueryClient();
  const { data: apiWebHookResponse } = useApiWebhookQuery({ id });

  const handleSave = () => {
    if (apiWebHook && !isFormBusy) {
      toast.processing();
      setIsFormBusy(true);
      setErrors(undefined);

      apiWebHook.headers = headers;

      request('PUT', endpoint('/api/v1/webhooks/:id', { id }), apiWebHook)
        .then(() => {
          toast.success('created_webhook');

          queryClient.invalidateQueries('/api/v1/webhooks');
          queryClient.invalidateQueries(route('/api/v1/webhooks/:id', { id }));

          navigate('/settings/integrations/api_webhooks');
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
    if (apiWebHookResponse?.headers) {
      if (apiWebHookResponse.headers instanceof Array) {
        setHeaders(apiWebHookResponse.headers);
      } else {
        setHeaders([apiWebHookResponse.headers]);
      }
    }
  }, [apiWebHookResponse]);

  useEffect(() => {
    if (apiWebHookResponse) {
      setApiWebHook(apiWebHookResponse);
    }
  }, [apiWebHookResponse]);

  return (
    <Settings
      title={t('api_webhooks')}
      breadcrumbs={pages}
      disableSaveButton={!apiWebHook}
      onSaveClick={handleSave}
      navigationTopRight={
        apiWebHook && (
          <ResourceActions
            label={t('more_actions')}
            resource={apiWebHook}
            actions={actions}
          />
        )
      }
    >
      <Card title={apiWebHookResponse?.target_url}>
        <Element leftSide={t('target_url')}>
          <InputField
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
            errorMessage={errors?.errors.rest_method}
          >
            <option value="post">POST</option>
            <option value="put">PUT</option>
          </SelectField>
        </Element>

        <Divider />

        <Element
          leftSide={
            <InputField
              debounceTimeout={0}
              id="header_key"
              placeholder={t('header_key')}
              value={header.key || ''}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setHeader({ ...header, key: event.target.value })
              }
            />
          }
        >
          <div className="inline-flex items-center space-x-4">
            <InputField
              debounceTimeout={0}
              id="header_value"
              value={header.value || ''}
              placeholder={t('header_value')}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setHeader({ ...header, value: event.target.value })
              }
            />

            {header.key && header.value && (
              <Button
                behavior="button"
                type="minimal"
                onClick={() => {
                  setHeaders((headers) => [
                    ...headers,
                    { [header.key]: header.value },
                  ]);

                  setHeader({});
                }}
              >
                <PlusCircle />
              </Button>
            )}
          </div>
        </Element>

        <Divider />

        {headers.length === 0 && (
          <Element>
            <span className="text-gray-600">{t('no_headers')}</span>
          </Element>
        )}

        {headers.map((header, index) => (
          <Element key={index} leftSide={Object.keys(header)[0]}>
            <div className="flex items-center space-x-4">
              <span>{header[Object.keys(header)[0]]}</span>
              <Button
                behavior="button"
                type="minimal"
                onClick={() => {
                  setHeaders((headers) =>
                    headers.filter(
                      (entry) =>
                        Object.keys(entry)[0] !== Object.keys(header)[0]
                    )
                  );
                }}
              >
                <X size={18} />
              </Button>
            </div>
          </Element>
        ))}
      </Card>
    </Settings>
  );
}
