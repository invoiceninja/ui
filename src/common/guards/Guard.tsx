/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { Unauthorized } from 'pages/errors/401';
import { useEffect, useState } from 'react';

interface Props {
  guards: { (): boolean }[];
  component: JSX.Element;
}

export function Guard(props: Props) {
  const [pass, setPass] = useState(false);
  const user = useCurrentUser();

  const check = () => {
    for (let index = 0; index < props.guards.length; index++) {
      const pass = props.guards[index]();

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

  if (pass) {
    return props.component;
  }

  return <Unauthorized />;
}
