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
import { docuNinjaService } from '$app/common/services/DocuNinjaService';

export type DocuNinjaRole = 'admin' | 'owner' | 'editor' | 'viewer' | 'user';

export function docuNinjaRole(role: DocuNinjaRole): DocuNinjaGuard {
  return ({ docuData }: { docuData?: DocuNinjaData }) => {
    // Use global service data if no docuData provided
    const data = docuData || docuNinjaService.getDocuData();
    
    if (!data) {
      return Promise.resolve(false);
    }

    const companyUser = data.company_user;
    if (!companyUser) {
      return Promise.resolve(false);
    }

    switch (role) {
      case 'owner':
        return Promise.resolve(Boolean(companyUser.is_owner));
      case 'admin':
        return Promise.resolve(Boolean(companyUser.is_admin));
      case 'editor':
        return Promise.resolve(Boolean(
          companyUser.is_admin || 
          companyUser.is_owner || 
          hasEditPermissions(data)
        ));
      case 'viewer':
        return Promise.resolve(Boolean(
          companyUser.is_admin || 
          companyUser.is_owner || 
          hasViewPermissions(data)
        ));
      case 'user':
        return Promise.resolve(Boolean(companyUser));
      default:
        return Promise.resolve(false);
    }
  };
}

export function docuNinjaHasRole(roles: DocuNinjaRole[]): DocuNinjaGuard {
  return async (ctx) => {
    const results = await Promise.all(roles.map(role => docuNinjaRole(role)(ctx)));
    return results.some(result => result === true);
  };
}

function hasEditPermissions(data: DocuNinjaData): boolean {
  const permissions = data.permissions || [];
  return permissions.some((p: any) => p.permission_id === 2); // edit permission
}

function hasViewPermissions(data: DocuNinjaData): boolean {
  const permissions = data.permissions || [];
  return permissions.some((p: any) => p.permission_id === 1); // view permission
}
