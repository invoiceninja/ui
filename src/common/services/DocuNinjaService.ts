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
import collect from 'collect.js';
import { store } from '$app/common/stores/store';
import { Company } from '$app/common/interfaces/company.interface';
import { QueryClient } from 'react-query';
import { Settings } from '$app/common/interfaces/docuninja/api';

export interface DocuNinjaAccount {
  id: string;
  plan: string;
  plan_expires: string;
  num_users: number;
  users?: DocuNinjaUser[];
}

export interface DocuNinjaCompany {
  id: string;
  ninja_company_key: string;
  name: string;
  token: string;
  settings?: Settings;
}

export interface DocuNinjaUser {
  id: string;
  email: string;
  is_admin: boolean;
  is_owner: boolean;
  permissions?: DocuNinjaPermission[];
  company_user?: {
    id: string;
    user_id: string;
    company_id: string;
    is_admin: boolean;
    is_owner: boolean;
    [key: string]: any;
  };
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
  isTokenReady: boolean;
}

class DocuNinjaService {
  private state: DocuNinjaState = {
    data: null,
    isLoading: false,
    error: null,
    isInitialized: false,
    isTokenReady: false,
  };

  private listeners: Set<(state: DocuNinjaState) => void> = new Set();
  private currentCompanyKey: string | null = null;
  private storeUnsubscribe: (() => void) | null = null;

  constructor() {
    // Don't initialize immediately - wait for company data to be available
    this.waitForCompanyData();
    this.setupCompanyChangeListener();
  }

  private setupCompanyChangeListener() {
    // Listen for company changes to flush DocuNinja data
    this.storeUnsubscribe = store.subscribe(() => {
      const company = this.getCurrentCompany();
      const newCompanyKey = company?.company_key || null;
      
      // If company key changed, flush all DocuNinja data
      if (this.currentCompanyKey !== null && this.currentCompanyKey !== newCompanyKey) {
        this.flushData();
        this.currentCompanyKey = newCompanyKey;
        
        // Re-initialize for the new company if it has a key
        if (newCompanyKey) {
          this.waitForCompanyData();
        }
      } else if (this.currentCompanyKey === null && newCompanyKey) {
        // First time setting company key
        this.currentCompanyKey = newCompanyKey;
      }
    });
  }

  private async waitForCompanyData() {
    // Subscribe to store changes to detect when company data is loaded
    const unsubscribe = store.subscribe(() => {
      const company = this.getCurrentCompany();
      if (company?.company_key) {
        unsubscribe(); // Stop listening
        this.initialize();
      }
    });
    
    // Also check immediately in case data is already loaded
    const company = this.getCurrentCompany();
    if (company?.company_key) {
      unsubscribe();
      await this.initialize();
    }
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
          data: null,
          isTokenReady: false
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
      
      // Find the matching company by ninja_company_key
      const companies = docuData.companies || [];
      const matchingCompany = collect(companies)
        .where('ninja_company_key', company.company_key)
        .first() as { id: string; token: string } | undefined;


      if (matchingCompany) {
        // Store the company-specific token
        localStorage.setItem('X-DOCU-NINJA-TOKEN', matchingCompany.token);
        localStorage.setItem('DOCUNINJA_COMPANY_ID', matchingCompany.id);
      }

      this.setState({
        data: docuData,
        isLoading: false,
        error: null,
        isInitialized: true,
        isTokenReady: !!matchingCompany,
      });

    } catch (error) {
      // Handle 401 errors gracefully (no account exists)
      if ((error as any)?.response?.status === 401) {
        this.setState({
          data: null,
          isLoading: false,
          error: null,
          isInitialized: true,
          isTokenReady: false,
        });
      } else {
        this.setState({
          data: null,
          isLoading: false,
          error: error as Error,
          isInitialized: true,
          isTokenReady: false,
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
    await request(
      'POST',
      endpoint('/api/docuninja/create'),
      {},
      { skipIntercept: true }
    );
    
    // Refresh data after creation
    await this.refresh();
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

  public getToken(): string | null {
    return localStorage.getItem('X-DOCU-NINJA-TOKEN');
  }

  public flushData(): void {
    // Clear all DocuNinja data
    this.setState({
      data: null,
      isLoading: false,
      error: null,
      isInitialized: false,
      isTokenReady: false,
    });

    // Clear localStorage tokens
    localStorage.removeItem('X-DOCU-NINJA-TOKEN');
    localStorage.removeItem('DOCUNINJA_COMPANY_ID');
    
    // Reset company key tracking
    this.currentCompanyKey = null;
  }

  public flushDataWithQueryClient(queryClient: QueryClient): void {
    // Clear DocuNinja data
    this.flushData();
    
    // Clear React Query cache for DocuNinja endpoints
    queryClient.removeQueries({ queryKey: ['/api/docuninja/login'] });
    queryClient.removeQueries({ queryKey: ['docuninja_users'] });
    queryClient.removeQueries({ queryKey: ['docuninja_account'] });
  }

  public destroy(): void {
    // Clean up store subscription
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = null;
    }
    
    // Clear listeners
    this.listeners.clear();
    
    // Flush data
    this.flushData();
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

