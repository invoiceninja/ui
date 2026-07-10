/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import collect from 'collect.js';
import { useSetAtom } from 'jotai';
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { DocuNinjaData } from '$app/common/interfaces/docuninja/api';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';

interface DocuNinjaProviderProps {
  children: ReactNode;
}

export function DocuNinjaProvider({ children }: DocuNinjaProviderProps) {
  const company = useCurrentCompany();
  const navigate = useNavigate();

  const setData = useSetAtom(docuNinjaAtom);

  // SINGLE QUERY - Only runs once, never refetches unless invalidated
  const { isPending, error } = useQuery({
    queryKey: ['/api/docuninja/login'],

    queryFn: // Fixed query key - no company dependency
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

          const docuData = response.data.data as DocuNinjaData;

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

    enabled: !!company?.company_key,

    // Never refetch unless invalidated
    staleTime: Infinity,

    // Keep in cache forever
    gcTime: Infinity,

    retry: false,
  });

  useEffect(() => {
    if (error) {
      navigate('/docuninja/beta?ie=true');
    }
  }, [error, navigate]);

  if (isPending) {
    return (
      <Default breadcrumbs={[]}>
        <Spinner />
      </Default>
    );
  }

  return <>{children}</>;
}
