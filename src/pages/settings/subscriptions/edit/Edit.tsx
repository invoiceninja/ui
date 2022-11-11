/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Subscription } from 'common/interfaces/subscription';
import { WebhookConfiguration } from 'common/interfaces/webhook-configuration';
import { Settings } from 'components/layouts/Settings';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { CustomSettings } from '../edit/components/CustomSettings';
import { Overview } from '../edit/components/Overview';
import { Webhook } from '../edit/components/Webhook';

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { defaultHeaders } from 'common/queries/common/headers';
import { useNavigate, useParams } from 'react-router-dom';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { useQuery } from 'react-query';

export function Edit() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();
  const { data: response } = useQuery(`/api/v1/subscriptions/${id}`, () =>
    request('GET', endpoint(`/api/v1/subscriptions/${id}`))
  );
  const [subscription, setSubscription] = useState<Subscription>();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('subscriptions'), href: '/settings/subscriptions' },
    { name: t('subscription_details'), href: `/settings/subscriptions/${id}` },
    { name: t('edit'), href: `/settings/subscriptions/${id}/edit` },
  ];
  const [webhookConfig, setWebHookConfig] = useState<WebhookConfiguration>();
  const [productsIDs, setProductsIDs] = useState<string[]>();
  const [recurringProductsIDs, setRecurringProductsIDs] = useState<string[]>();
  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState(false);

  useEffect(() => {
    setSubscription(response?.data.data);
    setProductsIDs(
      response?.data.data.product_ids ? response?.data.data.product_ids.split(',') : undefined
    );

    setRecurringProductsIDs(
      response?.data.data.recurring_product_ids
        ? response?.data.data.recurring_product_ids.split(',')
        : undefined
    );
    setWebHookConfig(response?.data.data.webhook_configuration);
  }, [response]);

  const onSave = (password: string) => {
    const toastId = toast.loading(t('processing'));

    setIsPasswordConfirmModalOpen(false);

    request(
      'PUT',
      endpoint('/api/v1/subscriptions/:id', { id: id }),
      {
        ...subscription,
        webhook_configuration: webhookConfig,
        product_ids: productsIDs?.join(',') || '',
        recurring_product_ids: recurringProductsIDs?.join(',') || '',
      },
      {
        headers: { 'X-Api-Password': password, ...defaultHeaders() },
      }
    )
      .then((response) => {
        toast.success(t('updated_subscription'), { id: toastId });

        navigate(
          route('/settings/subscriptions/', {
            id: response.data.data.id,
          })
        );
      })
      .catch((error) => {
        console.error(error);

        error.response?.status === 412
          ? toast.error(t('password_error_incorrect'), { id: toastId })
          : toast.error(t('error_title'), { id: toastId });
      });
  };
  return (
    <Settings
      title={t('edit_subscription')}
      breadcrumbs={pages}
      onSaveClick={onSave}
    >
      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onSave={onSave}
        onClose={setIsPasswordConfirmModalOpen}
      />
      {subscription && (
        <Overview
          subscription={subscription}
          setSubscription={setSubscription}
          productsIDs={productsIDs}
          setProductsIDs={setProductsIDs}
          recurringProductsIDs={recurringProductsIDs}
          setRecurringProductsIDs={setRecurringProductsIDs}
        />
      )}
      {subscription && webhookConfig && (
        <CustomSettings
          subscription={subscription}
          setSubscription={setSubscription}
          webhookConfig={webhookConfig}
          setWebhookConfig={setWebHookConfig}
        />
      )}
      {webhookConfig && (
        <Webhook
          webhookConfig={webhookConfig}
          setWebhookConfig={setWebHookConfig}
        />
      )}
    </Settings>
  );
}
