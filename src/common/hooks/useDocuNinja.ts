/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { docuNinjaService, DocuNinjaState, DocuNinjaData } from '$app/common/services/DocuNinjaService';
import { useQueryClient } from 'react-query';

export function useDocuNinja(): DocuNinjaState {
  const initialState = docuNinjaService.getState();
  const [state, setState] = useState<DocuNinjaState>(initialState);

  useEffect(() => {
    const unsubscribe = docuNinjaService.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
}

export function useDocuNinjaData(): DocuNinjaData | null {
  const { data } = useDocuNinja();
  return data;
}

export function useDocuNinjaLoading(): boolean {
  const { isLoading } = useDocuNinja();
  return isLoading;
}

export function useDocuNinjaError(): Error | null {
  const { error } = useDocuNinja();
  return error;
}

export function useDocuNinjaInitialized(): boolean {
  const { isInitialized } = useDocuNinja();
  return isInitialized;
}

export function useDocuNinjaTokenReady(): boolean {
  const { isTokenReady } = useDocuNinja();
  return isTokenReady;
}

export function useDocuNinjaActions() {
  const queryClient = useQueryClient();
  
  return {
    refresh: () => docuNinjaService.refresh(),
    createAccount: () => docuNinjaService.createAccount(),
    hasPermission: (model: string, action: string) => 
      docuNinjaService.hasPermission(model, action),
    isPaidUser: () => docuNinjaService.isPaidUser(),
    getToken: () => docuNinjaService.getToken(),
    flushData: () => docuNinjaService.flushData(),
    flushDataWithQueryClient: () => docuNinjaService.flushDataWithQueryClient(queryClient),
    reinitialize: () => docuNinjaService.refresh(),
  };
}


