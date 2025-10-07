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

export function docuNinjaAdmin(): DocuNinjaGuard {
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

    return Promise.resolve(Boolean(companyUser.is_admin));
  };
}

export function docuNinjaOwner(): DocuNinjaGuard {
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

    return Promise.resolve(Boolean(companyUser.is_owner));
  };
}

export function docuNinjaAdminOrOwner(): DocuNinjaGuard {
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

    return Promise.resolve(Boolean(companyUser.is_admin || companyUser.is_owner));
  };
}

export function docuNinjaHasData(): DocuNinjaGuard {
  return ({ docuData }: { docuData?: DocuNinjaData }) => {
    // Use global service data if no docuData provided
    const data = docuData || docuNinjaService.getDocuData();
    return Promise.resolve(Boolean(data));
  };
}

export function docuNinjaHasCompanyUser(): DocuNinjaGuard {
  return ({ docuData }: { docuData?: DocuNinjaData }) => {
    // Use global service data if no docuData provided
    const data = docuData || docuNinjaService.getDocuData();
    
    if (!data) {
      return Promise.resolve(false);
    }

    return Promise.resolve(Boolean(data.company_user));
  };
}

export function docuNinjaHasPermissions(): DocuNinjaGuard {
  return ({ docuData }: { docuData?: DocuNinjaData }) => {
    // Use global service data if no docuData provided
    const data = docuData || docuNinjaService.getDocuData();
    
    if (!data) {
      return Promise.resolve(false);
    }

    const permissions = data.permissions || [];
    return Promise.resolve(permissions.length > 0);
  };
}
