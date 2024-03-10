/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompanyUser } from '$app/common/hooks/useCurrentCompanyUser';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { User } from '$app/common/interfaces/user';
import { Fallback } from '$app/components/Fallback';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { SubPageUnauthorized, Unauthorized } from '$app/pages/errors/401';
import { useEffect, useState } from 'react';
import { QueryClient, useQueryClient } from 'react-query';
import { Params, useParams } from 'react-router-dom';
import { SettingsLevel } from '../stores/slices/settings';
import { useActiveSettingsDetails } from '../hooks/useActiveSettingsDetails';

export type Guard = (ctx: Context) => Promise<boolean>;

export interface Context {
  queryClient: QueryClient;
  params: Readonly<Params<string>>;
  companyUser?: CompanyUser;
  user?: User;
  settingsLevel: SettingsLevel;
}

interface Props {
  guards: Guard[];
  component: JSX.Element;
  type?: 'page' | 'component' | 'subPage';
}

export function useGuardContext() {
  const companyUser = useCurrentCompanyUser();
  const queryClient = useQueryClient();
  const params = useParams();
  const user = useCurrentUser();
  const activeSettings = useActiveSettingsDetails();

  return {
    companyUser,
    queryClient,
    params,
    user,
    settingsLevel: activeSettings.level,
  };
}

enum State {
  Authorized = 'authorized',
  Loading = 'loading',
  Unauthorized = 'unauthorized',
}

export function Guard({ guards, component, type = 'page' }: Props) {
  const [state, setState] = useState<State>(State.Loading);
  const { companyUser, queryClient, params, user, settingsLevel } =
    useGuardContext();

  useEffect(() => {
    const promises = guards.map((guard) =>
      guard({ companyUser, queryClient, params, user, settingsLevel })
    );

    Promise.all(promises)
      .then((values) => {
        values.includes(false)
          ? setState(State.Unauthorized)
          : setState(State.Authorized);
      })
      .catch(() => setState(State.Loading));
  });

  if (state === State.Loading) {
    return type === 'page' ? (
      <Default>
        <Spinner />
      </Default>
    ) : (
      <Spinner />
    );
  }

  if (state === State.Unauthorized) {
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
