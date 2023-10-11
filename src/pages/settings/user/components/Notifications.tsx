/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { injectInChangesWithData } from '$app/common/stores/slices/user';
import { RootState } from '$app/common/stores/store';
import { cloneDeep, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { SelectField } from '$app/components/forms';
import { useNotificationOptions } from '../common/hooks/useNotificationOptions';
import { SearchableSelect } from '$app/components/SearchableSelect';

export function Notifications() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const options = useNotificationOptions();

  const userChanges = useSelector((state: RootState) => state.user.changes);

  const [allEvents, setAllEvents] = useState<string>('');

  const handleAllEventsChange = (allEventsValue: string) => {
    setAllEvents(allEventsValue);

    const user = cloneDeep(userChanges);

    const updatedAllEvents =
      allEventsValue === 'custom' ? [] : [allEventsValue];

    set(user, 'company_user.notifications.email', updatedAllEvents);

    dispatch(injectInChangesWithData(user));
  };

  const getNotificationValueByKey = (notificationKey: string) => {
    if (allEvents === 'all_notifications') {
      return `${notificationKey}_all`;
    }

    if (allEvents === 'all_user_notifications') {
      return `${notificationKey}_user`;
    }

    return (
      userChanges?.company_user?.notifications?.email?.find((key: string) =>
        key.startsWith(notificationKey)
      ) || 'none'
    );
  };

  const handleNotificationChange = (notificationKey: string, value: string) => {
    const emailNotifications = userChanges?.company_user?.notifications?.email;
    const notificationIndex = emailNotifications.findIndex((key: string) =>
      key.startsWith(notificationKey)
    );

    let updatedNotifications: string[] = [...emailNotifications];

    if (notificationIndex > -1) {
      if (value !== 'none') {
        updatedNotifications = emailNotifications.map(
          (key: string, index: number) =>
            notificationIndex === index ? value : key
        );
      } else {
        updatedNotifications = emailNotifications.filter(
          (key: string, index: number) => notificationIndex !== index
        );
      }
    } else {
      updatedNotifications = [...updatedNotifications, value];
    }

    const user = cloneDeep(userChanges);

    set(user, 'company_user.notifications.email', updatedNotifications);

    dispatch(injectInChangesWithData(user));
  };

  useEffect(() => {
    const emailNotifications = userChanges?.company_user?.notifications?.email;

    if (emailNotifications && !allEvents) {
      if (
        emailNotifications.includes('all_notifications') ||
        emailNotifications.includes('all_user_notifications')
      ) {
        setAllEvents(emailNotifications[0]);
      } else {
        setAllEvents('custom');
      }
    }
  }, [userChanges]);

  return (
    <Card title={t('notifications')}>
      <Element className="mb-4" leftSide={t('all_events')}>
        <SearchableSelect
          value={allEvents}
          onValueChange={(value) => handleAllEventsChange(value)}
        >
          <option value="all_notifications">{t('all_records')}</option>
          <option value="all_user_notifications">{t('owned_by_user')}</option>
          <option value="custom">{t('custom')}</option>
        </SearchableSelect >
      </Element>

      <div className="flex flex-col border-t border-gray-200 pt-4">
        {options.map((notification, index) => (
          <Element key={index} className="mt-0" leftSide={notification.label}>
            <SearchableSelect
              value={getNotificationValueByKey(notification.key)}
              onValueChange={(value) =>
                handleNotificationChange(notification.key, value)
              }
              disabled={Boolean(allEvents) && allEvents !== 'custom'}
            >
              <option value={`${notification.key}_all`}>
                {t('all_records')}
              </option>
              <option value={`${notification.key}_user`}>
                {t('owned_by_user')}
              </option>
              <option value="none">{t('none')}</option>
            </SearchableSelect>
          </Element>
        ))}
      </div>
    </Card>
  );
}
