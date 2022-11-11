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
import { InputField, SelectField } from '@invoiceninja/forms';
import { WebhookConfiguration } from 'common/interfaces/webhook-configuration';
import { useState } from 'react';
import { PlusCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Header } from 'common/interfaces/headers';

interface Props {
  webhookConfig: WebhookConfiguration;
  setWebhookConfig: React.Dispatch<
    React.SetStateAction<WebhookConfiguration | undefined>
  >;
}

export function Webhook(props: Props) {
  const [t] = useTranslation();
  const { webhookConfig, setWebhookConfig } = props;
  const [headersArr, setHeadersArr] = useState<Header[]>(
    webhookConfig.post_purchase_headers || []
  );
  const [header, setHeader] = useState<Header>({ key: '', value: '' });

  const onChange = (field: keyof WebhookConfiguration, value: unknown) => {
    setWebhookConfig(
      (webhookConfig) => webhookConfig && { ...webhookConfig, [field]: value }
    );
  };

  const isHeaderEmpty = () => {
    return header.key === '' || header.value === '';
  };

  return (
    <Card title={t('Webhook')}>
      <Element leftSide={t('webhook_url')}>
        <InputField
          value={webhookConfig.post_purchase_url}
          onValueChange={(value) => onChange('post_purchase_url', value)}
        />
      </Element>

      <Element leftSide={t('post_purchase_rest_method')}>
        <SelectField
          value={webhookConfig.post_purchase_rest_method}
          onValueChange={(value) =>
            onChange('post_purchase_rest_method', value)
          }
        >
          <option defaultChecked></option>
          <option value={'post'}>{t('post_method')}</option>
          <option value={'put'}>{t('put_method')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('post_purchase_headers')}>
        <div className="flex justify-content-between">
          <InputField
            value={header.key}
            placeholder={t('header_key')}
            onChange={(e: any) => setHeader({ ...header, key: e.target.value })}
          />
          <InputField
            value={header.value}
            className="ml-2"
            id="header_value"
            placeholder={t('header_value')}
            onChange={(e: any) =>
              setHeader({ ...header, value: e.target.value })
            }
          />
          {isHeaderEmpty() ? (
            <PlusCircle className="ml-4 mt-2" size={'18px'} opacity="0.4" cursor='not-allowed' />
          ) : (
            <PlusCircle
              className="ml-4 mt-2"
              size={'18px'}
              onClick={() => {
                setHeadersArr((headersArr) => [...headersArr, header]);
                setWebhookConfig({
                  ...webhookConfig,
                  post_purchase_headers: [...headersArr, header],
                });
                setHeader({ key: '', value: '' });
              }}
            />
          )}
        </div>
      </Element>
      <Element>
        {headersArr.length > 0 &&
          headersArr.map((i) => (
            <div key={i.key} className="flex justify-between font-semibold	">
              <div className="w-1/2 mb-2">{i.key}</div>
              <div className="w-1/2">{i.value}</div>
            </div>
          ))}
      </Element>
    </Card>
  );
}
