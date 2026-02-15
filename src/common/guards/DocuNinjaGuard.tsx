/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Fallback } from '$app/components/Fallback';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { SubPageUnauthorized, Unauthorized } from '$app/pages/errors/401';
import { useEffect, useState } from 'react';
import { QueryClient, useQueryClient } from 'react-query';
import { Params, useParams } from 'react-router-dom';
import { useCurrentCompanyUser } from '$app/common/hooks/useCurrentCompanyUser';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { User } from '$app/common/interfaces/user';
import { SettingsLevel } from '../stores/slices/settings';
import { useActiveSettingsDetails } from '../hooks/useActiveSettingsDetails';
import { DocuNinjaData } from '$app/common/interfaces/docuninja/api';
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';


export type DocuNinjaGuard = (ctx: DocuNinjaContext) => Promise<boolean>;

export interface DocuNinjaContext {
  queryClient: QueryClient;
  params: Params<string>;
  user: User | undefined;
  companyUser: CompanyUser | undefined;
  settingsLevel: SettingsLevel;
  docuData?: DocuNinjaData;
}

// DocuNinjaData is now imported from atoms

export interface DocuNinjaPermission {
  model: string;
  permission_id: number;
  action?: string;
}

export interface DocuNinjaGuardProps {
  guards: DocuNinjaGuard[];
  component: React.ReactElement;
  type?: 'page' | 'subPage' | 'component';
  docuData?: DocuNinjaData;
}

//@todo - do we really need to pass docuData as a prop?
export function useDocuNinjaGuardContext(docuData?: DocuNinjaData) {
  const queryClient = useQueryClient();
  const params = useParams();
  const user = useCurrentUser();
  const companyUser = useCurrentCompanyUser();
  const activeSettings = useActiveSettingsDetails();
  
  // Get DocuNinja data from unified atoms (NO QUERY!)
  const [unifiedDocuData] = useAtom(docuNinjaAtom);

  // Use provided docuData, unified data, or null if not available
  const globalDocuData = docuData || unifiedDocuData || null;

  return {
    queryClient,
    params,
    user,
    companyUser,
    settingsLevel: activeSettings.level,
    docuData: globalDocuData,
  };
}

enum DocuNinjaState {
  Authorized = 'authorized',
  Loading = 'loading',
  Unauthorized = 'unauthorized',
}

export function DocuNinjaGuard({ guards, component, type = 'page', docuData }: DocuNinjaGuardProps) {
  const [state, setState] = useState<DocuNinjaState>(DocuNinjaState.Loading);
  const { companyUser, queryClient, params, user, settingsLevel, docuData: contextDocuData } =
    useDocuNinjaGuardContext(docuData);

  useEffect(() => {
    const promises = guards.map((guard) =>
      guard({ companyUser, queryClient, params, user, settingsLevel, docuData: contextDocuData || undefined })
    );

    Promise.all(promises)
      .then((values) => {
        values.includes(false)
          ? setState(DocuNinjaState.Unauthorized)
          : setState(DocuNinjaState.Authorized);
      })
      .catch((error) => {
        setState(DocuNinjaState.Unauthorized);
      });
  }, [guards, companyUser, queryClient, params, user, settingsLevel, contextDocuData]);

  if (state === DocuNinjaState.Loading) {
    return type === 'page' ? (
      <Default breadcrumbs={[]}>
        <Spinner />
      </Default>
    ) : (
      <Spinner />
    );
  }

  if (state === DocuNinjaState.Unauthorized) {
    if (type === 'page') {
      return <Unauthorized />;
    }

    if (type === 'subPage') {
      return <SubPageUnauthorized />;
    }

    return null;
  }

  return <Fallback type={type}>{component}</Fallback>;
}
