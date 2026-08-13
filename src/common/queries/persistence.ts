/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import {
  persistQueryClient,
  removeOldestQuery,
} from '@tanstack/react-query-persist-client';
import { version } from '$app/common/helpers/version';

const QUERY_CACHE_KEY = 'X-NINJA-QUERY-CACHE';

const MAX_AGE = 1000 * 60 * 60 * 24;

const THROTTLE_TIME = 2000;

export const dropQueryCache = (queryClient?: QueryClient) => {
  localStorage.removeItem(QUERY_CACHE_KEY);

  queryClient?.clear();
};

export const restoreQueryCache = async (queryClient: QueryClient) => {
  if (!localStorage.getItem('X-NINJA-TOKEN')) {
    dropQueryCache();
  }

  const [, restored] = persistQueryClient({
    queryClient,
    persister: createSyncStoragePersister({
      storage: window.localStorage,
      key: QUERY_CACHE_KEY,
      throttleTime: THROTTLE_TIME,
      retry: removeOldestQuery,
    }),
    maxAge: MAX_AGE,
    buster: version,
    dehydrateOptions: {
      shouldDehydrateMutation: () => false,
    },
  });

  await restored;
};
