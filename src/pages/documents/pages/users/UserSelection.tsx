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
import { Checkbox } from '$app/components/forms';
import { Card, Element } from '$app/components/cards';
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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';

interface UserWithDocuNinjaStatus extends InvoiceNinjaUser {
  hasDocuNinjaAccess: boolean;
  docuNinjaUser?: DocuNinjaUser;
}

export default function UserSelection() {
  useTitle('grant_docuninja_access');
  const [t] = useTranslation();
  const navigate = useNavigate();

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [usersWithStatus, setUsersWithStatus] = useState<UserWithDocuNinjaStatus[]>([]);

  // Fetch Invoice Ninja users
  const { data: invoiceNinjaUsers, isLoading: isLoadingInvoiceUsers } = useUsersForDocuNinjaQuery();

  const company = useCurrentCompany();  
  // Get DocuNinja account details for quota checking (NO QUERY!)
  const [docuData] = useAtom(docuNinjaAtom);
  const docuAccount = docuData?.account;

  const { data: docuNinjaUsers } = useDocuNinjaUsersQuery({ 
    perPage: '10000', 
    currentPage: '1', 
    ninjaCompanyKey: company.company_key
  });

  // Combine users with DocuNinja status
  useEffect(() => {
    if (invoiceNinjaUsers?.data?.data && docuNinjaUsers) {
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
      toast.error(t('please_select_at_least_one_user') as string);
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
      
      toast.success(t('docuninja_access_granted_successfully') as string);
      
      // Refetch both DocuNinja users and Invoice Ninja users to update status
      $refetch(['docuninja_users']);
      $refetch(['users']);
      
      // Navigate back to users page
      navigate('/docuninja/users');
      
    } catch (error: any) {
      console.error('Error granting DocuNinja access:', error);
      toast.error(t('docuninja_access_grant_failed') as string);
    } finally {
      setIsFormBusy(false);
    }
  };

  // Only show users that don't have DocuNinja access
  const availableUsers = usersWithStatus.filter(user => !user.hasDocuNinjaAccess);
  const selectedUsers = availableUsers.filter(user =>
    selectedUserIds.includes(user.id)
  );
  const allAvailableSelected = availableUsers.length > 0 && 
    availableUsers.every(user => selectedUserIds.includes(user.id));

  // Check DocuNinja quotas and available users
  const currentDocuNinjaUserCount = docuNinjaUsers?.data?.data?.length || 1;
  const maxDocuNinjaUsers = docuAccount?.num_users || 1;
  const hasAvailableQuota = currentDocuNinjaUserCount < maxDocuNinjaUsers;
  const hasNoAvailableUsers = availableUsers.length === 0;
  const hasQuotaButNoUsers = hasAvailableQuota && hasNoAvailableUsers;



  const pages = [
    {
      name: t('docuninja'),
      href: '/docuninja',
    },
    {
      name: t('users'),
      href: '/docuninja/users',
    },
    {
      name: t('add_user'),
      href: '/docuninja/users/selection',
    },
  ];

  return (
    <Default
      title={t('docuninja')}
      breadcrumbs={pages}
      onCancelClick={() => {
        if (isFormBusy) {
          return;
        }

        navigate('/docuninja/users');
      }}
      onSaveClick={handleGrantAccess}
      saveButtonLabel={isFormBusy ? t('processing') : t('add')}
      disableSaveButton={selectedUserIds.length === 0 || isFormBusy}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('docuninja')}</h1>
          <p className="text-gray-600 mt-1">
            {t('docuninja_grant_access_help')}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card title={t('users')} className="shadow-sm" withoutBodyPadding>
              {isLoadingInvoiceUsers ? (
                <div className="px-6 py-10 text-center text-sm text-gray-500">
                  {t('loading')}...
                </div>
              ) : hasQuotaButNoUsers ? (
                <div className="px-6 py-10 text-center">
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
                <div className="px-6 py-10 text-center">
                  <div className="text-gray-500">{t('max_users_reached')}</div>
                  <div className="text-center py-4 space-x-2">
                    <span>{t('user_limit_reached')}</span>
                    <span className="text-blue-500">
                      <Link to="/settings/account_management">{t('upgrade')}</Link>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="divide-y">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={allAvailableSelected}
                        onValueChange={() => {
                          const newCheckedState = !allAvailableSelected;
                          handleSelectAll(newCheckedState);
                        }}
                        disabled={availableUsers.length === 0 || isFormBusy}
                      />
                      <div>
                        <div className="font-medium">{t('all')}</div>
                        <div className="text-xs text-gray-500">
                          {availableUsers.length} {t('users')}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{t('available')}</div>
                  </div>

                  {availableUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between px-6 py-4 ${
                          isSelected ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onValueChange={() => {
                              const newCheckedState = !isSelected;
                              handleUserSelection(user.id, newCheckedState);
                            }}
                            disabled={isFormBusy}
                          />
                          <div>
                            <div className="font-medium">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {isSelected ? t('selected') : t('available')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {selectedUserIds.length > 0 && (
              <Card title={t('permissions')} className="shadow-sm">
                <Permissions
                  user={{
                    company_user: { is_admin: isAdmin },
                    permissions: permissions,
                  } as any}
                  setUser={() => {}}
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
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card
              title={`${t('selected')} ${t('users')}`}
              className="shadow-sm"
              withoutBodyPadding
            >
              <div className="divide-y">
                <Element leftSide={t('selected')}>
                  <span className="font-medium">{selectedUserIds.length}</span>
                </Element>
                <Element leftSide={t('users')}>
                  <span>
                    {currentDocuNinjaUserCount} / {maxDocuNinjaUsers}
                  </span>
                </Element>
                <div className="px-6 py-4">
                  <div className="text-sm font-medium">{t('users')}</div>
                  {selectedUsers.length === 0 ? (
                    <div className="text-sm text-gray-500 mt-2">
                      {t('select')}
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {selectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="rounded-md border border-gray-200 px-3 py-2"
                        >
                          <div className="text-sm font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Default>
  );
}
