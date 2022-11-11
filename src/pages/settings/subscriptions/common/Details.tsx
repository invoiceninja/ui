/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '@invoiceninja/cards';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, InputField } from '@invoiceninja/forms';
import { numberFormat } from 'common/helpers/number-format';
import { CopyToClipboard } from 'components/CopyToClipboard';
import { route } from 'common/helpers/route';
import { useQuery } from 'react-query';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';

export function SubscriptionDetails() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('subscriptions'), href: '/settings/subscriptions' },
    { name: t('subscription_details'), href: `/settings/subscriptions/${id}` },
  ];

  const { data: subscription } = useQuery(`/api/v1/subscriptions/${id}`, () =>
    request('GET', endpoint(`/api/v1/subscriptions/${id}`))
  );

  return (
    <Settings title={t('subscription_details')} breadcrumbs={pages}>
      <div className={'flex justify-end'}>
        <Button
          onClick={() =>
            navigate(
              route('/settings/subscriptions/:id/edit', {
                id: id,
              })
            )
          }
        >
          {t('edit')}
        </Button>
      </div>
      {subscription && (
        <Card>
          <Element leftSide={t('name')}>
            <InputField disabled value={subscription.data.data.name} />
          </Element>
          {subscription.data.data.price > 0 && (
            <Element leftSide={t('price')}>
              <InputField
                disabled
                value={numberFormat(subscription.data.data.price)}
              />
            </Element>
          )}
          <Element leftSide={t('purchase_page')}>
            <CopyToClipboard text={subscription.data.data.purchase_page} />
          </Element>
        </Card>
      )}
    </Settings>
  );
}
