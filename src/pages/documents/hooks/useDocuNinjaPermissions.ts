/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useDocuNinjaData, useDocuNinjaInitialized } from '$app/common/hooks/useDocuNinja';
import { DocuNinjaData } from '$app/common/services/DocuNinjaService';

// Helper function to get permission ID
function getPermissionId(action: string): number {
  const permissionMap: Record<string, number> = {
    view: 1,
    create: 2,
    edit: 3,
    delete: 4,
  };
  return permissionMap[action] || 0;
}

// Core permission checking logic (synchronous version)
function checkPermissionSync(
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

// Hook to check if user has specific permission
export function useDocuNinjaPermission(model: string, action: string): boolean {
  const docuData = useDocuNinjaData();
  const isInitialized = useDocuNinjaInitialized();
  
  // Return false if not initialized yet (prevents flash of wrong state)
  if (!isInitialized) {
    return false;
  }
  
  return checkPermissionSync(docuData, model, action);
}

// Hook to check if user is admin
export function useDocuNinjaAdmin(): boolean {
  const docuData = useDocuNinjaData();
  const isInitialized = useDocuNinjaInitialized();
  
  // Return false if not initialized yet (prevents flash of wrong state)
  if (!isInitialized) {
    return false;
  }
  
  if (!docuData?.company_user) {
    return false;
  }

  return docuData.company_user.is_admin || docuData.company_user.is_owner;
}

// Hook to check if user has any of the specified permissions
export function useDocuNinjaHasAnyPermission(permissions: Array<{model: string, action: string}>): boolean {
  const docuData = useDocuNinjaData();
  const isInitialized = useDocuNinjaInitialized();
  
  // Return false if not initialized yet (prevents flash of wrong state)
  if (!isInitialized) {
    return false;
  }
  
  return permissions.some(({ model, action }) => 
    checkPermissionSync(docuData, model, action)
  );
}
