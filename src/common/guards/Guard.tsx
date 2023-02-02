/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyUser } from 'common/hooks/useCurrentCompanyUser';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { CompanyUser } from 'common/interfaces/company-user';
import { Company } from 'common/interfaces/company.interface';
import { User } from 'common/interfaces/user';
import { Unauthorized } from 'pages/errors/401';
import { useEffect, useState } from 'react';
import { QueryClient, useQueryClient } from 'react-query';
import { Params, useParams } from 'react-router-dom';

export type SyncGuardFunction = () => (ctx: GuardContext) => boolean;

export type AsyncGuardFunction = () => (
  ctx: GuardContext
) => boolean | Promise<boolean>;

interface Props {
  guards: AsyncGuardFunction[];
  component: JSX.Element;
}

export interface GuardContext {
  user?: User;
  companyUser?: CompanyUser;
  company?: Company;
  params: Readonly<Params<string>>;
  queryClient: QueryClient;
}

export function Guard(props: Props) {
  const [pass, setPass] = useState(false);

  const companyUser = useCurrentCompanyUser();
  const user = useCurrentUser();
  const params = useParams();
  const queryClient = useQueryClient();
  const company = useCurrentCompany();

  const check = async () => {
    for (let index = 0; index < props.guards.length; index++) {
      const pass = await props.guards[index]()({
        user,
        companyUser,
        company,
        params,
        queryClient,
      });

      if (pass) {
        setPass(true);

        continue;
      }

      setPass(false);

      break;
    }
  };

  useEffect(() => {
    check();
  }, [user]);

  useEffect(() => {
    check();
  });

  // if (isLoading) {
  //   return (
  //     <Default>
  //       <div className="flex flex-col items-center mt-14 space-y-4">
  //         <Spinner />
  //       </div>
  //     </Default>
  //   );
  // }

  if (pass) {
    return props.component;
  }

  return <Unauthorized />;
}
