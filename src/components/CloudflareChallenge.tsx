/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Spinner } from './Spinner';
import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';

interface Props {
  children: React.ReactNode;
}

export function CloudflareChallenge({ children }: Props) {
  const { isLoading, isError } = useQuery({
    queryKey: ['/api/v1/signup/protect'],
    queryFn: () =>
      request('GET', endpoint('/api/v1/signup/protect'), null, {
        withCredentials: true,
      }),
    enabled: isHosted(),
  });

  if (isSelfHosted()) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="m-3">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="m-3">
        There was an issue loading the page. Please refresh page and try again.
      </p>
    );
  }

  return <>{children}</>;
}
