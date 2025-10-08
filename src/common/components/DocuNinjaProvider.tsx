/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode } from 'react';
import { useQuery } from 'react-query';
import { useSetAtom } from 'jotai';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { Account } from '$app/common/interfaces/docuninja/api';
import collect from 'collect.js';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';

interface DocuNinjaProviderProps {
  children: ReactNode;
}

export function DocuNinjaProvider({ children }: DocuNinjaProviderProps) {
  const company = useCurrentCompany();
  
  const setData = useSetAtom(docuNinjaAtom);

  // SINGLE QUERY - Only runs here, never in components
  useQuery(
    ['/api/docuninja/login', company?.company_key],
    async () => {
      if (!company?.company_key) {
        throw new Error('No company key available');
      }

      try {
        const response = await request(
          'POST',
          endpoint('/api/docuninja/login'),
          {},
          { skipIntercept: true }
        );

        const docuData = response.data.data as Account;
        
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

        // Update atom with the data
        setData(docuData);
        return docuData;

      } catch (error: any) {
        // Handle 401 errors gracefully (no account exists)
        if (error?.response?.status === 401) {
          setData(undefined);
        } else {
          setData(undefined);
        }
        
        throw error;
      }
    },
    {
      enabled: !!company?.company_key,
      staleTime: 0, // Always refetch when company changes
      retry: (failureCount, error) => {
        // Don't retry on 401 errors (expected when no account exists)
        if ((error as any)?.response?.status === 401) {
          return false;
        }
        // Retry other errors up to 3 times
        return failureCount < 3;
      },
    }
  );
  
  return <>{children}</>;
}
