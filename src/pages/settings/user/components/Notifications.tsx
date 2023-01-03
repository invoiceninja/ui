/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from 'common/helpers';
import { injectInChangesWithData } from 'common/stores/slices/user';
import { RootState } from 'common/stores/store';
import { cloneDeep, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';

export function Notifications() {
  const [t] = useTranslation();
  const userChanges = useSelector((state: RootState) => state.user.changes);
  const dispatch = useDispatch();

  const [isGlobalChecked, setIsGlobalChecked] = useState({
    initial: true,
    value: false,
  });

  const handleGlobalToggleChange = () => {
    const user = cloneDeep(userChanges);

    let notifications: string[] = [];

    isGlobalChecked.value ? (notifications = ['all_notifications']) : [];

    set(user, 'company_user.notifications.email', notifications);

    dispatch(injectInChangesWithData(user));
  };

  const handleToggleChange = (field: string, value: boolean) => {
    const user = cloneDeep(userChanges);

    let notifications: string[] = user.company_user.notifications.email ?? [];

    value
      ? notifications.push(field)
      : (notifications = notifications.filter(
          (element: string) => element !== field
        ));

    set(user, 'company_user.notifications.email', notifications);

    dispatch(injectInChangesWithData(user));
  };

  useEffect(() => {
    userChanges?.company_user?.notifications?.email?.includes(
      'all_notifications'
    )
      ? setIsGlobalChecked({ initial: true, value: true })
      : setIsGlobalChecked({ initial: true, value: false });
  }, [userChanges]);

  useEffect(() => {
    if (!isGlobalChecked.initial) {
      handleGlobalToggleChange();
    }
  }, [isGlobalChecked]);

  const options: { label: string; field: string }[] = [
    { label: t('invoice_created'), field: 'invoice_created_all' },
    {
      label: trans('invoice_sent', { count: '' }),
      field: 'invoice_sent_all',
    },
    { label: t('invoice_viewed'), field: 'invoice_viewed_all' },
    { label: t('invoice_late'), field: 'invoice_late_all' },

    { label: t('payment_success'), field: 'payment_success_all' },
    { label: t('payment_failure'), field: 'payment_failure_all' },

    { label: t('purchase_order_created'), field: 'purchase_order_created_all' },
    { label: t('purchase_order_sent'), field: 'purchase_order_sent_all' },
    { label: t('purchase_order_viewed'), field: 'purchase_order_viewed_all' },
    {
      label: t('purchase_order_accepted'),
      field: 'purchase_order_accepted_all',
    },

    { label: t('quote_created'), field: 'quote_created_all' },
    { label: t('quote_sent'), field: 'quote_sent_all' },
    { label: t('quote_viewed'), field: 'quote_viewed_all' },
    { label: t('quote_approved'), field: 'quote_approved_all' },
    { label: t('quote_expired'), field: 'quote_expired_all' },

    { label: t('credit_created'), field: 'credit_created_all' },
    { label: t('credit_sent'), field: 'credit_sent_all' },
    { label: t('credit_viewed'), field: 'credit_viewed_all' },
  ];

  return (
    <Card title={t('notifications')}>
      <Element leftSide={t('all_events')}>
        <Toggle
          checked={isGlobalChecked.value}
          onChange={(value: boolean) =>
            setIsGlobalChecked({ initial: false, value })
          }
        />
      </Element>

      <div className="pt-6 border-b"></div>

      {options.map((notification, index) => (
        <Element key={index} className="mt-0" leftSide={notification.label}>
          <Toggle
            checked={
              userChanges?.company_user?.notifications?.email?.includes(
                notification.field
              ) || isGlobalChecked.value
            }
            onChange={(value: boolean) =>
              handleToggleChange(notification.field, value)
            }
            disabled={isGlobalChecked.value}
          />
        </Element>
      ))}
    </Card>
  );
}
