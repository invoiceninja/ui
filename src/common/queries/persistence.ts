/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { version } from '$app/common/helpers/version';
import { QueryClient } from 'react-query';
import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';

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

  await persistQueryClient({
    queryClient,
    persistor: createWebStoragePersistor({
      storage: window.localStorage,
      key: QUERY_CACHE_KEY,
      throttleTime: THROTTLE_TIME,
    }),
    maxAge: MAX_AGE,
    buster: version,
    dehydrateOptions: {
      dehydrateMutations: false,
    },
  });

  queryClient.invalidateQueries();
};
