/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DocuninjaUserProps } from './Details';

export function Notifications({
  notifications,
  setNotifications,
  allNotificationsValue,
  setAllNotificationsValue,
  isFormBusy,
}: DocuninjaUserProps) {
  const [t] = useTranslation();

  const notificationTypes = useMemo(
    () => [
      {
        id: 'document_created',
        label: t('document_created_notification'),
      },
      {
        id: 'document_sent',
        label: t('document_sent_notification'),
      },
      {
        id: 'document_viewed',
        label: t('document_viewed_notification'),
      },
      {
        id: 'document_signed',
        label: t('document_signed_notification'),
      },
      {
        id: 'document_completed',
        label: t('document_completed_notification'),
      },
      {
        id: 'document_rejected',
        label: t('document_rejected_notification'),
      },
      {
        id: 'document_voided',
        label: t('document_voided_notification'),
      },
      {
        id: 'document_expired',
        label: t('document_expired_notification'),
      },
    ],
    []
  );

  const handlePreferenceChange = (id: string, value: string) => {
    if (!id || typeof id !== 'string') {
      console.warn('Invalid notification ID:', id);
      return;
    }

    if (!value || typeof value !== 'string') {
      console.warn('Invalid notification value:', value);
      return;
    }

    const newNotifications = { ...notifications };

    if (value === 'none') {
      console.log('none', id);
      delete newNotifications[id];
    } else {
      console.log('value', id, value);
      newNotifications[id] = value;
    }

    setNotifications(newNotifications);

  };

  return (
    <div className="flex flex-col">
      <Element leftSide={t('receive_all_notifications')}>
        <SelectField
          value={allNotificationsValue}
          onValueChange={(value) => {

            if (value === 'all' || value === 'all_user') {
              const newNotifications: Record<string, string> = {};

              for (const type of notificationTypes) {
                delete newNotifications[type.id];
              }
              setAllNotificationsValue(value);
              setNotifications(newNotifications);
            }
            else if(value === 'none'){
              
              const newNotifications: Record<string, string> = {};
              setNotifications(newNotifications);
              setAllNotificationsValue(value);
            }
            
          }}
          customSelector
          dismissable={false}
          disabled={isFormBusy}
        >
          <option value="custom">{t('custom')}</option>
          <option value="none">{t('none')}</option>
          <option value="all">{t('all')}</option>
          <option value="all_user">{t('owned_by_user')}</option>
        </SelectField>
      </Element>

      {notificationTypes.map((notification) => (
        <Element key={notification.id} leftSide={notification.label}>
          <SelectField
            value={notifications[notification.id] ?? 'none'}
            onValueChange={(value) => {
              handlePreferenceChange(notification.id, value);
              setAllNotificationsValue('custom');
            }}
            disabled={
              allNotificationsValue === 'all' ||
              allNotificationsValue === 'all_user' ||
              isFormBusy
            }
            customSelector
            dismissable={false}
          >
            <option value="none">{t('none')}</option>
            <option value="all">{t('all')}</option>
            <option value="all_user">{t('owned_by_user')}</option>
          </SelectField>
        </Element>
      ))}
    </div>
  );
}
