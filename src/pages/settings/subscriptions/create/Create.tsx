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
import { Settings } from 'components/layouts/Settings';
import { TabGroup } from 'components/TabGroup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Overview } from '../common/components/Overview';
import { Settings as SubscriptionSettings } from '../common/components/Settings';
import { Webhook } from '../common/components/Webhook';
import { useBlankSubscriptionQuery } from '../common/hooks/useBlankSubscriptionQuery';
import { useHandleChange } from '../common/hooks/useHandleChange';

export function Create() {
  const [t] = useTranslation();

  const { data } = useBlankSubscriptionQuery();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('subscriptions'), href: '/settings/subscriptions' },
    { name: t('new_subscription'), href: '/settings/subscriptions/create' },
  ];

  const tabs = [t('overview'), t('settings'), t('webhook')];

  const [subscription, setSubscription] = useState<Subscription>();

  const handleChange = useHandleChange();

  useEffect(() => {
    if (data) {
      setSubscription(data);
    }
  }, [data]);

  console.log(data);

  return (
    <Settings
      title={t('new_subscription')}
      breadcrumbs={pages}
      //onSaveClick={() => setIsPasswordConfirmModalOpen(true)}
    >
      <TabGroup tabs={tabs}>
        <div>
          <Overview subscription={subscription} handleChange={handleChange} />
        </div>

        <div>
          <SubscriptionSettings />
        </div>

        <div>
          <Webhook />
        </div>
      </TabGroup>
    </Settings>
  );
}
