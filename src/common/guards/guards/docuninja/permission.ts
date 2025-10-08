/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DocuNinjaGuard } from '../../DocuNinjaGuard';
import { Account } from '$app/common/interfaces/docuninja/api';
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';

export type DocuNinjaPermission = {
  model: 'documents' | 'templates' | 'blueprints' | 'clients' | 'users' | 'settings';
  action: 'view' | 'create' | 'edit' | 'delete' | 'requires_approval' | 'export' | 'import';
};

function getPermissionId(action: string): number {
  const permissionMap = {
    'view': 1,
    'edit': 2,
    'delete': 3,
    'create': 4,
    'requires_approval': 5,
    'export': 6,
    'import': 7,
  };
  return permissionMap[action as keyof typeof permissionMap] || 0;
}

// Hooks that use useAtom like everything else in the app
export function useDocuNinjaAdmin(): boolean {
  const [data] = useAtom(docuNinjaAtom);
  if (!data?.company_user) {
    return false;
  }

  const { company_user } = data;
  
  // Admin/owner has all permissions
  if (company_user.is_admin || company_user.is_owner) {
    return true;
  }

  return false;
}

export function useDocuNinjaPaidUser(): boolean {
  const [data] = useAtom(docuNinjaAtom);
  if (!data) return false;
  
  return data.plan !== 'free' && 
         new Date(data.plan_expires ?? '') > new Date();
}

export function useDocuNinjaPermission(model: string, action: string): boolean {
  const [data] = useAtom(docuNinjaAtom);
  return checkPermission(data, model, action);
}


// Core permission checking logic
function checkPermission(
  data: Account | undefined,
  model: string,
  action: string
): boolean {
  if (!data?.company_user) {
    return false;
  }
  
  const permissions = data.permissions || [];

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
  
  // Check for exact permission match
  const hasExactPermission = permissions.some((p: any) =>
    p.model === model && 
    p.permission_id === requestedPermissionId &&
    p.permissionable_id === null
  );

  if (hasExactPermission) {
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

export function docuNinjaPermission(permission: DocuNinjaPermission): DocuNinjaGuard {
  return ({ docuData }: { docuData?: Account; queryClient: any }) => {
    // Use provided docuData or return false if not available
    const data = docuData || undefined;
    return Promise.resolve(checkPermission(data, permission.model, permission.action));
  };
}

export function docuNinjaAdmin(): DocuNinjaGuard {
  return ({ docuData }: { docuData?: Account; queryClient: any }) => {
    // Use provided docuData or return false if not available
    const data = docuData || undefined;
    if (!data?.company_user) {
      return Promise.resolve(false);
    }

    const { company_user } = data;
    
    // Admin/owner has all permissions
    if (company_user.is_admin || company_user.is_owner) {
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  };
}
