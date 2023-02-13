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

export function Guard(props: Props) {
  const [pass, setPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { companyUser, queryClient, params, user } = useGuardContext();

  const check = async () => {
    setLoading(true);

    const values: boolean[] = [];

    for (const guard of props.guards) {
      values.push(await guard({ companyUser, queryClient, params, user }));
    }

    return values;
  };

  // useEffect(() => {
  //   check()
  //     .then((values) => {
  //       if (values.includes(false)) {
  //         return setPass(false);
  //       }

  //       return setPass(true);
  //     })
  //     .finally(() => setLoading(false));
  // }, [user]);

  useEffect(() => {
    check()
      .then((values) => {
        if (values.includes(false)) {
          return setPass(false);
        }

        return setPass(true);
      })
      .finally(() => setLoading(false));
  });

  return (
    <>
      {pass && !loading && props.component}

      {loading && (
        <Default>
          <Spinner />
        </Default>
      )}

      {!pass && !loading && <Unauthorized />}
    </>
  );
}
