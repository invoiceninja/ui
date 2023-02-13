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
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { Unauthorized } from 'pages/errors/401';
import { useEffect, useState } from 'react';

export type Guard = (ctx: Context) => Promise<boolean>;

export interface Context {
  companyUser?: CompanyUser;
}

interface Props {
  guards: Guard[];
  component: JSX.Element;
}

export function useGuardContext() {
  const companyUser = useCurrentCompanyUser();

  return { companyUser };
}

export function Guard(props: Props) {
  const [pass, setPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = useCurrentUser();

  const ctx = useGuardContext();

  const check = async () => {
    setLoading(true);

    const values: boolean[] = [];

    for (const guard of props.guards) {
      values.push(await guard(ctx));
    }

    return values;
  };

  useEffect(() => {
    check()
      .then((values) => {

        if (values.includes(false)) {
          return setPass(false);
        }

        return setPass(true);
      })
      .finally(() => setLoading(false));
  }, [user]);

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

  if (pass) {
    return props.component;
  }

  if (loading) {
    return (
      <Default>
        <Spinner />
      </Default>
    );
  }

  return <Unauthorized />;
}
