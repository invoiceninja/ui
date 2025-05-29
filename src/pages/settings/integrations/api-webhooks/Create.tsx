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
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import {
  ApiWebhook,
  ApiWebHookHeader,
} from '$app/common/interfaces/api-webhook';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankApiWebhookQuery } from '$app/common/queries/api-webhooks';
import { Settings } from '$app/components/layouts/Settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useHandleChange } from './common/hooks';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useEvents } from './common/hooks/useEvents';
import { useColorScheme } from '$app/common/colors';
import styled from 'styled-components';
import { Plus } from '$app/components/icons/Plus';
import classNames from 'classnames';
import { CircleXMark } from '$app/components/icons/CircleXMark';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function Create() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('new_webhook');

  const colors = useColorScheme();

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

  const events = useEvents();

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

          $refetch(['webhooks']);

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
      <Card
        title={documentTitle}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
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
            customSelector
            dismissable={false}
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
            customSelector
            dismissable={false}
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

              <Box
                className={classNames(
                  'focus:outline-none focus:ring-0 p-1.5 border rounded-md',
                  {
                    'cursor-pointer':
                      Boolean(header.key) && Boolean(header.value),
                    'cursor-not-allowed opacity-75':
                      Boolean(!header.key) || Boolean(!header.value),
                  }
                )}
                onClick={() => {
                  if (Boolean(!header.key) || Boolean(!header.value)) {
                    return;
                  }

                  setHeaders((headers) => ({
                    ...headers,
                    [header.key]: header.value,
                  }));

                  setHeader({});
                }}
                style={{
                  borderColor: colors.$21,
                }}
                theme={{
                  backgroundColor: colors.$1,
                  hoverBackgroundColor: colors.$4,
                }}
              >
                <Plus size="1.1rem" color={colors.$3} />
              </Box>
            </div>

            <div className="flex flex-col space-y-5 pt-5">
              {Object.entries(headers).map(([key, value], index) => (
                <div
                  key={index}
                  className="flex justify-between items-center space-x-4"
                >
                  <span className="flex-1 text-start">{key}</span>

                  <span className="flex-1 text-start">{value}</span>

                  <div
                    className="cursor-pointer"
                    onClick={() => handleRemoveHeader(key)}
                  >
                    <CircleXMark
                      color={colors.$16}
                      hoverColor={colors.$3}
                      borderColor={colors.$5}
                      hoverBorderColor={colors.$17}
                      size="1.6rem"
                    />
                  </div>
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
