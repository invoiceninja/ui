/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCallback } from 'react';
import { DEFAULT_TAB } from '../constants/default-tab';
import { useReactSettings } from './useReactSettings';

const DEFAULT_TAB_ENTITIES = ['/invoices/', '/recurring_invoices/', '/quotes/'];

const isDefaultTabRoute = (path: string) => {
  return (
    DEFAULT_TAB_ENTITIES.some((entity) => path.startsWith(entity)) &&
    (path.endsWith('/create') || path.endsWith('/edit'))
  );
};

export const useDefaultTab = () => {
  const reactSettings = useReactSettings();

  return reactSettings.preferences?.default_tab ?? DEFAULT_TAB;
};

export const useDefaultTabUrl = () => {
  const defaultTab = useDefaultTab();

  return useCallback(
    (url: string) => {
      const [path, query = ''] = url.split('?');

      if (
        defaultTab === DEFAULT_TAB ||
        !isDefaultTabRoute(path) ||
        /(^|&)table=/.test(query)
      ) {
        return url;
      }

      return `${path}?${query ? `${query}&` : ''}table=${defaultTab}`;
    },
    [defaultTab]
  );
};
