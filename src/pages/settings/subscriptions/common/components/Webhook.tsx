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
import { useAccentColor } from 'common/hooks/useAccentColor';
import { Subscription } from 'common/interfaces/subscription';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';
import { SubscriptionProps } from './Overview';

export function Webhook(props: SubscriptionProps) {
  const [t] = useTranslation();

  const accentColor = useAccentColor();

  const [headerKey, setHeaderKey] = useState<string>('');

  const [headerValue, setHeaderValue] = useState<string>('');

  const headers = Object.entries(
    props.subscription.webhook_configuration.post_purchase_headers
  );

  const handleAddHeader = () => {
    props.handleChange(
      `webhook_configuration.post_purchase_headers.${headerKey}` as keyof Subscription,
      headerValue
    );

    setHeaderKey('');

    setHeaderValue('');
  };

  const handleRemoveHeader = (key: string) => {
    if (
      Object.prototype.hasOwnProperty.call(
        props.subscription.webhook_configuration.post_purchase_headers,
        key
      )
    ) {
      delete props.subscription.webhook_configuration.post_purchase_headers[
        key
      ];

      props.handleChange(
        'webhook_configuration' as keyof Subscription,
        props.subscription.webhook_configuration
      );
    }
  };

  return (
    <Card title={t('webhook')}>
      <Element leftSide={t('webhook_url')}>
        <InputField
          value={props.subscription.webhook_configuration.post_purchase_url}
          onValueChange={(value) =>
            props.handleChange(
              'webhook_configuration.post_purchase_url' as keyof Subscription,
              value
            )
          }
          errorMessage={props.errors?.errors.post_purchase_url}
        />
      </Element>

      <Element leftSide={t('rest_method')}>
        <SelectField
          value={
            props.subscription.webhook_configuration.post_purchase_rest_method
          }
          onValueChange={(value) =>
            props.handleChange(
              'webhook_configuration.post_purchase_rest_method' as keyof Subscription,
              value
            )
          }
          errorMessage={props.errors?.errors.post_purchase_rest_method}
        >
          <option defaultChecked></option>
          <option value="post">{t('post')}</option>
          <option value="put">{t('put')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('headers')}>
        <div className="flex flex-col">
          <div className="flex flex-1 justify-between items-center">
            <InputField
              label={t('header_key')}
              value={headerKey}
              onValueChange={(value) => setHeaderKey(value)}
            />

            <InputField
              label={t('header_value')}
              value={headerValue}
              onValueChange={(value) => setHeaderValue(value)}
            />

            <BiPlusCircle
              className="mt-7 text-gray-800 cursor-pointer"
              fontSize={25}
              onClick={() => headerKey && headerValue && handleAddHeader()}
            />
          </div>

          {headers?.map(([key, value], index) => (
            <div
              key={index}
              className="flex flex-1 justify-between items-center space-x-2 mt-4"
            >
              <span className="flex-1 text-start">{key}</span>

              <span className="flex-1 text-start">{value}</span>

              <MdClose
                className="cursor-pointer"
                color={accentColor}
                fontSize={22}
                onClick={() => handleRemoveHeader(key)}
              />
            </div>
          ))}

          {!headers.length && (
            <span className="text-gray-500 self-center mt-6 text-xl">
              {t('no_headers')}
            </span>
          )}
        </div>
      </Element>
    </Card>
  );
}
