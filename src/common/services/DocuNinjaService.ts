/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { AxiosResponse } from 'axios';
import { get } from 'lodash';
import collect from 'collect.js';
import { store } from '$app/common/stores/store';
import { Company } from '$app/common/interfaces/company';

export interface DocuNinjaAccount {
  id: string;
  plan: string;
  plan_expires: string;
  num_users: number;
}

export interface DocuNinjaCompany {
  id: string;
  ninja_company_key: string;
  name: string;
}

export interface DocuNinjaUser {
  id: string;
  email: string;
  is_admin: boolean;
  is_owner: boolean;
  permissions?: DocuNinjaPermission[];
}

export interface DocuNinjaPermission {
  model: string;
  permission_id: number;
  action?: string;
}

export interface DocuNinjaData {
  account: DocuNinjaAccount;
  companies: DocuNinjaCompany[];
  company_user: DocuNinjaUser;
  permissions?: DocuNinjaPermission[];
}

export interface DocuNinjaState {
  data: DocuNinjaData | null;
  isLoading: boolean;
  error: Error | null;
  isInitialized: boolean;
}

class DocuNinjaService {
  private state: DocuNinjaState = {
    data: null,
    isLoading: false,
    error: null,
    isInitialized: false,
  };

  private listeners: Set<(state: DocuNinjaState) => void> = new Set();

  constructor() {
    // Initialize on service creation
    this.initialize();
  }

  private async initialize() {
    if (this.state.isInitialized) {
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const company = this.getCurrentCompany();
      
      if (!company?.company_key) {
        this.setState({ 
          isLoading: false, 
          isInitialized: true,
          data: null 
        });
        return;
      }

      const response = await request(
        'POST',
        endpoint('/api/docuninja/login'),
        {},
        { skipIntercept: true }
      );

      const docuData = response.data.data;
      
      // Store company ID in localStorage
      const c = collect(get(docuData, 'companies', []))
        .where('ninja_company_key', company.company_key)
        .first() as { id: string } | undefined;

      if (c) {
        localStorage.setItem('DOCUNINJA_COMPANY_ID', c.id);
      }

      this.setState({
        data: docuData,
        isLoading: false,
        error: null,
        isInitialized: true,
      });

    } catch (error) {
      // Handle 401 errors gracefully (no account exists)
      if ((error as any)?.response?.status === 401) {
        this.setState({
          data: null,
          isLoading: false,
          error: null,
          isInitialized: true,
        });
      } else {
        this.setState({
          data: null,
          isLoading: false,
          error: error as Error,
          isInitialized: true,
        });
      }
    }
  }

  private getCurrentCompany(): Company | null {
    const state = store.getState();
    const currentIndex = state.companyUsers.currentIndex;
    return state.companyUsers.api?.[currentIndex]?.company || null;
  }

  private setState(updates: Partial<DocuNinjaState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  public subscribe(listener: (state: DocuNinjaState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): DocuNinjaState {
    return this.state;
  }

  public async refresh(): Promise<void> {
    this.state.isInitialized = false;
    await this.initialize();
  }

  public async createAccount(): Promise<void> {
    try {
      await request(
        'POST',
        endpoint('/api/docuninja/create'),
        {},
        { skipIntercept: true }
      );
      
      // Refresh data after creation
      await this.refresh();
    } catch (error) {
      throw error;
    }
  }

  public getDocuData(): DocuNinjaData | null {
    return this.state.data;
  }

  public isPaidUser(): boolean {
    const account = this.state.data?.account;
    if (!account) return false;
    
    return account.plan !== 'free' && 
           new Date(account.plan_expires ?? '') > new Date();
  }

  public hasPermission(model: string, action: string): boolean {
    const data = this.state.data;
    if (!data) return false;

    const companyUser = data.company_user;
    if (!companyUser) return false;

    // Admin and owner have all permissions
    if (companyUser.is_admin || companyUser.is_owner) {
      return true;
    }

    // Check specific permissions
    const permissions = data.permissions || [];
    const permissionId = this.getPermissionId(action);
    
    return permissions.some(p => 
      p.model === model && p.permission_id === permissionId
    );
  }

  private getPermissionId(action: string): number {
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
}

// Global instance
export const docuNinjaService = new DocuNinjaService();

