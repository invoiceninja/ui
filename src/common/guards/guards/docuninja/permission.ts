/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DocuNinjaGuard, DocuNinjaData } from '../../DocuNinjaGuard';

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

// Helper function to get DocuNinja data from React Query cache (DEPRECATED - use unified atoms)
function getDocuDataFromCache(queryClient: any): Promise<DocuNinjaData | null> {
  // This is now deprecated - data should come from unified atoms
  return Promise.resolve(null);
}

function isAdmin(data: DocuNinjaData | null){

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

// Core permission checking logic
function checkPermission(
  data: DocuNinjaData | null,
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
  return ({ docuData }: { docuData?: DocuNinjaData; queryClient: any }) => {
    // Use provided docuData or return false if not available
    const data = docuData || null;
    return Promise.resolve(checkPermission(data, permission.model, permission.action));
  };
}

export function docuNinjaAdmin(): DocuNinjaGuard {
  return ({ docuData }: { docuData?: DocuNinjaData; queryClient: any }) => {
    // Use provided docuData or return false if not available
    const data = docuData || null;
    return Promise.resolve(isAdmin(data));
  };
}
