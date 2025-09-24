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
import { Element } from '../../../../components/cards';
import { SelectField } from '$app/components/forms';
import { useNotificationOptions } from '../common/hooks/useNotificationOptions';
import { Divider } from '$app/components/cards/Divider';
import Toggle from '$app/components/forms/Toggle';
import { useHandleCurrentUserChangeProperty } from '$app/common/hooks/useHandleCurrentUserChange';
import { useColorScheme } from '$app/common/colors';

export function Notifications() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const colors = useColorScheme();
  const options = useNotificationOptions();

  const userChanges = useSelector((state: RootState) => state.user.changes);

  const handleChange = useHandleCurrentUserChangeProperty();

  const [allEvents, setAllEvents] = useState<string>('');

  const handleAllEventsChange = (allEventsValue: string) => {
    setAllEvents(allEventsValue);

    const user = cloneDeep(userChanges);

    let updatedAllEvents = allEventsValue === 'custom' ? [] : [allEventsValue];

    const isTaskAssignedNotificationIncluded =
      user?.company_user?.notifications?.email?.find(
        (key: string) => key === 'task_assigned'
      );

    if (isTaskAssignedNotificationIncluded) {
      updatedAllEvents = [...updatedAllEvents, 'task_assigned'];
    }

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

  const handleTaskAssignedNotificationChange = (value: boolean) => {
    const emailNotifications = userChanges?.company_user?.notifications?.email;

    let updatedNotifications: string[] = [...emailNotifications];

    if (!value) {
      updatedNotifications = updatedNotifications.filter(
        (notificationKey) => notificationKey !== 'task_assigned'
      );
    } else {
      const isAlreadyAdded = updatedNotifications.find(
        (notificationKey) => notificationKey === 'task_assigned'
      );

      if (!isAlreadyAdded) {
        updatedNotifications = [...updatedNotifications, 'task_assigned'];
      }
    }

    const user = cloneDeep(userChanges);

    set(user, 'company_user.notifications.email', updatedNotifications);

    dispatch(injectInChangesWithData(user));
  };


  const handleDisableRecurringPaymentNotificationChange = (value: boolean) => {
    const emailNotifications = userChanges?.company_user?.notifications?.email;

    let updatedNotifications: string[] = [...emailNotifications];

    if (!value) {
      updatedNotifications = updatedNotifications.filter(
        (notificationKey) => notificationKey !== 'disable_recurring_payment_notification'
      );
    } else {
      const isAlreadyAdded = updatedNotifications.find(
        (notificationKey) => notificationKey === 'disable_recurring_payment_notification'
      );

      if (!isAlreadyAdded) {
        updatedNotifications = [...updatedNotifications, 'disable_recurring_payment_notification'];
      }
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
    <>
      <Element
        leftSide={t('login_notification')}
        leftSideHelp={t('login_notification_help')}
      >
        <Toggle
          checked={userChanges?.user_logged_in_notification}
          onChange={(value) =>
            handleChange('user_logged_in_notification', value)
          }
        />
      </Element>

      <Element
        className="mb-4"
        leftSide={t('task_assigned_notification')}
        leftSideHelp={t('task_assigned_notification_help')}
      >
        <Toggle
          checked={Boolean(
            userChanges?.company_user?.notifications?.email?.find(
              (key: string) => key === 'task_assigned'
            )
          )}
            onChange={(value) => handleTaskAssignedNotificationChange(value)}
        />
      </Element>

      <Element
        className="mb-4"
        leftSide={t('disable_recurring_payment_notification')}
        leftSideHelp={t('disable_recurring_payment_notification_help')}
      >
        <Toggle
          checked={userChanges?.company_user?.notifications?.email?.find(
            (key: string) => key === 'disable_recurring_payment_notification'
          )}
          onChange={(value) =>
            handleDisableRecurringPaymentNotificationChange(value)
          }
        />
      </Element>

      <div className="px-4 sm:px-6">
        <Divider
          className="border-dashed"
          withoutPadding
          borderColor={colors.$20}
        />
      </div>

      <Element className="my-4" leftSide={t('all_events')}>
        <SelectField
          value={allEvents}
          onValueChange={(value) => handleAllEventsChange(value)}
          customSelector
          dismissable={false}
        >
          <option value="all_notifications">{t('all_records')}</option>
          <option value="all_user_notifications">{t('owned_by_user')}</option>
          <option value="custom">{t('custom')}</option>
        </SelectField>
      </Element>

      <div className="px-4 sm:px-6">
        <Divider
          className="mb-4 border-dashed"
          withoutPadding
          borderColor={colors.$20}
        />
      </div>

      <div className="flex flex-col">
        {options.map((notification, index) => (
          <Element key={index} className="mt-0" leftSide={notification.label}>
            <SelectField
              value={getNotificationValueByKey(notification.key)}
              onValueChange={(value) =>
                handleNotificationChange(notification.key, value)
              }
              disabled={Boolean(allEvents) && allEvents !== 'custom'}
              customSelector
              dismissable={false}
            >
              <option value={`${notification.key}_all`}>
                {t('all_records')}
              </option>
              <option value={`${notification.key}_user`}>
                {t('owned_by_user')}
              </option>
              <option value="none">{t('none')}</option>
            </SelectField>
          </Element>
        ))}
      </div>
    </>
  );
}
