/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { User, Permission as PermissionType } from '$app/common/interfaces/docuninja/api';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { NotificationValue } from '../constants/notifications';

export interface UserEditContextValue {
  user: User | undefined;
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
  editPage?: boolean;
}

const UserEditContext = createContext<UserEditContextValue | undefined>(undefined);

export interface UserEditProviderProps {
  children: ReactNode;
  value: UserEditContextValue;
}

export function UserEditProvider({ children, value }: UserEditProviderProps) {
  return (
    <UserEditContext.Provider value={value}>
      {children}
    </UserEditContext.Provider>
  );
}

export function useUserEditContext(): UserEditContextValue {
  const context = useContext(UserEditContext);
  if (context === undefined) {
    throw new Error('useUserEditContext must be used within a UserEditProvider');
  }
  return context;
}

