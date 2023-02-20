/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompanyUser } from 'common/hooks/useCurrentCompanyUser';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { CompanyUser } from 'common/interfaces/company-user';
import { User } from 'common/interfaces/user';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { Unauthorized } from 'pages/errors/401';
import { useEffect, useState } from 'react';
import { QueryClient, useQueryClient } from 'react-query';
import { Params, useParams } from 'react-router-dom';

export type Guard = (ctx: Context) => Promise<boolean>;

export interface Context {
  queryClient: QueryClient;
  params: Readonly<Params<string>>;
  companyUser?: CompanyUser;
  user?: User;
}

interface Props {
  guards: Guard[];
  component: JSX.Element;
}

export function useGuardContext() {
  const companyUser = useCurrentCompanyUser();
  const queryClient = useQueryClient();
  const params = useParams();
  const user = useCurrentUser();

  return { companyUser, queryClient, params, user };
}

enum State {
  Authorized = 'authorized',
  Loading = 'loading',
  Unauthorized = 'unauthorized',
}

export function Guard(props: Props) {
  const [state, setState] = useState<State>(State.Loading);
  const { companyUser, queryClient, params, user } = useGuardContext();

  useEffect(() => {
    const promises = props.guards.map((guard) =>
      guard({ companyUser, queryClient, params, user })
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
    return (
      <Default>
        <Spinner />
      </Default>
    );
  }

  if (state === State.Unauthorized) {
    return <Unauthorized />;
  }

  return props.component;
}
