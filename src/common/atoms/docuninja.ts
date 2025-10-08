/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom } from 'jotai';

// DocuNinja data interface
export interface DocuNinjaData {
  account: {
    id: string;
    plan: string;
    plan_expires?: string;
    num_users?: number;
    users?: Array<{
      id: string;
      name: string;
      email: string;
      company_user?: {
        is_admin: boolean;
        is_owner: boolean;
      };
    }>;
  };
  companies: Array<{
    id: string;
    ninja_company_key: string;
    token: string;
    settings?: {
      [key: string]: any;
    };
  }>;
  company_user: {
    id: string;
    is_admin: boolean;
    is_owner: boolean;
    permissions: Array<{
      model: string;
      permission_id: number;
      permissionable_id: string | null;
    }>;
  };
  permissions: Array<{
    model: string;
    permission_id: number;
    permissionable_id: string | null;
  }>;
}

// Main DocuNinja data atom
export const docuNinjaDataAtom = atom<DocuNinjaData | null>(null);

// Loading state atom
export const docuNinjaLoadingAtom = atom<boolean>(false);

// Error state atom
export const docuNinjaErrorAtom = atom<Error | null>(null);

// Initialization state atom
export const docuNinjaInitializedAtom = atom<boolean>(false);

// Token ready state atom
export const docuNinjaTokenReadyAtom = atom<boolean>(false);

// Derived atoms for easy access
export const docuNinjaAccountAtom = atom(
  (get) => get(docuNinjaDataAtom)?.account || null
);

export const docuNinjaCompaniesAtom = atom(
  (get) => get(docuNinjaDataAtom)?.companies || []
);

export const docuNinjaCompanyUserAtom = atom(
  (get) => get(docuNinjaDataAtom)?.company_user || null
);

export const docuNinjaPermissionsAtom = atom(
  (get) => {
    const data = get(docuNinjaDataAtom);
    return data?.permissions || data?.company_user?.permissions || [];
  }
);

// Helper atom to check if user is admin
export const docuNinjaIsAdminAtom = atom(
  (get) => {
    const companyUser = get(docuNinjaCompanyUserAtom);
    return companyUser?.is_admin || companyUser?.is_owner || false;
  }
);

// Helper atom to check if user is paid
export const docuNinjaIsPaidUserAtom = atom(
  (get) => {
    const account = get(docuNinjaAccountAtom);
    if (!account) return false;
    
    return account.plan !== 'free' && 
           new Date(account.plan_expires ?? '') > new Date();
  }
);

// Action atoms for updating state
export const setDocuNinjaDataAtom = atom(
  null,
  (get, set, data: DocuNinjaData | null) => {
    set(docuNinjaDataAtom, data);
    set(docuNinjaInitializedAtom, true);
    set(docuNinjaErrorAtom, null);
  }
);

export const setDocuNinjaLoadingAtom = atom(
  null,
  (get, set, loading: boolean) => {
    set(docuNinjaLoadingAtom, loading);
  }
);

export const setDocuNinjaErrorAtom = atom(
  null,
  (get, set, error: Error | null) => {
    set(docuNinjaErrorAtom, error);
    set(docuNinjaLoadingAtom, false);
  }
);

export const setDocuNinjaTokenReadyAtom = atom(
  null,
  (get, set, tokenReady: boolean) => {
    set(docuNinjaTokenReadyAtom, tokenReady);
  }
);

// Reset atom to clear all DocuNinja data
export const resetDocuNinjaDataAtom = atom(
  null,
  (get, set) => {
    set(docuNinjaDataAtom, null);
    set(docuNinjaLoadingAtom, false);
    set(docuNinjaErrorAtom, null);
    set(docuNinjaInitializedAtom, false);
    set(docuNinjaTokenReadyAtom, false);
  }
);