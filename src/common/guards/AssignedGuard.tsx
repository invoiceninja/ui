/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from 'react-query';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ReactNode, useEffect, useState } from 'react';
import { request } from '../helpers/request';
import { endpoint } from '../helpers';

interface Props {
  apiEndpoint: string;
  entityId: string;
  cacheEndpoint: string;
  component: ReactNode;
}
export function AssignedGuard({
  apiEndpoint,
  entityId,
  cacheEndpoint,
  component,
}: Props) {
  const user = useCurrentUser();
  const queryClient = useQueryClient();

  const [isAssigned, setIsAssigned] = useState<boolean>(false);

  useEffect(() => {
    if (user && entityId) {
      (async () => {
        const entityResponse = await queryClient.fetchQuery(
          [cacheEndpoint, entityId],
          () =>
            request('GET', endpoint(apiEndpoint, { id: entityId })).then(
              (response) => response.data.data
            ),
          { staleTime: Infinity }
        );

        if (
          entityResponse &&
          (entityResponse.user_id === user.id ||
            entityResponse.assigned_user_id === user.id)
        ) {
          setIsAssigned(true);
        }
      })();
    }
  }, []);

  if (isAssigned) {
    return <>{component}</>;
  }

  return <></>;
}
