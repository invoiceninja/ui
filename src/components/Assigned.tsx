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
import { ReactNode, useEffect, useState } from 'react';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';

interface Props {
  apiEndpoint: string;
  entityId: string;
  cacheEndpoint: string;
  component: ReactNode;
  preCheck?: boolean;
}
export function Assigned({
  apiEndpoint,
  entityId,
  cacheEndpoint,
  component,
  preCheck,
}: Props) {
  const user = useCurrentUser();
  const queryClient = useQueryClient();

  const [isAssigned, setIsAssigned] = useState<boolean>(preCheck ?? false);

  useEffect(() => {
    if (user && entityId && !isAssigned) {
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
