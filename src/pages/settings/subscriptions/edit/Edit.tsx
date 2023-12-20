/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { Product } from '$app/common/interfaces/product';
import { Subscription } from '$app/common/interfaces/subscription';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useProductsQuery } from '$app/common/queries/products';
import { Settings } from '$app/components/layouts/Settings';
import { TabGroup } from '$app/components/TabGroup';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Overview } from '../common/components/Overview';
import { Settings as SubscriptionSettings } from '../common/components/Settings';
import { Webhook } from '../common/components/Webhook';
import { useHandleChange } from '../common/hooks/useHandleChange';
import { useSubscriptionQuery } from '$app/common/queries/subscriptions';
import { useTitle } from '$app/common/hooks/useTitle';
import { $refetch } from '$app/common/hooks/useRefetch';

export function Edit() {
  const { documentTitle } = useTitle('edit_payment_link');

  const [t] = useTranslation();

  const navigate = useNavigate();

  const { id } = useParams();

  const { data } = useSubscriptionQuery({ id });

  const { data: productsData } = useProductsQuery({ status: ['active'] });

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('payment_links'), href: '/settings/subscriptions' },
    {
      name: t('edit_payment_link'),
      href: route('/settings/subscriptions/:id/edit', { id }),
    },
  ];

  const showPlanAlert = useShouldDisableAdvanceSettings();

  const tabs = [t('overview'), t('settings'), t('webhook')];

  const [subscription, setSubscription] = useState<Subscription>();

  const [products, setProducts] = useState<Product[]>();

  const [errors, setErrors] = useState<ValidationBag>();

  const handleChange = useHandleChange({
    setErrors,
    setSubscription,
    subscription,
  });

  useEffect(() => {
    if (data) {
      const {
        post_purchase_headers,
        post_purchase_body,
        post_purchase_rest_method,
        post_purchase_url,
        return_url,
      } = data.webhook_configuration;

      setSubscription({
        ...data,
        webhook_configuration: {
          ...data.webhook_configuration,
          post_purchase_headers: Array.isArray(post_purchase_headers)
            ? {}
            : post_purchase_headers,
          post_purchase_body: post_purchase_body || '',
          post_purchase_rest_method: post_purchase_rest_method || '',
          post_purchase_url: post_purchase_url || '',
          return_url: return_url || '',
        },
      });
    }
  }, [data]);

  useEffect(() => {
    if (productsData) {
      setProducts(productsData);
    }
  }, [productsData]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors(undefined);

    toast.processing();

    request('PUT', endpoint('/api/v1/subscriptions/:id', { id }), subscription)
      .then(() => {
        toast.success('updated_subscription');

        $refetch(['subscriptions']);

        navigate('/settings/subscriptions');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      });
  };

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={handleSave}
      disableSaveButton={!subscription || showPlanAlert}
    >
      <TabGroup tabs={tabs}>
        <div>
          {subscription && (
            <Overview
              subscription={subscription}
              handleChange={handleChange}
              errors={errors}
              products={products}
            />
          )}
        </div>

        <div>
          {subscription && (
            <SubscriptionSettings
              subscription={subscription}
              handleChange={handleChange}
              errors={errors}
            />
          )}
        </div>

        <div>
          {subscription && (
            <Webhook
              subscription={subscription}
              handleChange={handleChange}
              errors={errors}
            />
          )}
        </div>
      </TabGroup>
    </Settings>
  );
}
