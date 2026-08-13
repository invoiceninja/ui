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
  persistQueryClientRestore,
  persistQueryClientSubscribe,
  removeOldestQuery,
} from '@tanstack/react-query-persist-client';
import dayjs from 'dayjs';
import { version } from '$app/common/helpers/version';

const QUERY_CACHE_KEY = 'X-NINJA-QUERY-CACHE';

const ACTIVE_TAB_KEY = 'X-NINJA-ACTIVE-TAB';

const MAX_AGE = 1000 * 60 * 60 * 24;

const THROTTLE_TIME = 2000;

const HEARTBEAT_INTERVAL = 5000;

const HEARTBEAT_TIMEOUT = 15000;

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: QUERY_CACHE_KEY,
  throttleTime: THROTTLE_TIME,
  retry: removeOldestQuery,
});

const shouldDehydrateMutation = () => {
  return false;
};

const isPageReload = () => {
  const [navigation] = performance.getEntriesByType(
    'navigation'
  ) as PerformanceNavigationTiming[];

  return navigation?.type === 'reload';
};

const hasActiveTab = () => {
  const lastBeat = Number(localStorage.getItem(ACTIVE_TAB_KEY)) || 0;

  return dayjs().diff(dayjs(lastBeat)) < HEARTBEAT_TIMEOUT;
};

const beat = () => {
  localStorage.setItem(ACTIVE_TAB_KEY, dayjs().valueOf().toString());
};

const startHeartbeat = () => {
  beat();

  setInterval(beat, HEARTBEAT_INTERVAL);
};

export const dropQueryCache = (queryClient?: QueryClient) => {
  localStorage.removeItem(QUERY_CACHE_KEY);

  queryClient?.clear();
};

export const restoreQueryCache = async (queryClient: QueryClient) => {
  if (!localStorage.getItem('X-NINJA-TOKEN')) {
    dropQueryCache();
  }

  const shouldRefetch = isPageReload() || !hasActiveTab();

  startHeartbeat();

  await persistQueryClientRestore({
    queryClient,
    persister,
    maxAge: MAX_AGE,
    buster: version,
  });

  persistQueryClientSubscribe({
    queryClient,
    persister,
    buster: version,
    dehydrateOptions: {
      shouldDehydrateMutation,
    },
  });

  if (shouldRefetch) {
    queryClient.invalidateQueries();
  }
};
