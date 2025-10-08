/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '$app/components/forms';
import { Checkbox } from '$app/components/forms';
import { Element } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import { User as InvoiceNinjaUser } from '$app/common/interfaces/user';
import { User as DocuNinjaUser } from '$app/common/interfaces/docuninja/api';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useUsersForDocuNinjaQuery } from '$app/common/queries/users';
import { useUsersQuery as useDocuNinjaUsersQuery } from '$app/common/queries/docuninja/users';
import { Permission as PermissionType } from '$app/common/interfaces/docuninja/api';
import { Default } from '$app/components/layouts/Default';
import { useTitle } from '$app/common/hooks/useTitle';
import Permissions from './common/components/Permissions';
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';

interface UserWithDocuNinjaStatus extends InvoiceNinjaUser {
  hasDocuNinjaAccess: boolean;
  docuNinjaUser?: DocuNinjaUser;
}

export default function UserSelection() {
  useTitle('grant_docuninja_access');
  const [t] = useTranslation();
  const navigate = useNavigate();
  const colors = useColorScheme();

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [usersWithStatus, setUsersWithStatus] = useState<UserWithDocuNinjaStatus[]>([]);

  // Fetch Invoice Ninja users
  const { data: invoiceNinjaUsers, isLoading: isLoadingInvoiceUsers } = useUsersForDocuNinjaQuery();
  
  // Fetch DocuNinja users to check status
  const { data: docuNinjaUsers } = useDocuNinjaUsersQuery({ 
    perPage: '100', 
    currentPage: '1', 
    filter: '' 
  });

  // Get DocuNinja account details for quota checking (NO QUERY!)
  const [docuData] = useAtom(docuNinjaAtom);
  const docuAccount = docuData;

  // Combine users with DocuNinja status
  useEffect(() => {
    if (invoiceNinjaUsers?.data?.data && docuNinjaUsers?.data?.data) {
      const invoiceUsers = invoiceNinjaUsers.data.data;
      const docuUsers = docuNinjaUsers.data.data;
      
      
      const usersWithStatus: UserWithDocuNinjaStatus[] = invoiceUsers
        .map((user: InvoiceNinjaUser) => {
          // Use email as the primary matching criteria since it's unique
          const docuUser = docuUsers.find((du: DocuNinjaUser) => 
            du.email === user.email
          );
          
          
          return {
            ...user,
            hasDocuNinjaAccess: !!docuUser,
            docuNinjaUser: docuUser,
          };
        });
      
      setUsersWithStatus(usersWithStatus);
    }
  }, [invoiceNinjaUsers, docuNinjaUsers]);

  const handleUserSelection = (userId: string, checked: boolean) => {
    
    setSelectedUserIds(prev => {
      const isCurrentlySelected = prev.includes(userId);
      
      if (checked && !isCurrentlySelected) {
        // Add user if checked and not already selected
        const newIds = [...prev, userId];
        return newIds;
      } else if (!checked && isCurrentlySelected) {
        // Remove user if unchecked and currently selected
        const newIds = prev.filter(id => id !== userId);
        return newIds;
      } else {
        // No change needed
        return prev;
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const availableUserIds = usersWithStatus
        .filter(user => !user.hasDocuNinjaAccess)
        .map(user => user.id);
      setSelectedUserIds(availableUserIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleGrantAccess = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIsFormBusy(true);
    toast.processing();

    try {
      // Filter to only get users that are actually selected and don't have access
      const selectedUsers = usersWithStatus.filter(user => 
        selectedUserIds.includes(user.id) && !user.hasDocuNinjaAccess
      );


      // Remove duplicates by using a Set
      const uniqueSelectedUsers = selectedUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );


      // Create DocuNinja users for selected Invoice Ninja users
      const promises = uniqueSelectedUsers.map(user => {
        const payload = {
          id: user.id, // Pass the Invoice Ninja user ID
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          is_admin: isAdmin,
          permissions: isAdmin ? [] : permissions,
          notifications: [],
        };
        
        
        return request(
          'POST',
          endpoint('/api/docuninja/create_user'),
          payload,
          { skipIntercept: true }
        );
      });

      await Promise.all(promises);
      
      toast.success('DocuNinja access granted successfully');
      
      // Refetch both DocuNinja users and Invoice Ninja users to update status
      $refetch(['docuninja_users']);
      $refetch(['users']);
      
      // Navigate back to users page
      navigate('/documents/users');
      
    } catch (error: any) {
      console.error('Error granting DocuNinja access:', error);
      toast.error('Failed to grant DocuNinja access');
    } finally {
      setIsFormBusy(false);
    }
  };

  // Only show users that don't have DocuNinja access
  const availableUsers = usersWithStatus.filter(user => !user.hasDocuNinjaAccess);
  const allAvailableSelected = availableUsers.length > 0 && 
    availableUsers.every(user => selectedUserIds.includes(user.id));

  // Check DocuNinja quotas and available users
  const currentDocuNinjaUserCount = docuNinjaUsers?.data?.meta?.total || 0;
  const maxDocuNinjaUsers = docuAccount?.num_users || 0;
  const hasAvailableQuota = currentDocuNinjaUserCount < maxDocuNinjaUsers;
  const hasNoAvailableUsers = availableUsers.length === 0;
  const hasQuotaButNoUsers = hasAvailableQuota && hasNoAvailableUsers;



  const pages = [
    {
      name: t('documents'),
      href: '/documents',
    },
    {
      name: t('users'),
      href: '/documents/users',
    },
    {
      name: t('add_user'),
      href: '/documents/users/selection',
    },
  ];

  return (
    <Default title={t('docuninja')} breadcrumbs={pages}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('docuninja')}</h1>
            <p className="text-gray-600 mt-1">
              {t('docuninja_grant_access_help')}
            </p>
          </div>
          
        </div>

        {/* User Selection */}
        <div>
          <h2 className="text-lg font-medium mb-4">{t('users')}</h2>
          
          {isLoadingInvoiceUsers ? (
            <div className="text-center py-8">
              <div className="text-gray-500">{t('loading')}...</div>
            </div>
          ) : hasQuotaButNoUsers ? (
            <div className="text-center py-8">
              
              <div className="text-sm text-gray-400 mb-4">
                {t('docuninja_quota_available_but_no_users')}
              </div>
              <div className="text-sm text-gray-400 mb-4">
                {t('users')}: {currentDocuNinjaUserCount} / {maxDocuNinjaUsers}
              </div>
              <div className="text-sm text-blue-500">
                <Link to="/settings/users/create">{t('add_user')}</Link>
              </div>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">{t('max_users_reached')}</div>
              <div className="text-center py-4 space-x-2">
                <span>{t('user_limit_reached')}</span>
                <span className="text-blue-500">
                <Link to="/settings/account_management">{t('upgrade')}</Link>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All */}
              <Element>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={allAvailableSelected}
                    onValueChange={() => {
                      // Toggle the select all state
                      const newCheckedState = !allAvailableSelected;
                      handleSelectAll(newCheckedState);
                    }}
                    disabled={availableUsers.length === 0 || isFormBusy}
                  />
                  <span className="font-medium">
                    {t('all')} ({availableUsers.length} {t('users')})
                  </span>
                </div>
              </Element>

              {/* User List */}
              <div className="grid gap-3">
                {availableUsers.map((user) => (
                  <Element key={user.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedUserIds.includes(user.id)}
                          onValueChange={() => {
                            // Toggle the current selection state
                            const isCurrentlySelected = selectedUserIds.includes(user.id);
                            const newCheckedState = !isCurrentlySelected;
                            handleUserSelection(user.id, newCheckedState);
                          }}
                          disabled={isFormBusy}
                        />
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {t('available')}
                      </div>
                    </div>
                  </Element>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Permissions */}
        {selectedUserIds.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-4">{t('permissions')}</h2>
            <div className="border rounded-lg p-6 bg-gray-50">
              <Permissions
                user={{ 
                  company_user: { is_admin: isAdmin },
                  permissions: permissions 
                } as any}
                setUser={() => {}} // Not needed for this use case
                errors={undefined}
                isFormBusy={isFormBusy}
                permissions={permissions}
                setPermissions={setPermissions}
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
                notifications={{}}
                setNotifications={() => {}}
                allNotificationsValue="none"
                setAllNotificationsValue={() => {}}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end items-end pt-6 border-t">
          
          <div className="flex space-x-3">
            <Button
              type="secondary"
              onClick={() => navigate('/documents/users')}
              disabled={isFormBusy}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleGrantAccess}
              disabled={selectedUserIds.length === 0 || isFormBusy}
            >
              {isFormBusy ? t('processing') : t('add')}
            </Button>
          </div>
        </div>
      </div>
    </Default>
  );
}
