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
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NOTIFICATION_TYPES, NOTIFICATION_VALUES } from '../constants/notifications';
import { useUserEditContext } from '../contexts/UserEditContext';
import { User, Permission as PermissionType } from '$app/common/interfaces/docuninja/api';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { NotificationValue } from '../constants/notifications';

// Legacy props interface for backward compatibility
export interface DocuninjaUserProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  errors: ValidationBag | undefined;
  isFormBusy: boolean;
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  permissions: PermissionType[];
  setPermissions: React.Dispatch<React.SetStateAction<PermissionType[]>>;
  notifications: Record<string, string>;
  setNotifications: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  allNotificationsValue: NotificationValue;
  setAllNotificationsValue: React.Dispatch<React.SetStateAction<NotificationValue>>;
}

// Overloaded function signatures for better TypeScript support
export function Notifications(): JSX.Element;
export function Notifications(props: DocuninjaUserProps): JSX.Element;
export function Notifications(props?: DocuninjaUserProps) {
  const [t] = useTranslation();
  
  // Try to use context first, fall back to props for backward compatibility
  let contextData;
  try {
    contextData = useUserEditContext();
  } catch {
    contextData = null;
  }

  const data = contextData || props;
  
  if (!data) {
    return null; // Early return if no data available
  }

  const { 
    notifications, 
    setNotifications, 
    allNotificationsValue, 
    setAllNotificationsValue, 
    isFormBusy 
  } = data;

  const notificationTypes = useMemo(
    () => NOTIFICATION_TYPES.map(type => ({
      id: type.id,
      label: t(type.labelKey),
    })),
    [t]
  );

  const handlePreferenceChange = (id: string, value: string) => {
    if (!id || typeof id !== 'string') {
      return;
    }

    if (!value || typeof value !== 'string') {
      return;
    }

    const newNotifications = { ...notifications };

    if (value === NOTIFICATION_VALUES.NONE) {
      delete newNotifications[id];
    } else {
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
            if (value === NOTIFICATION_VALUES.ALL || value === NOTIFICATION_VALUES.ALL_USER) {
              const newNotifications: Record<string, string> = {};
              setAllNotificationsValue(value);
              setNotifications(newNotifications);
            } else if (value === NOTIFICATION_VALUES.NONE) {
              const newNotifications: Record<string, string> = {};
              setNotifications(newNotifications);
              setAllNotificationsValue(value);
            }
          }}
          customSelector
          dismissable={false}
          disabled={isFormBusy}
        >
          <option value={NOTIFICATION_VALUES.CUSTOM}>{t('custom')}</option>
          <option value={NOTIFICATION_VALUES.NONE}>{t('none')}</option>
          <option value={NOTIFICATION_VALUES.ALL}>{t('all')}</option>
          <option value={NOTIFICATION_VALUES.ALL_USER}>{t('owned_by_user')}</option>
        </SelectField>
      </Element>

      {notificationTypes.map((notification) => (
        <Element key={notification.id} leftSide={notification.label}>
          <SelectField
            value={notifications[notification.id] ?? NOTIFICATION_VALUES.NONE}
            onValueChange={(value) => {
              handlePreferenceChange(notification.id, value);
              setAllNotificationsValue(NOTIFICATION_VALUES.CUSTOM);
            }}
            disabled={
              allNotificationsValue === NOTIFICATION_VALUES.ALL ||
              allNotificationsValue === NOTIFICATION_VALUES.ALL_USER ||
              isFormBusy
            }
            customSelector
            dismissable={false}
          >
            <option value={NOTIFICATION_VALUES.NONE}>{t('none')}</option>
            <option value={NOTIFICATION_VALUES.ALL}>{t('all')}</option>
            <option value={NOTIFICATION_VALUES.ALL_USER}>{t('owned_by_user')}</option>
          </SelectField>
        </Element>
      ))}
    </div>
  );
}
