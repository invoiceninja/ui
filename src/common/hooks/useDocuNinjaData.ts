/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtom } from 'jotai';
import { 
  docuNinjaDataAtom,
  docuNinjaLoadingAtom,
  docuNinjaErrorAtom,
  docuNinjaInitializedAtom,
  docuNinjaTokenReadyAtom,
  docuNinjaIsAdminAtom,
  docuNinjaIsPaidUserAtom,
  docuNinjaAccountAtom,
  docuNinjaCompaniesAtom
} from '$app/common/atoms/docuninja';

// Helper function to get permission ID
function getPermissionId(action: string): number {
  const permissionMap: Record<string, number> = {
    view: 1,
    edit: 2,
    delete: 3,
    create: 4,
    requires_approval: 5,
  };
  return permissionMap[action] || 0;
}

// Core permission checking logic
function checkPermission(
  data: any,
  model: string,
  action: string
): boolean {
  if (!data?.company_user) {
    return false;
  }  
  
  const permissions = data.permissions || data.company_user?.permissions || [];

  console.log(permissions);
  const { company_user } = data;
  
  // Admin/owner has all permissions
  if (company_user.is_admin || company_user.is_owner) {
    return true;
  }

  // Check permissions in both company_user.permissions and top-level permissions
  if (permissions.length === 0) {
    return false;
  }

  const requestedPermissionId = getPermissionId(action);
  
  console.log(requestedPermissionId);

  // Check for exact permission match
  const hasExactPermission = permissions.some((p: any) =>
    p.model === model && 
    p.permission_id === requestedPermissionId &&
    p.permissionable_id === null
  );

  if (hasExactPermission) {
    console.log('Has exact permission');
    return true;
  }

  // Check for hierarchical permissions (EDIT/CREATE includes VIEW)
  if (action === 'view') {
    const hasEditPermission = permissions.some((p: any) =>
      p.model === model && 
      p.permission_id === getPermissionId('edit') &&
      p.permissionable_id === null
    );
    
    const hasCreatePermission = permissions.some((p: any) =>
      p.model === model && 
      p.permission_id === getPermissionId('create') &&
      p.permissionable_id === null
    );
    
    return hasEditPermission || hasCreatePermission;
  }

  return false;
}

// Data accessor hooks (read-only, no queries)
export function useDocuNinjaData() {
  const [data] = useAtom(docuNinjaDataAtom);
  return data;
}

export function useDocuNinjaLoading() {
  const [loading] = useAtom(docuNinjaLoadingAtom);
  return loading;
}

export function useDocuNinjaError() {
  const [error] = useAtom(docuNinjaErrorAtom);
  return error;
}

export function useDocuNinjaInitialized() {
  const [initialized] = useAtom(docuNinjaInitializedAtom);
  return initialized;
}

export function useDocuNinjaTokenReady() {
  const [tokenReady] = useAtom(docuNinjaTokenReadyAtom);
  return tokenReady;
}

export function useDocuNinjaIsAdmin() {
  const [isAdmin] = useAtom(docuNinjaIsAdminAtom);
  return isAdmin;
}

export function useDocuNinjaIsPaidUser() {
  const [isPaidUser] = useAtom(docuNinjaIsPaidUserAtom);
  return isPaidUser;
}

// Derived data hooks
export function useDocuNinjaAccount() {
  const [account] = useAtom(docuNinjaAccountAtom);
  return account;
}

export function useDocuNinjaCompanies() {
  const [companies] = useAtom(docuNinjaCompaniesAtom);
  return companies;
}

// Permission checking hook
export function useDocuNinjaPermission(model: string, action: string): boolean {
  const [data] = useAtom(docuNinjaDataAtom);
  return checkPermission(data, model, action);
}

// Helper hook for multiple permissions
export function useDocuNinjaHasAnyPermission(permissions: Array<{model: string, action: string}>): boolean {
  const [data] = useAtom(docuNinjaDataAtom);
  
  if (!data) {
    return false;
  }
  
  return permissions.some(({ model, action }) => 
    checkPermission(data, model, action)
  );
}
