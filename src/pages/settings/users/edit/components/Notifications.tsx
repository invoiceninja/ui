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
import { SelectField } from '$app/components/forms';
import { User } from '$app/common/interfaces/user';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';

interface Props {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

export function Notifications(props: Props) {
  const [t] = useTranslation();
  const { user, setUser } = props;

  const notifications = [
    { id: 'invoice_created', label: 'invoice_created' },
    { id: 'invoice_sent', label: 'invoice_sent_notification_label' },
    { id: 'invoice_viewed', label: 'invoice_viewed' },
    { id: 'invoice_late', label: 'invoice_late' },
    { id: 'payment_success', label: 'payment_success' },
    { id: 'payment_failure', label: 'payment_failure' },
    { id: 'purchase_order_created', label: 'purchase_order_created' },
    { id: 'purchase_order_sent', label: 'purchase_order_sent' },
    { id: 'purchase_order_viewed', label: 'purchase_order_viewed' },
    {
      id: 'purchase_order_accepted',
      label: 'purchase_order_accepted',
    },
    { id: 'quote_created', label: 'quote_created' },
    { id: 'quote_sent', label: 'quote_sent' },
    { id: 'quote_viewed', label: 'quote_viewed' },
    { id: 'quote_approved', label: 'quote_approved' },
    { id: 'quote_expired', label: 'quote_expired' },
    { id: 'credit_created', label: 'credit_created' },
    { id: 'credit_sent', label: 'credit_sent' },
    { id: 'credit_viewed', label: 'credit_viewed' },
  ];

  const defaultNotificationValue = () => {
    const notifications = user?.company_user?.notifications.email ?? [];

    if (notifications.includes('all_notifications')) {
      return 'all_notifications';
    }

    if (notifications.includes('all_user_notifications')) {
      return 'all_user_notifications';
    }

    return '';
  };

  const handleNotificationChange = (notification: string, value: string) => {
    const localUser = cloneDeep(user) as User;

    if (notification === 'all_events' && localUser.company_user) {
      value.length === 0
        ? (localUser.company_user.notifications.email = [])
        : (localUser.company_user.notifications.email = [value]);
    } else if (value.endsWith('none') && localUser.company_user) {
      // In case the notifications ends with "none", we just want
      // to wipe it from the notifications list.

      const filtered = localUser.company_user?.notifications.email.filter(
        (value) => !value.startsWith(notification)
      );

      localUser.company_user.notifications.email = filtered;
    } else {
      // Before we push new notification, we need to
      // make sure same notification with starter identifier
      // doesn't exist.

      const filtered =
        localUser.company_user?.notifications.email.filter(
          (value) => !value.startsWith(notification)
        ) || [];

      filtered?.push(value);

      if (localUser.company_user) {
        localUser.company_user.notifications.email = filtered;
      }
    }

    setUser({ ...localUser });
  };

  const notificationValue = (id: string) => {
    const notifications = user?.company_user?.notifications.email ?? [];

    if (notifications.includes('all_notifications')) {
      return `${id}_all`;
    }

    if (notifications.includes('all_user_notifications')) {
      return `${id}_user`;
    }

    if (notifications.includes(`${id}_all`)) {
      return `${id}_all`;
    }

    if (notifications.includes(`${id}_user`)) {
      return `${id}_user`;
    }

    return `${id}_none`;
  };

  const isNotificationSelectDisabled = () => {
    const notifications = user?.company_user?.notifications.email ?? [];

    if (
      notifications.includes('all_notifications') ||
      notifications.includes('all_user_notifications')
    ) {
      return true;
    }

    return false;
  };

  return (
    <Card title={t('notifications')}>
      <Element>{t('email')}</Element>

      <Element leftSide={t('all_events')}>
        <SelectField
          withBlank
          value={defaultNotificationValue()}
          onValueChange={(value) =>
            handleNotificationChange('all_events', value)
          }
        >
          <option value="all_notifications">{t('all_records')}</option>
          <option value="all_user_notifications">{t('owned_by_user')}</option>
          <option value="">{t('custom')}</option>
        </SelectField>
      </Element>

      {notifications.map((notification, index) => (
        <Element key={index} leftSide={t(notification.label)}>
          <SelectField
            value={notificationValue(notification.id)}
            disabled={isNotificationSelectDisabled()}
            onValueChange={(value) =>
              handleNotificationChange(notification.id, value)
            }
          >
            <option value={`${notification.id}_all`}>{t('all_records')}</option>
            <option value={`${notification.id}_user`}>
              {t('owned_by_user')}
            </option>
            <option value={`${notification.id}_none`}>{t('none')}</option>
          </SelectField>
        </Element>
      ))}
    </Card>
  );
}
