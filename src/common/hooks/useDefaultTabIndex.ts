/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSearchParams } from 'react-router-dom';
import { DEFAULT_TAB, DEFAULT_TABS } from '../constants/default-tab';
import { useReactSettings } from './useReactSettings';

export const useDefaultTabIndex = () => {
  const [searchParams] = useSearchParams();

  const reactSettings = useReactSettings();

  const defaultTab = reactSettings.preferences?.default_tab ?? DEFAULT_TAB;
  const currentTab = searchParams.get('table') ?? defaultTab;
  const currentTabIndex = DEFAULT_TABS.findIndex((tab) => tab === currentTab);

  return currentTabIndex === -1 ? 0 : currentTabIndex;
};
