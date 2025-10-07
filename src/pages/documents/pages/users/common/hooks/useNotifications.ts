/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState, useEffect, useCallback } from 'react';
import { User } from '$app/common/interfaces/docuninja/api';
import { NOTIFICATION_VALUES, NotificationValue } from '../constants/notifications';

export interface UseNotificationsReturn {
  notifications: Record<string, string>;
  setNotifications: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  allNotificationsValue: NotificationValue;
  setAllNotificationsValue: React.Dispatch<React.SetStateAction<NotificationValue>>;
  adjustNotificationsForPayload: () => string[];
  initializeNotifications: (user: User) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Record<string, string>>({});
  const [allNotificationsValue, setAllNotificationsValue] = useState<NotificationValue>(
    NOTIFICATION_VALUES.NONE
  );

  const initializeNotifications = useCallback((user: User) => {
    if (!user?.company_user?.notifications) {
      setAllNotificationsValue(NOTIFICATION_VALUES.NONE);
      setNotifications({});
      return;
    }

    const userNotifications = user.company_user.notifications;
    
    // Determine the overall notification setting
    let overallValue: NotificationValue;
    if (userNotifications.includes('all')) {
      overallValue = NOTIFICATION_VALUES.ALL;
    } else if (userNotifications.includes('all_user')) {
      overallValue = NOTIFICATION_VALUES.ALL_USER;
    } else if (userNotifications.length >= 1) {
      overallValue = NOTIFICATION_VALUES.CUSTOM;
    } else {
      overallValue = NOTIFICATION_VALUES.NONE;
    }

    setAllNotificationsValue(overallValue);

    // Initialize individual notifications for custom mode
    if (overallValue === NOTIFICATION_VALUES.CUSTOM) {
      const initialNotifications: Record<string, string> = {};
      
      for (const notificationId of userNotifications) {
        const id = String(notificationId);
        if (id.endsWith('_user')) {
          const baseId = id.replace('_user', '');
          initialNotifications[baseId] = NOTIFICATION_VALUES.ALL_USER;
        } else {
          initialNotifications[id] = NOTIFICATION_VALUES.ALL;
        }
      }
      
      setNotifications(initialNotifications);
    } else {
      setNotifications({});
    }
  }, []);

  const adjustNotificationsForPayload = useCallback((): string[] => {
    if (allNotificationsValue === NOTIFICATION_VALUES.ALL || 
        allNotificationsValue === NOTIFICATION_VALUES.ALL_USER) {
      return [allNotificationsValue];
    }
    
    if (allNotificationsValue === NOTIFICATION_VALUES.NONE) {
      return [];
    }

    // Custom mode - process individual notifications
    return Object.entries(notifications)
      .filter(([id, value]) => {
        if (!value || value === NOTIFICATION_VALUES.NONE) return false;
        return typeof id === 'string' && id.length > 0;
      })
      .map(([id, value]) => {
        if (value === NOTIFICATION_VALUES.ALL) {
          return id;
        }
        if (value === NOTIFICATION_VALUES.ALL_USER) {
          return `${id}_user`;
        }
        return id;
      });
  }, [allNotificationsValue, notifications]);

  return {
    notifications,
    setNotifications,
    allNotificationsValue,
    setAllNotificationsValue,
    adjustNotificationsForPayload,
    initializeNotifications,
  };
}

